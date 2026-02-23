import React, { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../services/api';
import { useApp } from './AppContext';
import { buildDemoData } from '../utils/demoData';
import { computeReminders } from '../utils/reminders';

const DataContext = createContext(null);

let _nextDemoId = 1000;
const demoId = () => `demo-new-${_nextDemoId++}`;

export function DataProvider({ children }) {
  const { toast } = useApp();
  const [demoMode, setDemoMode] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [content, setContent] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const refreshRemindersFromState = useCallback((camps, cont, conts) => {
    setReminders(computeReminders(camps, cont, conts));
  }, []);

  // Load from server
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [c, i, s, co, ct, a, r] = await Promise.all([
        api.getCampaigns(),
        api.getInfluencers(),
        api.getShipments(),
        api.getContent(),
        api.getContracts(),
        api.getActivity(),
        api.getReminders(),
      ]);
      setCampaigns(c); setInfluencers(i); setShipments(s);
      setContent(co); setContracts(ct); setActivity(a); setReminders(r);
      setInitialized(true);
    } catch (err) {
      console.error('Error loading data:', err);
      toast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load demo data into state (no server needed)
  const loadDemo = useCallback(() => {
    const d = buildDemoData();
    setCampaigns(d.campaigns);
    setInfluencers(d.influencerRows);
    setShipments(d.shipments);
    setContent(d.content);
    setContracts(d.contracts);
    setActivity(d.activityLog);
    setReminders(computeReminders(d.campaigns, d.content, d.contracts));
    setDemoMode(true);
    setInitialized(true);
  }, []);

  // --- Campaigns ---
  const addCampaign = useCallback(async (data) => {
    const now = new Date().toISOString();
    const row = { 'ID': demoId(), 'Influencer ID': data.influencerId || '', 'Influencer Name': data.influencerName || '', 'Type': data.type || 'Gifted', 'Status': data.status || 'DM Sent', 'Deliverable': data.deliverable || '', 'Rate': data.rate || '', 'Product': data.product || '', 'Outreach Channel': data.outreachChannel || '', 'DM Link': data.dmLink || '', 'Contact Email': data.contactEmail || '', 'Notes': data.notes || '', 'Created At': now, 'Updated At': now };
    if (!demoMode) { const saved = await api.createCampaign(data); setCampaigns(prev => { const n = [...prev, saved]; refreshRemindersFromState(n, content, contracts); return n; }); toast('Campaign created'); return saved; }
    setCampaigns(prev => { const n = [...prev, row]; refreshRemindersFromState(n, content, contracts); return n; });
    toast('Campaign created');
    return row;
  }, [demoMode, content, contracts, refreshRemindersFromState, toast]);

  const saveCampaign = useCallback(async (id, data) => {
    if (!demoMode) { const updated = await api.updateCampaign(id, data); setCampaigns(prev => { const n = prev.map(c => c['ID'] === id ? { ...c, ...updated } : c); refreshRemindersFromState(n, content, contracts); return n; }); toast('Campaign saved'); return updated; }
    setCampaigns(prev => { const n = prev.map(c => c['ID'] === id ? { ...c, ...data } : c); refreshRemindersFromState(n, content, contracts); return n; });
    toast('Campaign saved');
    return data;
  }, [demoMode, content, contracts, refreshRemindersFromState, toast]);

  const removeCampaign = useCallback(async (id) => {
    if (!demoMode) await api.deleteCampaign(id);
    setCampaigns(prev => prev.filter(c => c['ID'] !== id));
    toast('Campaign deleted');
  }, [demoMode, toast]);

  const updateCampaignStatus = useCallback(async (id, status) => {
    setCampaigns(prev => {
      const n = prev.map(c => c['ID'] === id ? { ...c, 'Status': status, 'Updated At': new Date().toISOString() } : c);
      refreshRemindersFromState(n, content, contracts);
      return n;
    });
    if (!demoMode) {
      try {
        const camp = campaigns.find(c => c['ID'] === id);
        if (camp) await api.updateCampaign(id, { ...camp, 'Status': status, 'Updated At': new Date().toISOString() });
      } catch { toast('Failed to sync status', 'error'); }
    }
    toast(`Status updated to ${status}`);
  }, [demoMode, campaigns, content, contracts, refreshRemindersFromState, toast]);

  // --- Influencers ---
  const addInfluencer = useCallback(async (data) => {
    if (!demoMode) { const inf = await api.createInfluencer(data); setInfluencers(prev => [...prev, inf]); toast('Influencer added'); return inf; }
    const row = { 'ID': demoId(), 'Name': data.name || '', 'Handle': data.handle || '', 'Instagram URL': data.instagramUrl || '', 'Follower Count': String(data.followerCount || ''), 'Email': data.email || '', 'Platform': data.platform || 'Instagram', 'Notes': data.notes || '', 'Created At': new Date().toISOString() };
    setInfluencers(prev => [...prev, row]); toast('Influencer added'); return row;
  }, [demoMode, toast]);

  const saveInfluencer = useCallback(async (id, data) => {
    if (!demoMode) { const updated = await api.updateInfluencer(id, data); setInfluencers(prev => prev.map(i => i['ID'] === id ? { ...i, ...updated } : i)); toast('Influencer saved'); return updated; }
    setInfluencers(prev => prev.map(i => i['ID'] === id ? { ...i, ...data } : i)); toast('Influencer saved'); return data;
  }, [demoMode, toast]);

  const removeInfluencer = useCallback(async (id) => {
    if (!demoMode) await api.deleteInfluencer(id);
    setInfluencers(prev => prev.filter(i => i['ID'] !== id)); toast('Influencer deleted');
  }, [demoMode, toast]);

  // --- Shipments ---
  const addShipment = useCallback(async (data) => {
    if (!demoMode) { const s = await api.createShipment(data); setShipments(prev => [...prev, s]); toast('Shipment added'); return s; }
    const row = { 'ID': demoId(), 'Campaign ID': data['Campaign ID'] || data.campaignId || '', 'Influencer Name': data['Influencer Name'] || data.influencerName || '', 'Address': data.address || '', 'Order Number': data.orderNumber || '', 'Tracking Number': data.trackingNumber || '', 'Date Shipped': data.dateShipped || '', 'Date Delivered': data.dateDelivered || '', 'Expected Posting Date': data.expectedPostingDate || '', 'Created At': new Date().toISOString() };
    setShipments(prev => [...prev, row]); toast('Shipment added'); return row;
  }, [demoMode, toast]);

  const saveShipment = useCallback(async (id, data) => {
    if (!demoMode) { const updated = await api.updateShipment(id, data); setShipments(prev => prev.map(s => s['ID'] === id ? { ...s, ...updated } : s)); toast('Shipment saved'); return updated; }
    setShipments(prev => prev.map(s => s['ID'] === id ? { ...s, ...data } : s)); toast('Shipment saved'); return data;
  }, [demoMode, toast]);

  // --- Content ---
  const addContent = useCallback(async (data) => {
    if (!demoMode) { const c = await api.createContent(data); setContent(prev => { const n = [...prev, c]; refreshRemindersFromState(campaigns, n, contracts); return n; }); toast('Content added'); return c; }
    const row = { 'ID': demoId(), 'Campaign ID': data['Campaign ID'] || data.campaignId || '', 'Influencer Name': data['Influencer Name'] || data.influencerName || '', 'Post Link': data.postLink || '', 'Posted Date': data.postedDate || '', 'Whitelisting Approved': data.whitelistingApproved || '', 'Ad Access Expiry Date': data.adAccessExpiryDate || '', 'Usage Rights Notes': data.usageRightsNotes || '', 'Created At': new Date().toISOString() };
    setContent(prev => { const n = [...prev, row]; refreshRemindersFromState(campaigns, n, contracts); return n; }); toast('Content added'); return row;
  }, [demoMode, campaigns, contracts, refreshRemindersFromState, toast]);

  const saveContent = useCallback(async (id, data) => {
    if (!demoMode) { const updated = await api.updateContent(id, data); setContent(prev => { const n = prev.map(c => c['ID'] === id ? { ...c, ...updated } : c); refreshRemindersFromState(campaigns, n, contracts); return n; }); toast('Content saved'); return updated; }
    setContent(prev => { const n = prev.map(c => c['ID'] === id ? { ...c, ...data } : c); refreshRemindersFromState(campaigns, n, contracts); return n; }); toast('Content saved'); return data;
  }, [demoMode, campaigns, contracts, refreshRemindersFromState, toast]);

  // --- Contracts ---
  const addContract = useCallback(async (data) => {
    if (!demoMode) { const c = await api.createContract(data); setContracts(prev => { const n = [...prev, c]; refreshRemindersFromState(campaigns, content, n); return n; }); toast('Contract added'); return c; }
    const row = { 'ID': demoId(), 'Campaign ID': data['Campaign ID'] || data.campaignId || '', 'Influencer Name': data['Influencer Name'] || data.influencerName || '', 'Start Date': data.startDate || '', 'End Date': data.endDate || '', 'Monthly Rate': data.monthlyRate || '', 'Total Value': data.totalValue || '', 'Deliverables Per Month': data.deliverablesPerMonth || '', 'Whitelisting Required': data.whitelistingRequired || '', 'Contract File URL': data.contractFileUrl || '', 'Signed': data.signed || '', 'Created At': new Date().toISOString() };
    setContracts(prev => { const n = [...prev, row]; refreshRemindersFromState(campaigns, content, n); return n; }); toast('Contract added'); return row;
  }, [demoMode, campaigns, content, refreshRemindersFromState, toast]);

  const saveContract = useCallback(async (id, data) => {
    if (!demoMode) { const updated = await api.updateContract(id, data); setContracts(prev => { const n = prev.map(c => c['ID'] === id ? { ...c, ...updated } : c); refreshRemindersFromState(campaigns, content, n); return n; }); toast('Contract saved'); return updated; }
    setContracts(prev => { const n = prev.map(c => c['ID'] === id ? { ...c, ...data } : c); refreshRemindersFromState(campaigns, content, n); return n; }); toast('Contract saved'); return data;
  }, [demoMode, campaigns, content, refreshRemindersFromState, toast]);

  // --- Activity ---
  const addActivity = useCallback(async (data) => {
    if (!demoMode) { const a = await api.createActivity(data); setActivity(prev => [...prev, a]); return a; }
    const row = { 'ID': demoId(), 'Campaign ID': data.campaignId || '', 'Influencer Name': data.influencerName || '', 'Note': data.note || '', 'Created By': 'Team', 'Created At': new Date().toISOString() };
    setActivity(prev => [...prev, row]); return row;
  }, [demoMode]);

  return (
    <DataContext.Provider value={{
      campaigns, influencers, shipments, content, contracts, activity, reminders,
      loading, initialized, demoMode,
      loadAll, loadDemo,
      addCampaign, saveCampaign, removeCampaign, updateCampaignStatus,
      addInfluencer, saveInfluencer, removeInfluencer,
      addShipment, saveShipment,
      addContent, saveContent,
      addContract, saveContract,
      addActivity,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
