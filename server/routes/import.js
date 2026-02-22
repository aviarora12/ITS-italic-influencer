const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const sheetsService = require('../services/googleSheets');

function requireAuth(req, res, next) {
  if (!req.session.tokens) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

// Preview data from external sheet before importing
router.post('/preview', requireAuth, async (req, res) => {
  const { urls } = req.body;
  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'urls array required' });
  }

  const results = [];
  const errors = [];

  for (const url of urls) {
    if (!url || !url.trim()) continue;
    try {
      const data = await sheetsService.fetchExternalSheet(req.session.tokens, url.trim());
      const sheetNames = Object.keys(data);
      const preview = {};

      for (const name of sheetNames) {
        const rows = data[name];
        if (rows.length === 0) continue;
        preview[name] = {
          headers: rows[0],
          rowCount: rows.length - 1,
          sample: rows.slice(1, 4), // first 3 data rows
        };
      }

      results.push({ url, sheets: preview, error: null });
    } catch (err) {
      errors.push({ url, error: err.message });
      results.push({ url, sheets: null, error: err.message });
    }
  }

  res.json({ results, errors });
});

// Perform import from external sheets
router.post('/run', requireAuth, async (req, res) => {
  const { urls } = req.body;
  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'urls array required' });
  }

  await sheetsService.getOrCreateSpreadsheet(req.session.tokens);

  const now = new Date().toISOString();
  const allInfluencers = [];
  const allCampaigns = [];
  const allShipments = [];
  const allContracts = [];
  const allContent = [];
  const flaggedRows = [];

  const influencerMap = {}; // name/handle -> id

  function getOrCreateInfluencer(name, handle, email) {
    const key = (name || handle || '').toLowerCase().trim();
    if (influencerMap[key]) return influencerMap[key];
    const id = uuidv4();
    const influencer = {
      'ID': id,
      'Name': name || '',
      'Handle': handle || '',
      'Instagram URL': handle ? `https://instagram.com/${handle.replace('@', '')}` : '',
      'Follower Count': '',
      'Email': email || '',
      'Platform': 'Instagram',
      'Notes': 'Imported from existing sheet',
      'Created At': now,
    };
    allInfluencers.push(influencer);
    influencerMap[key] = id;
    return id;
  }

  for (const url of urls) {
    if (!url || !url.trim()) continue;

    let data;
    try {
      data = await sheetsService.fetchExternalSheet(req.session.tokens, url.trim());
    } catch (err) {
      flaggedRows.push({ url, error: `Could not read sheet: ${err.message}` });
      continue;
    }

    for (const [sheetName, rows] of Object.entries(data)) {
      if (rows.length < 2) continue;

      const headers = rows[0].map(h => (h || '').toString().trim().toLowerCase());
      const dataRows = rows.slice(1);

      const getField = (row, ...keys) => {
        for (const key of keys) {
          const idx = headers.findIndex(h => h.includes(key.toLowerCase()));
          if (idx >= 0 && row[idx]) return row[idx].toString().trim();
        }
        return '';
      };

      const nameLower = sheetName.toLowerCase();

      // Determine sheet type based on name
      const isGifted = nameLower.includes('gifted') || nameLower.includes('gift');
      const isPaid = nameLower.includes('paid');
      const isReachedOut = nameLower.includes('reached out') || nameLower.includes('outreach');
      const isYesBoth = nameLower.includes('yes') && nameLower.includes('both');

      dataRows.forEach((row, rowIdx) => {
        if (row.every(cell => !cell || !cell.toString().trim())) return; // skip empty rows

        const name = getField(row, 'name', 'influencer');
        const handle = getField(row, 'handle', 'username', 'instagram', '@');
        const email = getField(row, 'email', 'contact');

        if (!name && !handle) {
          flaggedRows.push({
            sheet: sheetName,
            row: rowIdx + 2,
            reason: 'Could not identify influencer (no name or handle)',
            data: row,
          });
          return;
        }

        const influencerId = getOrCreateInfluencer(name, handle, email);

        const type = isPaid ? 'Paid' : 'Gifted';
        const outreachChannel = isYesBoth ? 'Facebook Creator Marketplace' : 'Instagram DM';

        const statusRaw = getField(row, 'status', 'stage').toLowerCase();
        let status = 'DM Sent';
        if (statusRaw.includes('posted') || statusRaw.includes('live')) status = 'Posted';
        else if (statusRaw.includes('delivered') || statusRaw.includes('received')) status = 'Delivered';
        else if (statusRaw.includes('shipped') || statusRaw.includes('sent')) status = 'Product Sent';
        else if (statusRaw.includes('address')) status = 'Address Collected';
        else if (statusRaw.includes('interested') || statusRaw.includes('yes')) status = 'Interested';
        else if (statusRaw.includes('signed')) status = 'Contract Signed';
        else if (statusRaw.includes('contract')) status = 'Contract Sent';
        else if (statusRaw.includes('negotiat')) status = 'Rate Negotiating';
        else if (statusRaw.includes('not interested') || statusRaw.includes('declined')) status = 'Not Interested';
        else if (statusRaw.includes('no response') || statusRaw.includes('ghost')) status = 'No Response';
        else if (isPaid) status = 'Reached Out';

        const campaignId = uuidv4();
        const campaign = {
          'ID': campaignId,
          'Influencer ID': influencerId,
          'Influencer Name': name || handle,
          'Type': type,
          'Status': status,
          'Deliverable': getField(row, 'deliverable', 'content', 'post type'),
          'Rate': getField(row, 'rate', 'fee', 'price', '$'),
          'Product': getField(row, 'product', 'item', 'gift'),
          'Outreach Channel': outreachChannel,
          'DM Link': getField(row, 'dm link', 'link', 'url'),
          'Contact Email': email,
          'Notes': getField(row, 'note', 'comment', 'remark'),
          'Created At': now,
          'Updated At': now,
        };
        allCampaigns.push(campaign);

        // Create shipment if there's shipping info
        const address = getField(row, 'address', 'shipping');
        const orderNum = getField(row, 'order', 'order no', 'order number', 'order #');
        const tracking = getField(row, 'tracking', 'track');

        if (address || orderNum || tracking) {
          allShipments.push({
            'ID': uuidv4(),
            'Campaign ID': campaignId,
            'Influencer Name': name || handle,
            'Address': address,
            'Order Number': orderNum,
            'Tracking Number': tracking,
            'Date Shipped': getField(row, 'shipped', 'ship date'),
            'Date Delivered': getField(row, 'delivered', 'delivery date'),
            'Expected Posting Date': getField(row, 'expected', 'post date'),
            'Created At': now,
          });
        }

        // Create content row if there's a post link
        const postLink = getField(row, 'post link', 'post url', 'instagram link', 'tiktok link');
        if (postLink) {
          allContent.push({
            'ID': uuidv4(),
            'Campaign ID': campaignId,
            'Influencer Name': name || handle,
            'Post Link': postLink,
            'Posted Date': getField(row, 'posted date', 'post date', 'date posted'),
            'Whitelisting Approved': getField(row, 'whitelist', 'whitelisting'),
            'Ad Access Expiry Date': getField(row, 'expiry', 'ad access', 'access expiry'),
            'Usage Rights Notes': '',
            'Created At': now,
          });
        }

        // Create contract if paid with rate info
        if (isPaid) {
          const rate = getField(row, 'rate', 'fee', 'price');
          const startDate = getField(row, 'start', 'start date');
          const endDate = getField(row, 'end', 'end date');
          if (rate || startDate || endDate) {
            allContracts.push({
              'ID': uuidv4(),
              'Campaign ID': campaignId,
              'Influencer Name': name || handle,
              'Start Date': startDate,
              'End Date': endDate,
              'Monthly Rate': rate,
              'Total Value': '',
              'Deliverables Per Month': getField(row, 'deliverable', 'content'),
              'Whitelisting Required': '',
              'Contract File URL': '',
              'Signed': getField(row, 'signed', 'contract signed'),
              'Created At': now,
            });
          }
        }
      });
    }
  }

  // Write to sheets in batches
  const results = { influencers: 0, campaigns: 0, shipments: 0, content: 0, contracts: 0, flagged: flaggedRows.length };

  if (allInfluencers.length > 0) {
    await sheetsService.batchAppendRows(req.session.tokens, 'Influencers', allInfluencers);
    results.influencers = allInfluencers.length;
  }
  if (allCampaigns.length > 0) {
    await sheetsService.batchAppendRows(req.session.tokens, 'Campaigns', allCampaigns);
    results.campaigns = allCampaigns.length;
  }
  if (allShipments.length > 0) {
    await sheetsService.batchAppendRows(req.session.tokens, 'Shipments', allShipments);
    results.shipments = allShipments.length;
  }
  if (allContent.length > 0) {
    await sheetsService.batchAppendRows(req.session.tokens, 'Content', allContent);
    results.content = allContent.length;
  }
  if (allContracts.length > 0) {
    await sheetsService.batchAppendRows(req.session.tokens, 'Contracts', allContracts);
    results.contracts = allContracts.length;
  }

  res.json({ success: true, results, flaggedRows });
});

module.exports = router;
