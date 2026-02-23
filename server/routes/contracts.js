const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../services/localStore');

router.get('/', (req, res) => res.json(store.readSheet('Contracts')));

router.post('/', (req, res) => {
  try {
    const b = req.body;
    const row = {
      'ID': uuidv4(),
      'Campaign ID': b['Campaign ID'] || b.campaignId || '',
      'Influencer Name': b['Influencer Name'] || b.influencerName || '',
      'Start Date': b['Start Date'] || b.startDate || '',
      'End Date': b['End Date'] || b.endDate || '',
      'Monthly Rate': b['Monthly Rate'] || b.monthlyRate || '',
      'Total Value': b['Total Value'] || b.totalValue || '',
      'Deliverables Per Month': b['Deliverables Per Month'] || b.deliverablesPerMonth || '',
      'Whitelisting Required': b['Whitelisting Required'] || b.whitelistingRequired || '',
      'Contract File URL': b['Contract File URL'] || b.contractFileUrl || '',
      'Signed': b['Signed'] || b.signed || '',
      'Created At': new Date().toISOString(),
    };
    store.appendRow('Contracts', row);
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
      'Start Date': b['Start Date'] || b.startDate || '',
      'End Date': b['End Date'] || b.endDate || '',
      'Monthly Rate': b['Monthly Rate'] || b.monthlyRate || '',
      'Total Value': b['Total Value'] || b.totalValue || '',
      'Deliverables Per Month': b['Deliverables Per Month'] || b.deliverablesPerMonth || '',
      'Whitelisting Required': b['Whitelisting Required'] || b.whitelistingRequired || '',
      'Contract File URL': b['Contract File URL'] || b.contractFileUrl || '',
      'Signed': b['Signed'] || b.signed || '',
      'Created At': b['Created At'] || b.createdAt || '',
    };
    store.updateRow('Contracts', req.params.id, row);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
