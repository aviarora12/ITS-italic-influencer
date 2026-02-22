const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

function getRedirectUri(req) {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  // Auto-detect on Vercel: use the request host so preview URLs work
  const proto = req?.headers['x-forwarded-proto'] || 'http';
  const host = req?.headers['x-forwarded-host'] || req?.headers.host || 'localhost:3001';
  return `${proto}://${host}/auth/google/callback`;
}

function getOAuth2Client(req) {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getRedirectUri(req)
  );
}

// Start OAuth flow
router.get('/google', (req, res) => {
  const oauth2Client = getOAuth2Client(req);
  const scopes = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  res.redirect(url);
});

// OAuth callback
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  if (error) {
    return res.redirect(`${clientUrl}?auth_error=${error}`);
  }

  try {
    const oauth2Client = getOAuth2Client(req);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    req.session.tokens = tokens;
    req.session.user = {
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture,
    };

    res.redirect(`${clientUrl}?auth_success=true`);
  } catch (err) {
    console.error('OAuth error:', err);
    res.redirect(`${clientUrl}?auth_error=oauth_failed`);
  }
});

// Get current session/user
router.get('/me', (req, res) => {
  if (!req.session.tokens) {
    return res.json({ authenticated: false });
  }
  res.json({
    authenticated: true,
    user: req.session.user,
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;
