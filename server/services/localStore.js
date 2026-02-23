const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../../data');

const SHEET_TABS = {
  INFLUENCERS: 'Influencers',
  CAMPAIGNS: 'Campaigns',
  SHIPMENTS: 'Shipments',
  CONTENT: 'Content',
  CONTRACTS: 'Contracts',
  ACTIVITY_LOG: 'ActivityLog',
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function filePath(tabName) {
  return path.join(DATA_DIR, `${tabName}.json`);
}

function readSheet(tabName) {
  ensureDataDir();
  const fp = filePath(tabName);
  if (!fs.existsSync(fp)) return [];
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch {
    return [];
  }
}

function writeSheet(tabName, rows) {
  ensureDataDir();
  fs.writeFileSync(filePath(tabName), JSON.stringify(rows, null, 2));
}

function appendRow(tabName, rowData) {
  const rows = readSheet(tabName);
  rows.push(rowData);
  writeSheet(tabName, rows);
}

function updateRow(tabName, id, rowData) {
  const rows = readSheet(tabName);
  const idx = rows.findIndex(r => r['ID'] === id);
  if (idx === -1) throw new Error(`Row with ID ${id} not found in ${tabName}`);
  rows[idx] = rowData;
  writeSheet(tabName, rows);
}

function deleteRow(tabName, id) {
  const rows = readSheet(tabName);
  const filtered = rows.filter(r => r['ID'] !== id);
  if (filtered.length === rows.length) throw new Error(`Row with ID ${id} not found in ${tabName}`);
  writeSheet(tabName, filtered);
}

function batchAppendRows(tabName, rowsData) {
  const rows = readSheet(tabName);
  rows.push(...rowsData);
  writeSheet(tabName, rows);
}

function hasData() {
  const influencers = readSheet(SHEET_TABS.INFLUENCERS);
  return influencers.length > 0;
}

function clearAll() {
  Object.values(SHEET_TABS).forEach(tab => writeSheet(tab, []));
}

module.exports = {
  SHEET_TABS,
  readSheet,
  writeSheet,
  appendRow,
  updateRow,
  deleteRow,
  batchAppendRows,
  hasData,
  clearAll,
};
