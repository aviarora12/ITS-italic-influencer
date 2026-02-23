import React from 'react';
import Sidebar from './Sidebar';
import { useData } from '../../context/DataContext';

export default function Layout({ children }) {
  const { demoMode } = useData();
  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar />
      <main className="flex-1 ml-56 min-h-screen overflow-x-hidden">
        {demoMode && (
          <div className="bg-amber-900/40 border-b border-amber-700/50 text-amber-300 text-xs text-center py-1.5 px-4">
            Demo mode — changes are not saved. Run the server locally to persist data.
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
