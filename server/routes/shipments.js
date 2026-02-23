const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../services/localStore');

router.get('/', (req, res) => res.json(store.readSheet('Shipments')));

router.post('/', (req, res) => {
  try {
    const b = req.body;
    const row = {
      'ID': uuidv4(),
      'Campaign ID': b['Campaign ID'] || b.campaignId || '',
      'Influencer Name': b['Influencer Name'] || b.influencerName || '',
      'Address': b['Address'] || b.address || '',
      'Order Number': b['Order Number'] || b.orderNumber || '',
      'Tracking Number': b['Tracking Number'] || b.trackingNumber || '',
      'Date Shipped': b['Date Shipped'] || b.dateShipped || '',
      'Date Delivered': b['Date Delivered'] || b.dateDelivered || '',
      'Expected Posting Date': b['Expected Posting Date'] || b.expectedPostingDate || '',
      'Created At': new Date().toISOString(),
    };
    store.appendRow('Shipments', row);
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
      'Address': b['Address'] || b.address || '',
      'Order Number': b['Order Number'] || b.orderNumber || '',
      'Tracking Number': b['Tracking Number'] || b.trackingNumber || '',
      'Date Shipped': b['Date Shipped'] || b.dateShipped || '',
      'Date Delivered': b['Date Delivered'] || b.dateDelivered || '',
      'Expected Posting Date': b['Expected Posting Date'] || b.expectedPostingDate || '',
      'Created At': b['Created At'] || b.createdAt || '',
    };
    store.updateRow('Shipments', req.params.id, row);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
