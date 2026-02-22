require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const sheetsRoutes = require('./routes/sheets');
const campaignsRoutes = require('./routes/campaigns');
const influencersRoutes = require('./routes/influencers');
const shipmentsRoutes = require('./routes/shipments');
const contentRoutes = require('./routes/content');
const contractsRoutes = require('./routes/contracts');
const activityRoutes = require('./routes/activity');
const importRoutes = require('./routes/import');
const remindersRoutes = require('./routes/reminders');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'italic-influencer-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true in production with HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// Routes
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', authenticated: !!req.session.tokens });
});

app.listen(PORT, () => {
  console.log(`Italic Influencer Hub server running on http://localhost:${PORT}`);
  console.log(`Frontend should be on http://localhost:3000`);
});
