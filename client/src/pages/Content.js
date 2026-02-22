import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatDate, daysUntil } from '../utils/formatters';
import { SkeletonTable } from '../components/common/Skeleton';

export default function Content() {
  const { content, campaigns, loading, saveContent } = useData();

  const enriched = useMemo(() => {
    return content.map(c => {
      const campaign = campaigns.find(camp => camp['ID'] === c['Campaign ID']);
      const daysLeft = daysUntil(c['Ad Access Expiry Date']);
      return { ...c, campaign, daysUntilExpiry: daysLeft };
    }).sort((a, b) => new Date(b['Posted Date'] || 0) - new Date(a['Posted Date'] || 0));
  }, [content, campaigns]);

  const handleWhitelistToggle = async (item) => {
    const newVal = item['Whitelisting Approved'] === 'Y' ? 'N' : 'Y';
    await saveContent(item['ID'], { ...item, 'Whitelisting Approved': newVal });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Tracker</h1>
          <p className="text-gray-400 text-sm mt-0.5">{enriched.length} posts tracked</p>
        </div>
      </div>

      {/* Warning banner for expiring whitelisting */}
      {enriched.some(c => c.daysUntilExpiry !== null && c.daysUntilExpiry >= 0 && c.daysUntilExpiry <= 7) && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-red-400 text-lg">⚠</span>
          <p className="text-sm text-red-300">
            Some ad access is expiring within 7 days — check the rows highlighted below.
          </p>
        </div>
      )}

      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl overflow-hidden">
        {loading ? <SkeletonTable /> : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2d3148]">
                {['Influencer', 'Post', 'Posted Date', 'Whitelisted', 'Ad Access Expires', 'Usage Rights', 'Campaign'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d3148]">
              {enriched.map(item => {
                const expiring = item.daysUntilExpiry !== null && item.daysUntilExpiry >= 0 && item.daysUntilExpiry <= 30;
                const urgentExpiry = item.daysUntilExpiry !== null && item.daysUntilExpiry >= 0 && item.daysUntilExpiry <= 7;
                return (
                  <tr key={item['ID']} className={`hover:bg-[#242736] transition-colors ${urgentExpiry ? 'bg-red-950/20' : ''}`}>
                    <td className="px-4 py-3 text-sm font-medium text-white">{item['Influencer Name']}</td>
                    <td className="px-4 py-3">
                      {item['Post Link'] ? (
                        <a href={item['Post Link']} target="_blank" rel="noreferrer"
                          className="text-sm text-indigo-400 hover:text-indigo-300 underline">
                          View post ↗
                        </a>
                      ) : <span className="text-sm text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">{formatDate(item['Posted Date'])}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleWhitelistToggle(item)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          item['Whitelisting Approved'] === 'Y'
                            ? 'bg-green-900/50 text-green-300 hover:bg-green-900/70'
                            : item['Whitelisting Approved'] === 'N'
                            ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {item['Whitelisting Approved'] === 'Y' ? '✓ Approved' : item['Whitelisting Approved'] === 'N' ? '✕ Not approved' : 'Pending'}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item['Ad Access Expiry Date'] ? (
                        <span className={`text-sm ${urgentExpiry ? 'text-red-400 font-semibold' : expiring ? 'text-yellow-400' : 'text-gray-400'}`}>
                          {formatDate(item['Ad Access Expiry Date'])}
                          {item.daysUntilExpiry !== null && item.daysUntilExpiry >= 0 && (
                            <span className="text-xs ml-1">({item.daysUntilExpiry}d left)</span>
                          )}
                        </span>
                      ) : <span className="text-sm text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px]">
                      <span className="truncate block">{item['Usage Rights Notes'] || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {item.campaign && (
                        <div className="text-xs text-gray-400">
                          <span className="text-gray-600">{item.campaign['Type']}</span>
                          <span className="mx-1">·</span>
                          <span>{item.campaign['Product']}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {enriched.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500 text-sm">No content tracked yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
