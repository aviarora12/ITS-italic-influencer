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
    const shipments = await sheetsService.readSheet(req.session.tokens, 'Shipments');
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const now = new Date().toISOString();
    const shipment = {
      'ID': uuidv4(),
      'Campaign ID': req.body.campaignId || req.body['Campaign ID'] || '',
      'Influencer Name': req.body.influencerName || req.body['Influencer Name'] || '',
      'Address': req.body.address || req.body['Address'] || '',
      'Order Number': req.body.orderNumber || req.body['Order Number'] || '',
      'Tracking Number': req.body.trackingNumber || req.body['Tracking Number'] || '',
      'Date Shipped': req.body.dateShipped || req.body['Date Shipped'] || '',
      'Date Delivered': req.body.dateDelivered || req.body['Date Delivered'] || '',
      'Expected Posting Date': req.body.expectedPostingDate || req.body['Expected Posting Date'] || '',
      'Created At': now,
    };
    await sheetsService.appendRow(req.session.tokens, 'Shipments', shipment);
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const shipment = {
      'ID': req.params.id,
      'Campaign ID': req.body.campaignId || req.body['Campaign ID'] || '',
      'Influencer Name': req.body.influencerName || req.body['Influencer Name'] || '',
      'Address': req.body.address || req.body['Address'] || '',
      'Order Number': req.body.orderNumber || req.body['Order Number'] || '',
      'Tracking Number': req.body.trackingNumber || req.body['Tracking Number'] || '',
      'Date Shipped': req.body.dateShipped || req.body['Date Shipped'] || '',
      'Date Delivered': req.body.dateDelivered || req.body['Date Delivered'] || '',
      'Expected Posting Date': req.body.expectedPostingDate || req.body['Expected Posting Date'] || '',
      'Created At': req.body.createdAt || req.body['Created At'] || '',
    };
    await sheetsService.updateRow(req.session.tokens, 'Shipments', req.params.id, shipment);
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
