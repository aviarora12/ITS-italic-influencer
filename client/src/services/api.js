import axios from 'axios';

const api = axios.create({ baseURL: '' });

// Sheets / setup
export const getSheetsStatus = () => api.get('/api/sheets/status').then(r => r.data);
export const seedDemoData = () => api.post('/api/sheets/seed').then(r => r.data);
export const initSheets = () => api.post('/api/sheets/init').then(r => r.data);

// Campaigns
export const getCampaigns = () => api.get('/api/campaigns').then(r => r.data);
export const createCampaign = (data) => api.post('/api/campaigns', data).then(r => r.data);
export const updateCampaign = (id, data) => api.put(`/api/campaigns/${id}`, data).then(r => r.data);
export const deleteCampaign = (id) => api.delete(`/api/campaigns/${id}`).then(r => r.data);

// Influencers
export const getInfluencers = () => api.get('/api/influencers').then(r => r.data);
export const createInfluencer = (data) => api.post('/api/influencers', data).then(r => r.data);
export const updateInfluencer = (id, data) => api.put(`/api/influencers/${id}`, data).then(r => r.data);
export const deleteInfluencer = (id) => api.delete(`/api/influencers/${id}`).then(r => r.data);

// Shipments
export const getShipments = () => api.get('/api/shipments').then(r => r.data);
export const createShipment = (data) => api.post('/api/shipments', data).then(r => r.data);
export const updateShipment = (id, data) => api.put(`/api/shipments/${id}`, data).then(r => r.data);

// Content
export const getContent = () => api.get('/api/content').then(r => r.data);
export const createContent = (data) => api.post('/api/content', data).then(r => r.data);
export const updateContent = (id, data) => api.put(`/api/content/${id}`, data).then(r => r.data);

// Contracts
export const getContracts = () => api.get('/api/contracts').then(r => r.data);
export const createContract = (data) => api.post('/api/contracts', data).then(r => r.data);
export const updateContract = (id, data) => api.put(`/api/contracts/${id}`, data).then(r => r.data);

// Activity
export const getActivity = () => api.get('/api/activity').then(r => r.data);
export const createActivity = (data) => api.post('/api/activity', data).then(r => r.data);

// Reminders
export const getReminders = () => api.get('/api/reminders').then(r => r.data);
