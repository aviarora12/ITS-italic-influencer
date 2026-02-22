import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { formatDate, daysUntil } from '../utils/formatters';
import Modal from '../components/common/Modal';
import { SkeletonTable } from '../components/common/Skeleton';

function ContractForm({ initial = {}, campaigns, onSave, onCancel }) {
  const paidCampaigns = campaigns.filter(c => c['Type'] === 'Paid' || c['Type'] === 'Retainer');
  const [form, setForm] = useState({
    campaignId: initial['Campaign ID'] || '',
    influencerName: initial['Influencer Name'] || '',
    startDate: initial['Start Date'] || '',
    endDate: initial['End Date'] || '',
    monthlyRate: initial['Monthly Rate'] || '',
    totalValue: initial['Total Value'] || '',
    deliverablesPerMonth: initial['Deliverables Per Month'] || '',
    whitelistingRequired: initial['Whitelisting Required'] || '',
    contractFileUrl: initial['Contract File URL'] || '',
    signed: initial['Signed'] || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleCampaignSelect = (id) => {
    const c = paidCampaigns.find(c => c['ID'] === id);
    set('campaignId', id);
    if (c) set('influencerName', c['Influencer Name']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-400 mb-1">Campaign</label>
          <select className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.campaignId} onChange={e => handleCampaignSelect(e.target.value)}>
            <option value="">Select a campaign</option>
            {paidCampaigns.map(c => <option key={c['ID']} value={c['ID']}>{c['Influencer Name']} — {c['Type']}</option>)}
          </select>
        </div>
        {!form.campaignId && (
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-400 mb-1">Influencer Name</label>
            <input className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              value={form.influencerName} onChange={e => set('influencerName', e.target.value)} />
          </div>
        )}
        <div><label className="block text-xs font-medium text-gray-400 mb-1">Start Date</label>
          <input type="date" className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
        <div><label className="block text-xs font-medium text-gray-400 mb-1">End Date</label>
          <input type="date" className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
        <div><label className="block text-xs font-medium text-gray-400 mb-1">Monthly Rate ($)</label>
          <input type="number" className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.monthlyRate} onChange={e => set('monthlyRate', e.target.value)} /></div>
        <div><label className="block text-xs font-medium text-gray-400 mb-1">Total Value ($)</label>
          <input type="number" className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.totalValue} onChange={e => set('totalValue', e.target.value)} /></div>
        <div className="col-span-2"><label className="block text-xs font-medium text-gray-400 mb-1">Deliverables Per Month</label>
          <input className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.deliverablesPerMonth} onChange={e => set('deliverablesPerMonth', e.target.value)} placeholder="e.g. 2 Reels + 4 Stories" /></div>
        <div><label className="block text-xs font-medium text-gray-400 mb-1">Whitelisting Required</label>
          <select className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.whitelistingRequired} onChange={e => set('whitelistingRequired', e.target.value)}>
            <option value="">—</option><option>Y</option><option>N</option>
          </select></div>
        <div><label className="block text-xs font-medium text-gray-400 mb-1">Signed</label>
          <select className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.signed} onChange={e => set('signed', e.target.value)}>
            <option value="">—</option><option>Y</option><option>N</option>
          </select></div>
        <div className="col-span-2"><label className="block text-xs font-medium text-gray-400 mb-1">Contract File URL</label>
          <input className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.contractFileUrl} onChange={e => set('contractFileUrl', e.target.value)} placeholder="https://drive.google.com/..." /></div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm">
          {saving ? 'Saving...' : 'Save Contract'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-[#242736] hover:bg-[#2d3148] text-white font-medium py-2.5 rounded-lg text-sm">Cancel</button>
      </div>
    </form>
  );
}

export default function Contracts() {
  const { contracts, campaigns, loading, addContract } = useData();
  const [showForm, setShowForm] = useState(false);

  const enriched = useMemo(() => {
    return contracts.map(c => {
      const campaign = campaigns.find(camp => camp['ID'] === c['Campaign ID']);
      const daysLeft = daysUntil(c['End Date']);
      return { ...c, campaign, daysUntilEnd: daysLeft };
    }).sort((a, b) => {
      if (a.daysUntilEnd !== null && b.daysUntilEnd !== null) return a.daysUntilEnd - b.daysUntilEnd;
      return 0;
    });
  }, [contracts, campaigns]);

  const handleAdd = async (data) => {
    await addContract(data);
    setShowForm(false);
  };

  const totalValue = enriched.reduce((sum, c) => sum + (parseFloat(c['Total Value']) || 0), 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Contracts</h1>
          <p className="text-gray-400 text-sm mt-0.5">{enriched.length} contracts · ${totalValue.toLocaleString()} total value</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Add Contract
        </button>
      </div>

      {enriched.some(c => c.daysUntilEnd !== null && c.daysUntilEnd >= 0 && c.daysUntilEnd <= 30) && (
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-yellow-400 text-lg">⚠</span>
          <p className="text-sm text-yellow-300">Some contracts are ending within 30 days — consider renewals.</p>
        </div>
      )}

      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl overflow-hidden">
        {loading ? <SkeletonTable /> : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2d3148]">
                {['Influencer', 'Type', 'Monthly Rate', 'Total Value', 'Start', 'End', 'Deliverables', 'Whitelisting', 'Signed', 'Contract'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d3148]">
              {enriched.map(c => {
                const ending = c.daysUntilEnd !== null && c.daysUntilEnd >= 0 && c.daysUntilEnd <= 30;
                return (
                  <tr key={c['ID']} className={`hover:bg-[#242736] transition-colors ${ending ? 'bg-yellow-950/10' : ''}`}>
                    <td className="px-4 py-3 text-sm font-medium text-white">{c['Influencer Name']}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{c.campaign?.['Type'] || '—'}</td>
                    <td className="px-4 py-3 text-sm text-emerald-400 font-medium">{c['Monthly Rate'] ? `$${parseInt(c['Monthly Rate']).toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-emerald-300 font-semibold">{c['Total Value'] ? `$${parseInt(c['Total Value']).toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">{formatDate(c['Start Date'])}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-sm ${ending ? 'text-yellow-400 font-semibold' : 'text-gray-400'}`}>
                        {formatDate(c['End Date'])}
                        {ending && c.daysUntilEnd !== null && <span className="text-xs ml-1">({c.daysUntilEnd}d)</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 max-w-[120px]">
                      <span className="truncate block">{c['Deliverables Per Month'] || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={c['Whitelisting Required'] === 'Y' ? 'text-yellow-400' : 'text-gray-600'}>
                        {c['Whitelisting Required'] || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${c['Signed'] === 'Y' ? 'bg-green-900/50 text-green-300' : 'bg-gray-800 text-gray-400'}`}>
                        {c['Signed'] === 'Y' ? '✓ Signed' : c['Signed'] === 'N' ? 'Unsigned' : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c['Contract File URL'] ? (
                        <a href={c['Contract File URL']} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300">View ↗</a>
                      ) : <span className="text-gray-600 text-xs">—</span>}
                    </td>
                  </tr>
                );
              })}
              {enriched.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-500 text-sm">No contracts yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <Modal title="Add Contract" onClose={() => setShowForm(false)} size="lg">
          <ContractForm campaigns={campaigns} onSave={handleAdd} onCancel={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}
