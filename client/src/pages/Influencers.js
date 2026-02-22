import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatFollowers, formatDate, statusColor, typeColor } from '../utils/formatters';
import Modal from '../components/common/Modal';
import { SkeletonTable } from '../components/common/Skeleton';

function InfluencerForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial['Name'] || '',
    handle: initial['Handle'] || '',
    instagramUrl: initial['Instagram URL'] || '',
    followerCount: initial['Follower Count'] || '',
    email: initial['Email'] || '',
    platform: initial['Platform'] || 'Instagram',
    notes: initial['Notes'] || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Name *</label>
          <input required className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Mia Chen" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Handle</label>
          <input className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.handle} onChange={e => set('handle', e.target.value)} placeholder="@mia.chen" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Platform</label>
          <select className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.platform} onChange={e => set('platform', e.target.value)}>
            <option>Instagram</option><option>TikTok</option><option>YouTube</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Followers</label>
          <input type="number" className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.followerCount} onChange={e => set('followerCount', e.target.value)} placeholder="45000" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
          <input type="email" className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.email} onChange={e => set('email', e.target.value)} placeholder="creator@email.com" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Instagram URL</label>
          <input className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.instagramUrl} onChange={e => set('instagramUrl', e.target.value)} placeholder="https://instagram.com/..." />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-400 mb-1">Notes</label>
          <textarea className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
            value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm">
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-[#242736] hover:bg-[#2d3148] text-white font-medium py-2.5 rounded-lg text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

function InfluencerDetail({ influencer, campaigns, onClose, onEdit }) {
  const influencerCampaigns = campaigns.filter(c => c['Influencer ID'] === influencer['ID'] || c['Influencer Name'] === influencer['Name']);
  return (
    <div className="fixed right-0 top-0 h-screen w-[480px] bg-[#1a1d27] border-l border-[#2d3148] z-20 flex flex-col shadow-2xl">
      <div className="flex items-start justify-between px-6 py-5 border-b border-[#2d3148]">
        <div>
          <h2 className="text-xl font-bold text-white">{influencer['Name']}</h2>
          <p className="text-gray-400 text-sm">{influencer['Handle']}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="text-xs text-indigo-400 hover:text-indigo-300 px-3 py-1.5 bg-indigo-900/30 rounded-lg">Edit</button>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">✕</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-gray-500 mb-1">Platform</p><p className="text-sm text-white">{influencer['Platform'] || '—'}</p></div>
          <div><p className="text-xs text-gray-500 mb-1">Followers</p><p className="text-sm text-white font-semibold">{formatFollowers(influencer['Follower Count'])}</p></div>
          <div><p className="text-xs text-gray-500 mb-1">Email</p><p className="text-sm text-white">{influencer['Email'] || '—'}</p></div>
          <div><p className="text-xs text-gray-500 mb-1">Added</p><p className="text-sm text-white">{formatDate(influencer['Created At'])}</p></div>
          {influencer['Instagram URL'] && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-1">Profile</p>
              <a href={influencer['Instagram URL']} target="_blank" rel="noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300">{influencer['Instagram URL']}</a>
            </div>
          )}
          {influencer['Notes'] && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-300">{influencer['Notes']}</p>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Campaign History ({influencerCampaigns.length})</h3>
          {influencerCampaigns.length === 0 ? (
            <p className="text-sm text-gray-500">No campaigns yet</p>
          ) : (
            <div className="space-y-2">
              {influencerCampaigns.map(c => (
                <div key={c['ID']} className="bg-[#242736] border border-[#3d4160] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${typeColor(c['Type'])}`}>{c['Type']}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${statusColor(c['Status'])}`}>{c['Status']}</span>
                  </div>
                  <p className="text-sm text-white">{c['Product'] || c['Deliverable']}</p>
                  {c['Rate'] && <p className="text-xs text-emerald-400 mt-0.5">{c['Rate']}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Influencers() {
  const { influencers, campaigns, loading, addInfluencer, saveInfluencer, removeInfluencer } = useData();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    if (!search) return influencers;
    const q = search.toLowerCase();
    return influencers.filter(i =>
      i['Name']?.toLowerCase().includes(q) ||
      i['Handle']?.toLowerCase().includes(q) ||
      i['Email']?.toLowerCase().includes(q) ||
      i['Platform']?.toLowerCase().includes(q)
    );
  }, [influencers, search]);

  const handleAdd = async (data) => {
    await addInfluencer(data);
    setShowForm(false);
  };

  const handleEdit = async (data) => {
    await saveInfluencer(editing['ID'], { ...editing, ...data });
    setEditing(null);
    setSelected(prev => prev ? { ...prev, ...data } : null);
  };

  const handleDelete = async (inf) => {
    if (!window.confirm(`Delete ${inf['Name']}?`)) return;
    await removeInfluencer(inf['ID']);
    if (selected?.['ID'] === inf['ID']) setSelected(null);
  };

  return (
    <div className={`flex h-screen overflow-hidden ${selected ? 'pr-[480px]' : ''}`}>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 px-8 py-5 border-b border-[#2d3148]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Influencers</h1>
              <p className="text-gray-400 text-sm mt-0.5">{filtered.length} creators</p>
            </div>
            <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              + Add Influencer
            </button>
          </div>
          <input
            className="bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 w-64"
            placeholder="Search by name, handle, platform..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-auto">
          {loading ? <SkeletonTable /> : (
            <table className="w-full">
              <thead className="sticky top-0 bg-[#1a1d27] border-b border-[#2d3148]">
                <tr>
                  {['Name', 'Handle', 'Platform', 'Followers', 'Email', 'Campaigns', ''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d3148]">
                {filtered.map(inf => {
                  const infCampaigns = campaigns.filter(c => c['Influencer ID'] === inf['ID'] || c['Influencer Name'] === inf['Name']);
                  return (
                    <tr key={inf['ID']} className="hover:bg-[#242736] cursor-pointer transition-colors" onClick={() => setSelected(inf)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-700/50 rounded-full flex items-center justify-center text-sm font-semibold text-indigo-300">
                            {inf['Name']?.[0] || '?'}
                          </div>
                          <span className="text-sm font-medium text-white">{inf['Name']}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{inf['Handle'] || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-[#242736] text-gray-300 px-2 py-0.5 rounded">{inf['Platform'] || 'Instagram'}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-white">{formatFollowers(inf['Follower Count'])}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{inf['Email'] || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{infCampaigns.length}</td>
                      <td className="px-4 py-3">
                        <button onClick={e => { e.stopPropagation(); handleDelete(inf); }} className="text-gray-600 hover:text-red-400 text-xs transition-colors">Delete</button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500 text-sm">No influencers found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && (
        <InfluencerDetail
          influencer={influencers.find(i => i['ID'] === selected['ID']) || selected}
          campaigns={campaigns}
          onClose={() => setSelected(null)}
          onEdit={() => { setEditing(selected); setSelected(null); }}
        />
      )}

      {(showForm || editing) && (
        <Modal title={editing ? 'Edit Influencer' : 'Add Influencer'} onClose={() => { setShowForm(false); setEditing(null); }}>
          <InfluencerForm
            initial={editing || {}}
            onSave={editing ? handleEdit : handleAdd}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </Modal>
      )}
    </div>
  );
}
