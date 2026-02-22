const { google } = require('googleapis');

const SPREADSHEET_TITLE = 'Italic Influencer Hub';

const SHEET_TABS = {
  INFLUENCERS: 'Influencers',
  CAMPAIGNS: 'Campaigns',
  SHIPMENTS: 'Shipments',
  CONTENT: 'Content',
  CONTRACTS: 'Contracts',
  ACTIVITY_LOG: 'ActivityLog',
};

const HEADERS = {
  [SHEET_TABS.INFLUENCERS]: [
    'ID', 'Name', 'Handle', 'Instagram URL', 'Follower Count',
    'Email', 'Platform', 'Notes', 'Created At',
  ],
  [SHEET_TABS.CAMPAIGNS]: [
    'ID', 'Influencer ID', 'Influencer Name', 'Type', 'Status',
    'Deliverable', 'Rate', 'Product', 'Outreach Channel',
    'DM Link', 'Contact Email', 'Notes', 'Created At', 'Updated At',
  ],
  [SHEET_TABS.SHIPMENTS]: [
    'ID', 'Campaign ID', 'Influencer Name', 'Address', 'Order Number',
    'Tracking Number', 'Date Shipped', 'Date Delivered', 'Expected Posting Date',
    'Created At',
  ],
  [SHEET_TABS.CONTENT]: [
    'ID', 'Campaign ID', 'Influencer Name', 'Post Link', 'Posted Date',
    'Whitelisting Approved', 'Ad Access Expiry Date', 'Usage Rights Notes', 'Created At',
  ],
  [SHEET_TABS.CONTRACTS]: [
    'ID', 'Campaign ID', 'Influencer Name', 'Start Date', 'End Date',
    'Monthly Rate', 'Total Value', 'Deliverables Per Month',
    'Whitelisting Required', 'Contract File URL', 'Signed', 'Created At',
  ],
  [SHEET_TABS.ACTIVITY_LOG]: [
    'ID', 'Campaign ID', 'Influencer Name', 'Note', 'Created By', 'Created At',
  ],
};

function getAuthClient(tokens) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

async function getOrCreateSpreadsheet(tokens) {
  const auth = getAuthClient(tokens);
  const drive = google.drive({ version: 'v3', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  // Check if spreadsheet already exists
  const searchRes = await drive.files.list({
    q: `name='${SPREADSHEET_TITLE}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (searchRes.data.files.length > 0) {
    return searchRes.data.files[0].id;
  }

  // Create new spreadsheet
  const createRes = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: SPREADSHEET_TITLE },
      sheets: Object.values(SHEET_TABS).map((title, index) => ({
        properties: { title, index },
      })),
    },
  });

  const spreadsheetId = createRes.data.spreadsheetId;

  // Add headers to each sheet
  const headerRequests = Object.entries(HEADERS).map(([sheetName, headers]) => ({
    range: `${sheetName}!A1:${String.fromCharCode(64 + headers.length)}1`,
    values: [headers],
  }));

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: headerRequests,
    },
  });

  // Format headers (bold, freeze first row)
  const sheetIds = createRes.data.sheets.map(s => ({
    title: s.properties.title,
    id: s.properties.sheetId,
  }));

  const formatRequests = sheetIds.map(sheet => ([
    {
      repeatCell: {
        range: {
          sheetId: sheet.id,
          startRowIndex: 0,
          endRowIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
            textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat)',
      },
    },
    {
      updateSheetProperties: {
        properties: {
          sheetId: sheet.id,
          gridProperties: { frozenRowCount: 1 },
        },
        fields: 'gridProperties.frozenRowCount',
      },
    },
  ])).flat();

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: formatRequests },
  });

  return spreadsheetId;
}

async function getSpreadsheetId(tokens) {
  const auth = getAuthClient(tokens);
  const drive = google.drive({ version: 'v3', auth });

  const searchRes = await drive.files.list({
    q: `name='${SPREADSHEET_TITLE}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (searchRes.data.files.length > 0) {
    return searchRes.data.files[0].id;
  }
  return null;
}

async function readSheet(tokens, sheetName) {
  const auth = getAuthClient(tokens);
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = await getSpreadsheetId(tokens);

  if (!spreadsheetId) return [];

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  });

  const rows = res.data.values || [];
  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });
}

async function appendRow(tokens, sheetName, rowData) {
  const auth = getAuthClient(tokens);
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = await getSpreadsheetId(tokens);

  if (!spreadsheetId) throw new Error('Spreadsheet not found');

  const headers = HEADERS[sheetName];
  const row = headers.map(h => rowData[h] || '');

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
}

async function updateRow(tokens, sheetName, id, rowData) {
  const auth = getAuthClient(tokens);
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = await getSpreadsheetId(tokens);

  if (!spreadsheetId) throw new Error('Spreadsheet not found');

  // Find the row with matching ID
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:A`,
  });

  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === id);
  if (rowIndex === -1) throw new Error(`Row with ID ${id} not found`);

  const sheetRowNumber = rowIndex + 1; // 1-indexed, +1 for header
  const headers = HEADERS[sheetName];
  const row = headers.map(h => rowData[h] !== undefined ? rowData[h] : '');

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A${sheetRowNumber}:${String.fromCharCode(64 + headers.length)}${sheetRowNumber}`,
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  });
}

async function deleteRow(tokens, sheetName, id) {
  const auth = getAuthClient(tokens);
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = await getSpreadsheetId(tokens);

  if (!spreadsheetId) throw new Error('Spreadsheet not found');

  // Get all IDs
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:A`,
  });

  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((r, i) => i > 0 && r[0] === id);
  if (rowIndex === -1) throw new Error(`Row with ID ${id} not found`);

  // Get sheet ID
  const metaRes = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties',
  });
  const sheetMeta = metaRes.data.sheets.find(s => s.properties.title === sheetName);
  if (!sheetMeta) throw new Error(`Sheet ${sheetName} not found`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheetMeta.properties.sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      }],
    },
  });
}

async function batchAppendRows(tokens, sheetName, rowsData) {
  const auth = getAuthClient(tokens);
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = await getSpreadsheetId(tokens);

  if (!spreadsheetId) throw new Error('Spreadsheet not found');

  const headers = HEADERS[sheetName];
  const rows = rowsData.map(rowData => headers.map(h => rowData[h] || ''));

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
    valueInputOption: 'RAW',
    requestBody: { values: rows },
  });
}

async function fetchExternalSheet(tokens, sheetUrl) {
  const auth = getAuthClient(tokens);
  const sheets = google.sheets({ version: 'v4', auth });

  // Extract spreadsheet ID from URL
  const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) throw new Error('Invalid Google Sheets URL');

  const spreadsheetId = match[1];

  // Get all sheet names
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties',
  });

  const sheetNames = meta.data.sheets.map(s => s.properties.title);
  const result = {};

  for (const name of sheetNames) {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${name}!A:Z`,
    });
    const rows = res.data.values || [];
    if (rows.length > 0) {
      result[name] = rows;
    }
  }

  return result;
}

module.exports = {
  SHEET_TABS,
  HEADERS,
  getOrCreateSpreadsheet,
  getSpreadsheetId,
  readSheet,
  appendRow,
  updateRow,
  deleteRow,
  batchAppendRows,
  fetchExternalSheet,
  getAuthClient,
};
