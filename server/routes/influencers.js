const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../services/localStore');

router.get('/', (req, res) => {
  res.json(store.readSheet('Influencers'));
});

router.post('/', (req, res) => {
  try {
    const row = {
      'ID': uuidv4(),
      'Name': req.body.name || '',
      'Handle': req.body.handle || '',
      'Instagram URL': req.body.instagramUrl || '',
      'Follower Count': String(req.body.followerCount || ''),
      'Email': req.body.email || '',
      'Platform': req.body.platform || 'Instagram',
      'Notes': req.body.notes || '',
      'Created At': new Date().toISOString(),
    };
    store.appendRow('Influencers', row);
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
      'Name': b['Name'] || b.name || '',
      'Handle': b['Handle'] || b.handle || '',
      'Instagram URL': b['Instagram URL'] || b.instagramUrl || '',
      'Follower Count': String(b['Follower Count'] || b.followerCount || ''),
      'Email': b['Email'] || b.email || '',
      'Platform': b['Platform'] || b.platform || 'Instagram',
      'Notes': b['Notes'] || b.notes || '',
      'Created At': b['Created At'] || b.createdAt || '',
    };
    store.updateRow('Influencers', req.params.id, row);
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    store.deleteRow('Influencers', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
