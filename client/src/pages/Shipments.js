import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatDate, daysSince } from '../utils/formatters';
import { SkeletonTable } from '../components/common/Skeleton';

export default function Shipments() {
  const { shipments, loading, saveShipment } = useData();
  const [tab, setTab] = useState('all');
  const [editingTracking, setEditingTracking] = useState(null);
  const [trackingVal, setTrackingVal] = useState('');

  const filtered = useMemo(() => {
    return shipments.filter(s => {
      if (tab === 'pending') return !s['Date Delivered'];
      if (tab === 'delivered') return !!s['Date Delivered'] && !s['Expected Posting Date'];
      if (tab === 'complete') return !!s['Date Delivered'];
      return true;
    });
  }, [shipments, tab]);

  const handleSaveTracking = async (shipment) => {
    await saveShipment(shipment['ID'], { ...shipment, 'Tracking Number': trackingVal });
    setEditingTracking(null);
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending Delivery' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'complete', label: 'Complete' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Shipments</h1>
          <p className="text-gray-400 text-sm mt-0.5">{filtered.length} shipments</p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-[#1a1d27] border border-[#2d3148] rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${tab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl overflow-hidden">
        {loading ? <SkeletonTable /> : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2d3148]">
                {['Influencer', 'Order #', 'Tracking #', 'Shipped', 'Delivered', 'Expected Post', 'Days In Transit'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d3148]">
              {filtered.map(s => {
                const daysInTransit = s['Date Shipped'] && !s['Date Delivered']
                  ? daysSince(s['Date Shipped'])
                  : null;
                const isEditing = editingTracking === s['ID'];

                return (
                  <tr key={s['ID']} className="hover:bg-[#242736] transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-white">{s['Influencer Name']}</div>
                      {s['Address'] && <div className="text-xs text-gray-500 truncate max-w-[180px]">{s['Address']}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{s['Order Number'] || '—'}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            className="bg-[#2d3148] border border-indigo-500 rounded px-2 py-1 text-white text-xs w-36 focus:outline-none"
                            value={trackingVal}
                            onChange={e => setTrackingVal(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSaveTracking(s)}
                          />
                          <button onClick={() => handleSaveTracking(s)} className="text-xs text-indigo-400 hover:text-indigo-300">Save</button>
                          <button onClick={() => setEditingTracking(null)} className="text-xs text-gray-500">✕</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-300">{s['Tracking Number'] || '—'}</span>
                          <button
                            onClick={() => { setEditingTracking(s['ID']); setTrackingVal(s['Tracking Number'] || ''); }}
                            className="text-xs text-gray-600 hover:text-indigo-400 transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">{formatDate(s['Date Shipped'])}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {s['Date Delivered'] ? (
                        <span className="text-sm text-green-400">{formatDate(s['Date Delivered'])}</span>
                      ) : (
                        <span className="text-sm text-gray-600">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">{formatDate(s['Expected Posting Date'])}</td>
                    <td className="px-4 py-3">
                      {daysInTransit !== null && (
                        <span className={`text-sm font-medium ${daysInTransit >= 10 ? 'text-red-400' : daysInTransit >= 5 ? 'text-yellow-400' : 'text-gray-400'}`}>
                          {daysInTransit}d
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500 text-sm">No shipments found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
