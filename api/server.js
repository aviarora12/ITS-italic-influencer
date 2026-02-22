// Vercel serverless entry point — wraps the Express app
require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });

const express = require('express');
const cors = require('cors');
const session = require('express-session');

const authRoutes = require('../server/routes/auth');
const sheetsRoutes = require('../server/routes/sheets');
const campaignsRoutes = require('../server/routes/campaigns');
const influencersRoutes = require('../server/routes/influencers');
const shipmentsRoutes = require('../server/routes/shipments');
const contentRoutes = require('../server/routes/content');
const contractsRoutes = require('../server/routes/contracts');
const activityRoutes = require('../server/routes/activity');
const importRoutes = require('../server/routes/import');
const remindersRoutes = require('../server/routes/reminders');

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'italic-influencer-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

app.use('/auth', authRoutes);
app.use('/api/sheets', sheetsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/influencers', influencersRoutes);
app.use('/api/shipments', shipmentsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/import', importRoutes);
app.use('/api/reminders', remindersRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
