const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const sheetsService = require('../services/googleSheets');

function requireAuth(req, res, next) {
  if (!req.session.tokens) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const campaigns = await sheetsService.readSheet(req.session.tokens, 'Campaigns');
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const now = new Date().toISOString();
    const campaign = {
      'ID': uuidv4(),
      'Influencer ID': req.body.influencerId || '',
      'Influencer Name': req.body.influencerName || '',
      'Type': req.body.type || 'Gifted',
      'Status': req.body.status || 'DM Sent',
      'Deliverable': req.body.deliverable || '',
      'Rate': req.body.rate || '',
      'Product': req.body.product || '',
      'Outreach Channel': req.body.outreachChannel || '',
      'DM Link': req.body.dmLink || '',
      'Contact Email': req.body.contactEmail || '',
      'Notes': req.body.notes || '',
      'Created At': now,
      'Updated At': now,
    };
    await sheetsService.appendRow(req.session.tokens, 'Campaigns', campaign);
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const now = new Date().toISOString();
    const existing = req.body;
    const campaign = {
      'ID': req.params.id,
      'Influencer ID': existing.influencerId || existing['Influencer ID'] || '',
      'Influencer Name': existing.influencerName || existing['Influencer Name'] || '',
      'Type': existing.type || existing['Type'] || '',
      'Status': existing.status || existing['Status'] || '',
      'Deliverable': existing.deliverable || existing['Deliverable'] || '',
      'Rate': existing.rate || existing['Rate'] || '',
      'Product': existing.product || existing['Product'] || '',
      'Outreach Channel': existing.outreachChannel || existing['Outreach Channel'] || '',
      'DM Link': existing.dmLink || existing['DM Link'] || '',
      'Contact Email': existing.contactEmail || existing['Contact Email'] || '',
      'Notes': existing.notes || existing['Notes'] || '',
      'Created At': existing.createdAt || existing['Created At'] || '',
      'Updated At': now,
    };
    await sheetsService.updateRow(req.session.tokens, 'Campaigns', req.params.id, campaign);
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await sheetsService.deleteRow(req.session.tokens, 'Campaigns', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
