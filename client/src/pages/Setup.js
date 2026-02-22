import React, { useState } from 'react';
import { initSheets, seedDemoData } from '../services/api';
import { useApp } from '../context/AppContext';

export default function Setup({ onComplete }) {
  const [step, setStep] = useState('choice'); // 'choice' | 'creating' | 'done'
  const [error, setError] = useState(null);
  const { toast } = useApp();

  const handleFreshStart = async () => {
    setStep('creating');
    try {
      await initSheets();
      toast('Spreadsheet created! Loading demo data...');
      await seedDemoData();
      toast('Demo data loaded successfully!');
      onComplete();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setStep('choice');
    }
  };

  const handleEmptyStart = async () => {
    setStep('creating');
    try {
      await initSheets();
      toast('Italic Influencer Hub spreadsheet created!');
      onComplete();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setStep('choice');
    }
  };

  if (step === 'creating') {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">Setting up your workspace...</p>
          <p className="text-gray-400 text-sm mt-1">Creating your Google Spreadsheet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl text-2xl font-bold mb-4">I</div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to Italic Influencer Hub</h1>
          <p className="text-gray-400 text-sm">Let's set up your workspace. We'll create a Google Spreadsheet called <strong className="text-white">Italic Influencer Hub</strong> in your Drive.</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          <button
            onClick={handleFreshStart}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-6 text-left transition-colors group"
          >
            <div className="text-2xl mb-3">🚀</div>
            <div className="font-semibold text-lg mb-1">Start with demo data</div>
            <div className="text-indigo-200 text-sm">Load 12 realistic influencer campaigns across all tracks so the app looks real on first load. Perfect for exploring.</div>
          </button>

          <button
            onClick={handleEmptyStart}
            className="bg-[#1a1d27] hover:bg-[#242736] border border-[#2d3148] text-white rounded-xl p-6 text-left transition-colors"
          >
            <div className="text-2xl mb-3">📋</div>
            <div className="font-semibold text-lg mb-1">Start fresh (empty)</div>
            <div className="text-gray-400 text-sm">Create an empty spreadsheet and start adding your campaigns manually.</div>
          </button>

          <div className="text-center">
            <a
              href="/import"
              className="text-indigo-400 hover:text-indigo-300 text-sm underline"
            >
              I have existing sheets to import →
            </a>
          </div>
        </div>

        <div className="mt-8 bg-[#1a1d27] border border-[#2d3148] rounded-xl p-4">
          <p className="text-xs text-gray-400">
            <strong className="text-gray-300">Your data stays yours.</strong> We'll create a spreadsheet in your Google Drive called "Italic Influencer Hub". Your team can also edit the sheet directly — changes sync on refresh.
          </p>
        </div>
      </div>
    </div>
  );
}
