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
    const contracts = await sheetsService.readSheet(req.session.tokens, 'Contracts');
    res.json(contracts);
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
      'Start Date': req.body.startDate || req.body['Start Date'] || '',
      'End Date': req.body.endDate || req.body['End Date'] || '',
      'Monthly Rate': req.body.monthlyRate || req.body['Monthly Rate'] || '',
      'Total Value': req.body.totalValue || req.body['Total Value'] || '',
      'Deliverables Per Month': req.body.deliverablesPerMonth || req.body['Deliverables Per Month'] || '',
      'Whitelisting Required': req.body.whitelistingRequired || req.body['Whitelisting Required'] || '',
      'Contract File URL': req.body.contractFileUrl || req.body['Contract File URL'] || '',
      'Signed': req.body.signed || req.body['Signed'] || '',
      'Created At': now,
    };
    await sheetsService.appendRow(req.session.tokens, 'Contracts', row);
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
      'Start Date': req.body.startDate || req.body['Start Date'] || '',
      'End Date': req.body.endDate || req.body['End Date'] || '',
      'Monthly Rate': req.body.monthlyRate || req.body['Monthly Rate'] || '',
      'Total Value': req.body.totalValue || req.body['Total Value'] || '',
      'Deliverables Per Month': req.body.deliverablesPerMonth || req.body['Deliverables Per Month'] || '',
      'Whitelisting Required': req.body.whitelistingRequired || req.body['Whitelisting Required'] || '',
      'Contract File URL': req.body.contractFileUrl || req.body['Contract File URL'] || '',
      'Signed': req.body.signed || req.body['Signed'] || '',
      'Created At': req.body.createdAt || req.body['Created At'] || '',
    };
    await sheetsService.updateRow(req.session.tokens, 'Contracts', req.params.id, row);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
