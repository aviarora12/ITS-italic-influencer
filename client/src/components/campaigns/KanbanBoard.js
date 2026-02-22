import React, { useMemo } from 'react';
import { statusColor, typeColor, daysSince, GIFTED_STATUSES, PAID_STATUSES, RETAINER_STATUSES, DEAD_END_STATUSES } from '../../utils/formatters';
import { useData } from '../../context/DataContext';

const GIFTED_ACTIVE = GIFTED_STATUSES.filter(s => !DEAD_END_STATUSES.includes(s));
const PAID_ACTIVE = PAID_STATUSES.filter(s => !DEAD_END_STATUSES.includes(s));
const RETAINER_ACTIVE = RETAINER_STATUSES;

function CampaignCard({ campaign, onClick, onStatusChange }) {
  const days = daysSince(campaign['Updated At'] || campaign['Created At']);

  return (
    <div
      className="bg-[#1a1d27] border border-[#2d3148] rounded-lg p-3 cursor-pointer hover:border-indigo-600/50 transition-colors group"
      onClick={() => onClick(campaign)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm font-medium text-white leading-tight">{campaign['Influencer Name']}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${typeColor(campaign['Type'])}`}>
          {campaign['Type'][0]}
        </span>
      </div>
      {campaign['Product'] && (
        <p className="text-xs text-gray-400 mb-1.5 truncate">{campaign['Product']}</p>
      )}
      {campaign['Deliverable'] && (
        <p className="text-xs text-gray-500 truncate">{campaign['Deliverable']}</p>
      )}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2d3148]">
        {campaign['Rate'] && (
          <span className="text-xs text-emerald-400 font-medium">{campaign['Rate']}</span>
        )}
        <span className={`text-xs ml-auto ${days !== null && days >= 7 ? 'text-red-400' : days !== null && days >= 3 ? 'text-yellow-400' : 'text-gray-600'}`}>
          {days !== null ? `${days}d` : ''}
        </span>
      </div>
    </div>
  );
}

function KanbanColumn({ status, campaigns, onCardClick, onStatusChange }) {
  return (
    <div className="flex-shrink-0 w-56">
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs px-2 py-1 rounded border font-medium ${statusColor(status)}`}>
          {status}
        </span>
        <span className="text-xs text-gray-500">{campaigns.length}</span>
      </div>
      <div className="space-y-2 min-h-[100px]">
        {campaigns.map(c => (
          <CampaignCard
            key={c['ID']}
            campaign={c}
            onClick={onCardClick}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoard({ campaigns, filter, onCardClick }) {
  const { updateCampaignStatus } = useData();

  const filtered = useMemo(() => {
    return campaigns.filter(c => {
      if (filter.type && c['Type'] !== filter.type) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (!c['Influencer Name']?.toLowerCase().includes(q) &&
            !c['Product']?.toLowerCase().includes(q) &&
            !c['Status']?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [campaigns, filter]);

  const getColumns = () => {
    const type = filter.type;
    if (type === 'Paid') return PAID_ACTIVE;
    if (type === 'Retainer') return RETAINER_ACTIVE;
    if (type === 'Gifted') return GIFTED_ACTIVE;
    // Mixed: show all active statuses
    return [...new Set([...GIFTED_ACTIVE, ...PAID_ACTIVE, ...RETAINER_ACTIVE])];
  };

  const columns = getColumns();

  const byStatus = useMemo(() => {
    const map = {};
    columns.forEach(s => { map[s] = []; });
    filtered.forEach(c => {
      if (map[c['Status']]) {
        map[c['Status']].push(c);
      } else if (!DEAD_END_STATUSES.includes(c['Status'])) {
        map[c['Status']] = [c];
      }
    });
    return map;
  }, [filtered, columns]);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '400px' }}>
      {columns.map(status => (
        <KanbanColumn
          key={status}
          status={status}
          campaigns={byStatus[status] || []}
          onCardClick={onCardClick}
          onStatusChange={updateCampaignStatus}
        />
      ))}
    </div>
  );
}
