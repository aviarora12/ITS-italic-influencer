const express = require('express');
const router = express.Router();
const { getOrCreateSpreadsheet, getSpreadsheetId } = require('../services/googleSheets');
const { generateSeedData } = require('../services/seedData');
const sheetsService = require('../services/googleSheets');

function requireAuth(req, res, next) {
  if (!req.session.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// Initialize spreadsheet (create if not exists)
router.post('/init', requireAuth, async (req, res) => {
  try {
    const spreadsheetId = await getOrCreateSpreadsheet(req.session.tokens);
    res.json({ success: true, spreadsheetId });
  } catch (err) {
    console.error('Init error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Check if spreadsheet exists
router.get('/status', requireAuth, async (req, res) => {
  try {
    const spreadsheetId = await getSpreadsheetId(req.session.tokens);

    if (!spreadsheetId) {
      return res.json({ exists: false });
    }

    // Check if it has any data
    const influencers = await sheetsService.readSheet(req.session.tokens, 'Influencers');
    res.json({
      exists: true,
      spreadsheetId,
      hasData: influencers.length > 0,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    });
  } catch (err) {
    console.error('Status error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Seed with demo data
router.post('/seed', requireAuth, async (req, res) => {
  try {
    await getOrCreateSpreadsheet(req.session.tokens);
    const seed = generateSeedData();

    await sheetsService.batchAppendRows(req.session.tokens, 'Influencers', seed.influencerRows);
    await sheetsService.batchAppendRows(req.session.tokens, 'Campaigns', seed.campaigns);
    await sheetsService.batchAppendRows(req.session.tokens, 'Shipments', seed.shipments);
    await sheetsService.batchAppendRows(req.session.tokens, 'Content', seed.content);
    await sheetsService.batchAppendRows(req.session.tokens, 'Contracts', seed.contracts);
    await sheetsService.batchAppendRows(req.session.tokens, 'ActivityLog', seed.activityLog);

    res.json({ success: true, message: 'Demo data loaded successfully' });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
