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
    const content = await sheetsService.readSheet(req.session.tokens, 'Content');
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const now = new Date().toISOString();
    const row = {
      'ID': uuidv4(),
      'Campaign ID': req.body.campaignId || req.body['Campaign ID'] || '',
      'Influencer Name': req.body.influencerName || req.body['Influencer Name'] || '',
      'Post Link': req.body.postLink || req.body['Post Link'] || '',
      'Posted Date': req.body.postedDate || req.body['Posted Date'] || '',
      'Whitelisting Approved': req.body.whitelistingApproved || req.body['Whitelisting Approved'] || '',
      'Ad Access Expiry Date': req.body.adAccessExpiryDate || req.body['Ad Access Expiry Date'] || '',
      'Usage Rights Notes': req.body.usageRightsNotes || req.body['Usage Rights Notes'] || '',
      'Created At': now,
    };
    await sheetsService.appendRow(req.session.tokens, 'Content', row);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const row = {
      'ID': req.params.id,
      'Campaign ID': req.body.campaignId || req.body['Campaign ID'] || '',
      'Influencer Name': req.body.influencerName || req.body['Influencer Name'] || '',
      'Post Link': req.body.postLink || req.body['Post Link'] || '',
      'Posted Date': req.body.postedDate || req.body['Posted Date'] || '',
      'Whitelisting Approved': req.body.whitelistingApproved || req.body['Whitelisting Approved'] || '',
      'Ad Access Expiry Date': req.body.adAccessExpiryDate || req.body['Ad Access Expiry Date'] || '',
      'Usage Rights Notes': req.body.usageRightsNotes || req.body['Usage Rights Notes'] || '',
      'Created At': req.body.createdAt || req.body['Created At'] || '',
    };
    await sheetsService.updateRow(req.session.tokens, 'Content', req.params.id, row);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
