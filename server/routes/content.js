const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../services/localStore');

router.get('/', (req, res) => res.json(store.readSheet('Content')));

router.post('/', (req, res) => {
  try {
    const b = req.body;
    const row = {
      'ID': uuidv4(),
      'Campaign ID': b['Campaign ID'] || b.campaignId || '',
      'Influencer Name': b['Influencer Name'] || b.influencerName || '',
      'Post Link': b['Post Link'] || b.postLink || '',
      'Posted Date': b['Posted Date'] || b.postedDate || '',
      'Whitelisting Approved': b['Whitelisting Approved'] || b.whitelistingApproved || '',
      'Ad Access Expiry Date': b['Ad Access Expiry Date'] || b.adAccessExpiryDate || '',
      'Usage Rights Notes': b['Usage Rights Notes'] || b.usageRightsNotes || '',
      'Created At': new Date().toISOString(),
    };
    store.appendRow('Content', row);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const b = req.body;
    const row = {
      'ID': req.params.id,
      'Campaign ID': b['Campaign ID'] || b.campaignId || '',
      'Influencer Name': b['Influencer Name'] || b.influencerName || '',
      'Post Link': b['Post Link'] || b.postLink || '',
      'Posted Date': b['Posted Date'] || b.postedDate || '',
      'Whitelisting Approved': b['Whitelisting Approved'] || b.whitelistingApproved || '',
      'Ad Access Expiry Date': b['Ad Access Expiry Date'] || b.adAccessExpiryDate || '',
      'Usage Rights Notes': b['Usage Rights Notes'] || b.usageRightsNotes || '',
      'Created At': b['Created At'] || b.createdAt || '',
    };
    store.updateRow('Content', req.params.id, row);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
