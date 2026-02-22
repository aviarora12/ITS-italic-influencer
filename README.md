# Italic Influencer Hub

A web app for managing influencer marketing campaigns end-to-end, with Google Sheets as the database.

## Tech Stack

- **Frontend:** React + Tailwind CSS (via CDN)
- **Backend:** Node.js + Express
- **Database:** Google Sheets (via Google Sheets API v4)
- **Auth:** Google OAuth

## Quick Start

### 1. Set up Google API credentials

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable these APIs:
   - **Google Sheets API**
   - **Google Drive API**
   - **Google OAuth2 API** (People API)
4. Go to **APIs & Services → Credentials**
5. Click **Create Credentials → OAuth client ID**
6. Choose **Web application**
7. Add these Authorized redirect URIs:
   - `http://localhost:3001/auth/google/callback`
8. Copy your **Client ID** and **Client Secret**

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env and fill in your credentials
```

Your `.env` should look like:
```
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
SESSION_SECRET=any_random_string_here
PORT=3001
CLIENT_URL=http://localhost:3000
```

### 3. Install dependencies

```bash
npm run install:all
# This installs root + server + client deps
```

Or manually:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 4. Run the app

```bash
npm start
```

This starts both the backend (port 3001) and frontend (port 3000) concurrently.

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Launch

On first launch you'll be asked to:

1. **Sign in with Google** — this grants access to read/write Sheets in your account
2. **Choose your start mode:**
   - **Demo data** — loads 12 realistic influencer campaigns so you can explore immediately
   - **Fresh start** — creates an empty spreadsheet
   - **Import existing sheets** — migrate your current data (see below)

The app creates a Google Spreadsheet called **"Italic Influencer Hub"** in your Drive with 6 tabs:
- Influencers, Campaigns, Shipments, Content, Contracts, ActivityLog

## Importing Existing Data

Go to the **Import** page and paste your existing Google Sheets URLs. The app will:

1. Read all tabs from each sheet
2. Auto-detect and map columns (Name, Handle, Status, Rate, Address, Tracking, Post Link, etc.)
3. Show a preview of what it found
4. Create records in the new format
5. Flag any rows it couldn't map for manual review

**Tab mapping logic:**
- Tabs named "Gifted Partnership", "Reached Out" → Gifted campaigns
- Tabs named "Paid Partnership" → Paid campaigns + Contracts
- Tabs named "yes on both" → campaigns via Facebook Creator Marketplace
- Any row with tracking/order columns → Shipments entry
- Any row with a post link → Content entry

## Features

### Campaigns
- **Kanban view** — columns per status, drag or click to move cards
- **Table view** — sortable, filterable, inline status editing
- **Campaign detail panel** — slides in from right, tabbed (Overview, Shipment, Content, Contract)
- **Activity log** — add timestamped notes on any campaign
- Color-coded status badges per pipeline track

### Status Pipelines
**Gifted:** DM Sent → Interested → Address Collected → Product Sent → Delivered → Posted → Converted to Paid

**Paid:** Reached Out → Interested → Rate Negotiating → Contract Sent → Contract Signed → Product Sent → Posted → Complete

**Retainer:** Active → Paused → Complete

### Smart Reminders
Auto-generated on every load, shown on Dashboard and Follow-ups page:
- DM Sent with no update in 3+ days → "Follow up"
- Delivered with no post after 14 days → "Check in"
- Product Sent with no delivery in 10+ days → "Check tracking"
- Posted (Gifted) with no follow-up in 7+ days → "Ask about paid collab"
- Contract ending within 30 days → "Renewal coming up"
- Ad access expiring within 30 days → "Whitelisting expiring"

### Other Pages
- **Influencers** — searchable CRM, click to see full campaign history
- **Shipments** — tracking number quick-edit, filter by delivery status
- **Content** — all posted content, whitelisting status, ad access expiry alerts
- **Contracts** — rate/value summary, renewal alerts

## Data Sync

The app reads/writes directly to your Google Spreadsheet via the API. Your team can also edit the sheet directly — changes appear on next refresh. All updates use optimistic UI (screen updates immediately, syncs in background).

## Google OAuth Scope Note

The app requests:
- `spreadsheets` — read/write your Sheets
- `drive.file` — create/find the Italic Influencer Hub spreadsheet
- `userinfo.email` + `userinfo.profile` — for your name/avatar in the sidebar
