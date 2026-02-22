import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { previewImport, runImport, initSheets } from '../services/api';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';

export default function Import() {
  const { toast } = useApp();
  const { loadAll } = useData();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [urls, setUrls] = useState(['', '', '', '']);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [flaggedRows, setFlaggedRows] = useState([]);

  const updateUrl = (i, v) => {
    setUrls(prev => prev.map((u, idx) => idx === i ? v : u));
  };

  const addUrlField = () => setUrls(prev => [...prev, '']);

  const handlePreview = async () => {
    const validUrls = urls.filter(u => u.trim());
    if (validUrls.length === 0) {
      toast('Please paste at least one Google Sheets URL', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await previewImport(validUrls);
      setPreview(data);
      setStep(3);
    } catch (err) {
      toast(err.response?.data?.error || 'Preview failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    const validUrls = urls.filter(u => u.trim());
    setLoading(true);
    try {
      await initSheets();
      const data = await runImport(validUrls);
      setResults(data.results);
      setFlaggedRows(data.flaggedRows || []);
      await loadAll();
      setStep(4);
      toast(`Import complete! ${data.results.campaigns} campaigns imported.`);
    } catch (err) {
      toast(err.response?.data?.error || 'Import failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Import Existing Data</h1>
        <p className="text-gray-400 text-sm mt-1">
          Migrate your existing Google Sheets into the Italic Influencer Hub format.
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['Connect', 'Paste URLs', 'Preview', 'Done'].map((label, i) => (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-2 ${step === i + 1 ? 'text-white' : step > i + 1 ? 'text-green-400' : 'text-gray-600'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                step > i + 1 ? 'bg-green-600 border-green-600 text-white' :
                step === i + 1 ? 'border-indigo-500 text-white' :
                'border-gray-700 text-gray-600'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className="text-sm hidden sm:inline">{label}</span>
            </div>
            {i < 3 && <div className={`flex-1 h-px ${step > i + 1 ? 'bg-green-700' : 'bg-[#2d3148]'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Connect */}
      {step === 1 && (
        <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Step 1: Connected ✓</h2>
          <p className="text-gray-400 text-sm mb-4">Your Google account is connected and ready to read your existing sheets.</p>
          <button onClick={() => setStep(2)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors">
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Paste URLs */}
      {step === 2 && (
        <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Step 2: Paste your sheet URLs</h2>
          <p className="text-gray-400 text-sm mb-1">
            Paste the URLs of your existing Google Sheets. You can add multiple sheets — we'll read all tabs.
          </p>
          <p className="text-xs text-gray-500 mb-5">
            Tip: The app looks for columns like Name, Handle, Status, Rate, Address, Tracking Number, Post Link, etc.
            It maps them automatically. Anything it can't map will be flagged for review.
          </p>

          <div className="space-y-3 mb-4">
            {urls.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="flex-1 bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  placeholder={`https://docs.google.com/spreadsheets/d/...`}
                  value={url}
                  onChange={e => updateUrl(i, e.target.value)}
                />
                {i > 0 && (
                  <button
                    onClick={() => setUrls(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-gray-600 hover:text-red-400 text-lg leading-none"
                  >✕</button>
                )}
              </div>
            ))}
          </div>

          <button onClick={addUrlField} className="text-sm text-indigo-400 hover:text-indigo-300 mb-6">
            + Add another sheet
          </button>

          <div className="bg-[#0f1117] border border-[#2d3148] rounded-lg p-4 mb-6 text-xs text-gray-500">
            <p className="font-medium text-gray-400 mb-2">What we look for in your sheets:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>"Reached Out" / "Gifted Partnership" tabs → Gifted campaigns</li>
              <li>"Paid Partnership" tabs → Paid campaigns + Contracts</li>
              <li>"yes on both" tabs → campaigns via Facebook Creator Marketplace</li>
              <li>Order No / Tracking / Address columns → Shipments</li>
              <li>Post links → Content tracker entries</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePreview}
              disabled={loading || urls.every(u => !u.trim())}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Loading preview...' : 'Preview Import →'}
            </button>
            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white text-sm px-4 py-2.5">
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 3 && preview && (
        <div className="space-y-4">
          <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-1">Step 3: Review what we found</h2>
            <p className="text-gray-400 text-sm mb-5">Here's a summary of what the import will create:</p>

            {preview.results.map((result, i) => (
              <div key={i} className="mb-4">
                {result.error ? (
                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-300">❌ Failed to read sheet</p>
                    <p className="text-xs text-red-400 mt-1">{result.error}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{result.url}</p>
                  </div>
                ) : (
                  <div className="bg-[#242736] border border-[#3d4160] rounded-lg p-4">
                    <p className="text-sm font-medium text-white mb-2 truncate">✓ {result.url}</p>
                    <div className="flex flex-wrap gap-3">
                      {Object.entries(result.sheets).map(([name, info]) => (
                        <div key={name} className="bg-[#1a1d27] rounded-lg px-3 py-2">
                          <p className="text-xs font-medium text-gray-300">{name}</p>
                          <p className="text-xs text-gray-500">{info.rowCount} rows</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {preview.errors?.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-300 mb-2">⚠ Some sheets couldn't be read:</p>
                {preview.errors.map((e, i) => (
                  <p key={i} className="text-xs text-yellow-400">{e.error}</p>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Importing...' : 'Run Import →'}
            </button>
            <button onClick={() => setStep(2)} className="text-gray-400 hover:text-white text-sm px-4 py-2.5">
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === 4 && results && (
        <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">✓</div>
            <h2 className="text-xl font-bold text-white mb-1">Import Complete!</h2>
            <p className="text-gray-400 text-sm">Your data has been migrated to the Italic Influencer Hub.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Influencers', count: results.influencers },
              { label: 'Campaigns', count: results.campaigns },
              { label: 'Shipments', count: results.shipments },
              { label: 'Content', count: results.content },
              { label: 'Contracts', count: results.contracts },
              { label: 'Flagged Rows', count: results.flagged, warn: results.flagged > 0 },
            ].map(item => (
              <div key={item.label} className={`bg-[#242736] border rounded-lg p-3 text-center ${item.warn && item.count > 0 ? 'border-yellow-700' : 'border-[#3d4160]'}`}>
                <div className={`text-2xl font-bold ${item.warn && item.count > 0 ? 'text-yellow-400' : 'text-white'}`}>{item.count}</div>
                <div className="text-xs text-gray-400 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>

          {flaggedRows.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-yellow-300 mb-2">⚠ {flaggedRows.length} rows need manual review:</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {flaggedRows.map((r, i) => (
                  <p key={i} className="text-xs text-yellow-400">
                    {r.sheet ? `Row ${r.row} in "${r.sheet}": ${r.reason}` : r.error}
                  </p>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Go to Dashboard →
          </button>
        </div>
      )}
    </div>
  );
}
