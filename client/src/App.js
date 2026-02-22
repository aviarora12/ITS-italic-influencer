import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import Layout from './components/layout/Layout';
import ToastContainer from './components/common/Toast';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Influencers from './pages/Influencers';
import Shipments from './pages/Shipments';
import Content from './pages/Content';
import Contracts from './pages/Contracts';
import FollowUps from './pages/FollowUps';
import Import from './pages/Import';
import { getSheetsStatus } from './services/api';

function AppRouter() {
  const { authenticated, loading: authLoading } = useAuth();
  const { loadAll } = useData();
  const [sheetsReady, setSheetsReady] = useState(null);
  const [checkingSheets, setCheckingSheets] = useState(false);

  useEffect(() => {
    if (!authenticated) return;

    const checkSheets = async () => {
      setCheckingSheets(true);
      try {
        const status = await getSheetsStatus();
        setSheetsReady(status.exists && status.hasData);
        if (status.exists) {
          await loadAll();
        }
      } catch (err) {
        console.error('Sheets check error:', err);
        setSheetsReady(false);
      } finally {
        setCheckingSheets(false);
      }
    };

    checkSheets();
  }, [authenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading || checkingSheets) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Login />;
  }

  if (sheetsReady === false) {
    return (
      <Setup onComplete={async () => {
        await loadAll();
        setSheetsReady(true);
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
        <Route path="/import" element={<Import />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AuthProvider>
          <DataProvider>
            <AppRouter />
            <ToastContainer />
          </DataProvider>
        </AuthProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
