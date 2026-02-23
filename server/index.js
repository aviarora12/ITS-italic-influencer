require('dotenv').config();
const express = require('express');
const cors = require('cors');

const sheetsRoutes = require('./routes/sheets');
const campaignsRoutes = require('./routes/campaigns');
const influencersRoutes = require('./routes/influencers');
const shipmentsRoutes = require('./routes/shipments');
const contentRoutes = require('./routes/content');
const contractsRoutes = require('./routes/contracts');
const activityRoutes = require('./routes/activity');
const remindersRoutes = require('./routes/reminders');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/sheets', sheetsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/influencers', influencersRoutes);
app.use('/api/shipments', shipmentsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/reminders', remindersRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Italic Influencer Hub running on http://localhost:${PORT}`);
});
