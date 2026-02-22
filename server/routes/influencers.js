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
    const influencers = await sheetsService.readSheet(req.session.tokens, 'Influencers');
    res.json(influencers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const now = new Date().toISOString();
    const influencer = {
      'ID': uuidv4(),
      'Name': req.body.name || '',
      'Handle': req.body.handle || '',
      'Instagram URL': req.body.instagramUrl || '',
      'Follower Count': String(req.body.followerCount || ''),
      'Email': req.body.email || '',
      'Platform': req.body.platform || 'Instagram',
      'Notes': req.body.notes || '',
      'Created At': now,
    };
    await sheetsService.appendRow(req.session.tokens, 'Influencers', influencer);
    res.json(influencer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const influencer = {
      'ID': req.params.id,
      'Name': req.body.name || req.body['Name'] || '',
      'Handle': req.body.handle || req.body['Handle'] || '',
      'Instagram URL': req.body.instagramUrl || req.body['Instagram URL'] || '',
      'Follower Count': String(req.body.followerCount || req.body['Follower Count'] || ''),
      'Email': req.body.email || req.body['Email'] || '',
      'Platform': req.body.platform || req.body['Platform'] || 'Instagram',
      'Notes': req.body.notes || req.body['Notes'] || '',
      'Created At': req.body.createdAt || req.body['Created At'] || '',
    };
    await sheetsService.updateRow(req.session.tokens, 'Influencers', req.params.id, influencer);
    res.json(influencer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await sheetsService.deleteRow(req.session.tokens, 'Influencers', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
