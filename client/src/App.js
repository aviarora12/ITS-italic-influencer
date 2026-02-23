import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { DataProvider, useData } from './context/DataContext';
import Layout from './components/layout/Layout';
import ToastContainer from './components/common/Toast';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Influencers from './pages/Influencers';
import Shipments from './pages/Shipments';
import Content from './pages/Content';
import Contracts from './pages/Contracts';
import FollowUps from './pages/FollowUps';
import { getSheetsStatus } from './services/api';

function AppRouter() {
  const { loadAll } = useData();
  const [hasData, setHasData] = useState(null);

  useEffect(() => {
    getSheetsStatus()
      .then(async ({ hasData }) => {
        if (hasData) await loadAll();
        setHasData(hasData);
      })
      .catch(() => setHasData(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (hasData === null) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <Setup onComplete={async () => {
        await loadAll();
        setHasData(true);
      }} />
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/influencers" element={<Influencers />} />
        <Route path="/shipments" element={<Shipments />} />
        <Route path="/content" element={<Content />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/followups" element={<FollowUps />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <DataProvider>
          <AppRouter />
          <ToastContainer />
        </DataProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
