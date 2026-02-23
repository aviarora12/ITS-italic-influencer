const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../services/localStore');

router.get('/', (req, res) => {
  res.json(store.readSheet('Campaigns'));
});

router.post('/', (req, res) => {
  try {
    const now = new Date().toISOString();
    const row = {
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
    store.appendRow('Campaigns', row);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const now = new Date().toISOString();
    const b = req.body;
    const row = {
      'ID': req.params.id,
      'Influencer ID': b['Influencer ID'] || b.influencerId || '',
      'Influencer Name': b['Influencer Name'] || b.influencerName || '',
      'Type': b['Type'] || b.type || '',
      'Status': b['Status'] || b.status || '',
      'Deliverable': b['Deliverable'] || b.deliverable || '',
      'Rate': b['Rate'] || b.rate || '',
      'Product': b['Product'] || b.product || '',
      'Outreach Channel': b['Outreach Channel'] || b.outreachChannel || '',
      'DM Link': b['DM Link'] || b.dmLink || '',
      'Contact Email': b['Contact Email'] || b.contactEmail || '',
      'Notes': b['Notes'] || b.notes || '',
      'Created At': b['Created At'] || b.createdAt || '',
      'Updated At': now,
    };
    store.updateRow('Campaigns', req.params.id, row);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    store.deleteRow('Campaigns', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
