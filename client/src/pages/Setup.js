import React, { useState } from 'react';
import { seedDemoData, initSheets } from '../services/api';
import { useApp } from '../context/AppContext';

export default function Setup({ onComplete }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useApp();

  const start = async (withDemo) => {
    setLoading(true);
    try {
      if (withDemo) {
        await seedDemoData();
        toast('Demo data loaded!');
      } else {
        await initSheets();
      }
      onComplete();
    } catch (err) {
      toast('Something went wrong — is the server running?', 'error');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Setting up your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl text-3xl font-bold mb-6">I</div>
          <h1 className="text-3xl font-bold text-white mb-2">Italic Influencer Hub</h1>
          <p className="text-gray-400 text-sm">How would you like to start?</p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={() => start(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-6 text-left transition-colors"
          >
            <div className="text-2xl mb-3">🚀</div>
            <div className="font-semibold text-lg mb-1">Load demo data</div>
            <div className="text-indigo-200 text-sm">12 realistic influencer campaigns across all pipeline tracks. Good for exploring the app.</div>
          </button>

          <button
            onClick={() => start(false)}
            className="bg-[#1a1d27] hover:bg-[#242736] border border-[#2d3148] text-white rounded-xl p-6 text-left transition-colors"
          >
            <div className="text-2xl mb-3">📋</div>
            <div className="font-semibold text-lg mb-1">Start fresh</div>
            <div className="text-gray-400 text-sm">Empty workspace — add your own campaigns.</div>
          </button>
        </div>
      </div>
    </div>
  );
}
