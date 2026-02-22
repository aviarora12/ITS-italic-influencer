import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { getStatusesForType } from '../../utils/formatters';

const OUTREACH_CHANNELS = ['Instagram DM', 'Facebook Creator Marketplace', 'Email'];
const PLATFORMS = ['Instagram', 'TikTok', 'YouTube'];

export default function CampaignForm({ initial = {}, onSave, onCancel }) {
  const { influencers } = useData();
  const [form, setForm] = useState({
    influencerName: initial['Influencer Name'] || '',
    influencerId: initial['Influencer ID'] || '',
    type: initial['Type'] || 'Gifted',
    status: initial['Status'] || '',
    deliverable: initial['Deliverable'] || '',
    rate: initial['Rate'] || '',
    product: initial['Product'] || '',
    outreachChannel: initial['Outreach Channel'] || 'Instagram DM',
    dmLink: initial['DM Link'] || '',
    contactEmail: initial['Contact Email'] || '',
    notes: initial['Notes'] || '',
  });
  const [saving, setSaving] = useState(false);

  const statuses = getStatusesForType(form.type);
  if (!form.status && statuses.length > 0) {
    form.status = statuses[0];
  }

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleInfluencerSelect = (e) => {
    const id = e.target.value;
    if (id === '__new__') {
      set('influencerId', '');
      set('influencerName', '');
      return;
    }
    const inf = influencers.find(i => i['ID'] === id);
    if (inf) {
      set('influencerId', inf['ID']);
      set('influencerName', inf['Name']);
      if (!form.contactEmail) set('contactEmail', inf['Email']);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-400 mb-1">Influencer</label>
          <select
            className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.influencerId || '__new__'}
            onChange={handleInfluencerSelect}
          >
            <option value="__new__">-- Type name manually --</option>
            {influencers.map(i => (
              <option key={i['ID']} value={i['ID']}>{i['Name']} ({i['Handle']})</option>
            ))}
          </select>
        </div>

        {(!form.influencerId) && (
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-400 mb-1">Influencer Name</label>
            <input
              className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              value={form.influencerName}
              onChange={e => set('influencerName', e.target.value)}
              placeholder="e.g. Mia Chen"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
          <select
            className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.type}
            onChange={e => { set('type', e.target.value); set('status', ''); }}
          >
            <option>Gifted</option>
            <option>Paid</option>
            <option>Retainer</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
          <select
            className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.status}
            onChange={e => set('status', e.target.value)}
          >
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Product</label>
          <input
            className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.product}
            onChange={e => set('product', e.target.value)}
            placeholder="e.g. Italic Cashmere Sweater"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Deliverable</label>
          <input
            className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.deliverable}
            onChange={e => set('deliverable', e.target.value)}
            placeholder="e.g. 1 Instagram Reel"
          />
        </div>

        {(form.type === 'Paid' || form.type === 'Retainer') && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Rate</label>
            <input
              className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              value={form.rate}
              onChange={e => set('rate', e.target.value)}
              placeholder="e.g. $800"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Outreach Channel</label>
          <select
            className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.outreachChannel}
            onChange={e => set('outreachChannel', e.target.value)}
          >
            {OUTREACH_CHANNELS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Contact Email</label>
          <input
            className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
            value={form.contactEmail}
            onChange={e => set('contactEmail', e.target.value)}
            placeholder="creator@email.com"
            type="email"
          />
        </div>

        {form.outreachChannel === 'Instagram DM' && (
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-400 mb-1">DM Link</label>
            <input
              className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              value={form.dmLink}
              onChange={e => set('dmLink', e.target.value)}
              placeholder="https://ig.me/m/..."
            />
          </div>
        )}

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-400 mb-1">Notes</label>
          <textarea
            className="w-full bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={3}
            placeholder="Any additional notes..."
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          {saving ? 'Saving...' : 'Save Campaign'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-[#242736] hover:bg-[#2d3148] text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
