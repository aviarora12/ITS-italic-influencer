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
    const log = await sheetsService.readSheet(req.session.tokens, 'ActivityLog');
    res.json(log);
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
      'Note': req.body.note || req.body['Note'] || '',
      'Created By': req.body.createdBy || req.session.user?.name || 'Team',
      'Created At': now,
    };
    await sheetsService.appendRow(req.session.tokens, 'ActivityLog', row);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
