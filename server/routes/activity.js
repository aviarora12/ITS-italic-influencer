const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../services/localStore');

router.get('/', (req, res) => res.json(store.readSheet('ActivityLog')));

router.post('/', (req, res) => {
  try {
    const b = req.body;
    const row = {
      'ID': uuidv4(),
      'Campaign ID': b['Campaign ID'] || b.campaignId || '',
      'Influencer Name': b['Influencer Name'] || b.influencerName || '',
      'Note': b['Note'] || b.note || '',
      'Created By': b.createdBy || 'Team',
      'Created At': new Date().toISOString(),
    };
    store.appendRow('ActivityLog', row);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
