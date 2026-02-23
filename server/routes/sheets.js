const express = require('express');
const router = express.Router();
const store = require('../services/localStore');
const { generateSeedData } = require('../services/seedData');

router.get('/status', (req, res) => {
  res.json({ hasData: store.hasData() });
});

router.post('/seed', (req, res) => {
  try {
    store.clearAll();
    const seed = generateSeedData();
    store.batchAppendRows('Influencers', seed.influencerRows);
    store.batchAppendRows('Campaigns', seed.campaigns);
    store.batchAppendRows('Shipments', seed.shipments);
    store.batchAppendRows('Content', seed.content);
    store.batchAppendRows('Contracts', seed.contracts);
    store.batchAppendRows('ActivityLog', seed.activityLog);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/init', (req, res) => {
  try {
    store.clearAll();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
