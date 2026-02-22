import React, { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../services/api';
import { useApp } from './AppContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { toast } = useApp();
  const [campaigns, setCampaigns] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [content, setContent] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

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
      setCampaigns(c);
      setInfluencers(i);
      setShipments(s);
      setContent(co);
      setContracts(ct);
      setActivity(a);
      setReminders(r);
      setInitialized(true);
    } catch (err) {
      console.error('Error loading data:', err);
      toast('Failed to load data from Google Sheets', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Campaigns
  const addCampaign = useCallback(async (data) => {
    const campaign = await api.createCampaign(data);
    setCampaigns(prev => [...prev, campaign]);
    toast('Campaign created');
    return campaign;
  }, [toast]);

  const saveCampaign = useCallback(async (id, data) => {
    const updated = await api.updateCampaign(id, data);
    setCampaigns(prev => prev.map(c => c['ID'] === id ? { ...c, ...updated } : c));
    toast('Campaign saved');
    return updated;
  }, [toast]);

  const removeCampaign = useCallback(async (id) => {
    await api.deleteCampaign(id);
    setCampaigns(prev => prev.filter(c => c['ID'] !== id));
    toast('Campaign deleted');
  }, [toast]);

  // Optimistic status update
  const updateCampaignStatus = useCallback(async (id, status) => {
    const campaign = campaigns.find(c => c['ID'] === id);
    if (!campaign) return;
    const updated = { ...campaign, 'Status': status, 'Updated At': new Date().toISOString() };
    setCampaigns(prev => prev.map(c => c['ID'] === id ? updated : c));
    try {
      await api.updateCampaign(id, updated);
      toast(`Status updated to ${status}`);
    } catch (err) {
      // Rollback
      setCampaigns(prev => prev.map(c => c['ID'] === id ? campaign : c));
      toast('Failed to update status', 'error');
    }
  }, [campaigns, toast]);

  // Influencers
  const addInfluencer = useCallback(async (data) => {
    const inf = await api.createInfluencer(data);
    setInfluencers(prev => [...prev, inf]);
    toast('Influencer added');
    return inf;
  }, [toast]);

  const saveInfluencer = useCallback(async (id, data) => {
    const updated = await api.updateInfluencer(id, data);
    setInfluencers(prev => prev.map(i => i['ID'] === id ? { ...i, ...updated } : i));
    toast('Influencer saved');
    return updated;
  }, [toast]);

  const removeInfluencer = useCallback(async (id) => {
    await api.deleteInfluencer(id);
    setInfluencers(prev => prev.filter(i => i['ID'] !== id));
    toast('Influencer deleted');
  }, [toast]);

  // Shipments
  const addShipment = useCallback(async (data) => {
    const s = await api.createShipment(data);
    setShipments(prev => [...prev, s]);
    toast('Shipment added');
    return s;
  }, [toast]);

  const saveShipment = useCallback(async (id, data) => {
    const updated = await api.updateShipment(id, data);
    setShipments(prev => prev.map(s => s['ID'] === id ? { ...s, ...updated } : s));
    toast('Shipment saved');
    return updated;
  }, [toast]);

  // Content
  const addContent = useCallback(async (data) => {
    const c = await api.createContent(data);
    setContent(prev => [...prev, c]);
    toast('Content added');
    return c;
  }, [toast]);

  const saveContent = useCallback(async (id, data) => {
    const updated = await api.updateContent(id, data);
    setContent(prev => prev.map(c => c['ID'] === id ? { ...c, ...updated } : c));
    toast('Content saved');
    return updated;
  }, [toast]);

  // Contracts
  const addContract = useCallback(async (data) => {
    const c = await api.createContract(data);
    setContracts(prev => [...prev, c]);
    toast('Contract added');
    return c;
  }, [toast]);

  const saveContract = useCallback(async (id, data) => {
    const updated = await api.updateContract(id, data);
    setContracts(prev => prev.map(c => c['ID'] === id ? { ...c, ...updated } : c));
    toast('Contract saved');
    return updated;
  }, [toast]);

  // Activity
  const addActivity = useCallback(async (data) => {
    const a = await api.createActivity(data);
    setActivity(prev => [...prev, a]);
    return a;
  }, []);

  const refreshReminders = useCallback(async () => {
    const r = await api.getReminders();
    setReminders(r);
  }, []);

  return (
    <DataContext.Provider value={{
      campaigns, influencers, shipments, content, contracts, activity, reminders,
      loading, initialized,
      loadAll,
      addCampaign, saveCampaign, removeCampaign, updateCampaignStatus,
      addInfluencer, saveInfluencer, removeInfluencer,
      addShipment, saveShipment,
      addContent, saveContent,
      addContract, saveContract,
      addActivity,
      refreshReminders,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
