import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useApp } from '../context/AppContext';
import { statusColor, typeColor, getStatusesForType, daysSince, formatDate } from '../utils/formatters';
import KanbanBoard from '../components/campaigns/KanbanBoard';
import CampaignDetailPanel from '../components/campaigns/CampaignDetailPanel';
import CampaignForm from '../components/campaigns/CampaignForm';
import Modal from '../components/common/Modal';
import { SkeletonTable } from '../components/common/Skeleton';

export default function Campaigns() {
  const { campaigns, loading, addCampaign, saveCampaign, removeCampaign } = useData();
  const { toast } = useApp();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState('kanban');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ type: '', status: '', search: '' });
  const [sortBy, setSortBy] = useState('updatedAt');

  // Open campaign from URL param
  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight && campaigns.length > 0) {
      const c = campaigns.find(c => c['ID'] === highlight);
      if (c) setSelectedCampaign(c);
    }
  }, [searchParams, campaigns]);

  const filtered = useMemo(() => {
    return campaigns.filter(c => {
      if (filter.type && c['Type'] !== filter.type) return false;
      if (filter.status && c['Status'] !== filter.status) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (!c['Influencer Name']?.toLowerCase().includes(q) &&
            !c['Product']?.toLowerCase().includes(q) &&
            !c['Status']?.toLowerCase().includes(q) &&
            !c['Notes']?.toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'updatedAt') return new Date(b['Updated At'] || 0) - new Date(a['Updated At'] || 0);
      if (sortBy === 'name') return (a['Influencer Name'] || '').localeCompare(b['Influencer Name'] || '');
      if (sortBy === 'status') return (a['Status'] || '').localeCompare(b['Status'] || '');
      return 0;
    });
  }, [campaigns, filter, sortBy]);

  const handleCreate = async (data) => {
    await addCampaign(data);
    setShowForm(false);
  };

  const handleDelete = async (campaign) => {
    if (!window.confirm(`Delete campaign for ${campaign['Influencer Name']}?`)) return;
    await removeCampaign(campaign['ID']);
    if (selectedCampaign?.['ID'] === campaign['ID']) setSelectedCampaign(null);
  };

  const allStatuses = useMemo(() => {
    if (filter.type) return getStatusesForType(filter.type);
    return [...new Set(campaigns.map(c => c['Status']))].sort();
  }, [campaigns, filter.type]);

  return (
    <div className={`flex h-screen overflow-hidden ${selectedCampaign ? 'pr-[520px]' : ''}`}>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-8 py-5 border-b border-[#2d3148]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Campaigns</h1>
              <p className="text-gray-400 text-sm mt-0.5">{filtered.length} campaigns</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + New Campaign
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* View toggle */}
            <div className="flex bg-[#242736] rounded-lg p-1">
              <button
                onClick={() => setView('kanban')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'kanban' ? 'bg-[#1a1d27] text-white' : 'text-gray-400 hover:text-white'}`}
              >
                ◈ Kanban
              </button>
              <button
                onClick={() => setView('table')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${view === 'table' ? 'bg-[#1a1d27] text-white' : 'text-gray-400 hover:text-white'}`}
              >
                ≡ Table
              </button>
            </div>

            {/* Search */}
            <input
              className="bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 w-48"
              placeholder="Search campaigns..."
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            />

            {/* Type filter */}
            <select
              className="bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              value={filter.type}
              onChange={e => setFilter(f => ({ ...f, type: e.target.value, status: '' }))}
            >
              <option value="">All Types</option>
              <option>Gifted</option>
              <option>Paid</option>
              <option>Retainer</option>
            </select>

            {/* Status filter (table view only) */}
            {view === 'table' && (
              <select
                className="bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                value={filter.status}
                onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
              >
                <option value="">All Statuses</option>
                {allStatuses.map(s => <option key={s}>{s}</option>)}
              </select>
            )}

            {(filter.type || filter.status || filter.search) && (
              <button
                onClick={() => setFilter({ type: '', status: '', search: '' })}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <SkeletonTable />
          ) : view === 'kanban' ? (
            <KanbanBoard
              campaigns={filtered}
              filter={filter}
              onCardClick={setSelectedCampaign}
            />
          ) : (
            <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2d3148]">
                    {['Influencer', 'Type', 'Status', 'Product', 'Deliverable', 'Rate', 'Updated', ''].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2d3148]">
                  {filtered.map(c => {
                    const days = daysSince(c['Updated At'] || c['Created At']);
                    return (
                      <tr
                        key={c['ID']}
                        className="hover:bg-[#242736] cursor-pointer transition-colors"
                        onClick={() => setSelectedCampaign(c)}
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-white">{c['Influencer Name']}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeColor(c['Type'])}`}>
                            {c['Type']}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded border ${statusColor(c['Status'])}`}>
                            {c['Status']}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 max-w-[150px]">
                          <span className="truncate block">{c['Product'] || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 max-w-[150px]">
                          <span className="truncate block">{c['Deliverable'] || '—'}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-emerald-400 font-medium whitespace-nowrap">
                          {c['Rate'] || '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          <span className={days !== null && days >= 7 ? 'text-red-400' : days !== null && days >= 3 ? 'text-yellow-400' : ''}>
                            {days !== null ? `${days}d ago` : formatDate(c['Updated At'])}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(c); }}
                            className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-500 text-sm">
                        No campaigns found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedCampaign && (
        <CampaignDetailPanel
          campaign={campaigns.find(c => c['ID'] === selectedCampaign['ID']) || selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}

      {/* New Campaign Modal */}
      {showForm && (
        <Modal title="New Campaign" onClose={() => setShowForm(false)} size="lg">
          <CampaignForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}
