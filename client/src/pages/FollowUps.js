import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { SkeletonCard } from '../components/common/Skeleton';

const TYPE_LABELS = {
  follow_up: 'Follow-up',
  check_in: 'Check-in',
  check_tracking: 'Check Tracking',
  whitelisting: 'Whitelisting',
  ad_expiry: 'Ad Access',
  contract_renewal: 'Contract Renewal',
  conversion: 'Conversion Opportunity',
};

const TYPE_ICON = {
  follow_up: '💬',
  check_in: '📦',
  check_tracking: '🔍',
  whitelisting: '✅',
  ad_expiry: '⏰',
  contract_renewal: '📄',
  conversion: '💰',
};

const TYPE_COLOR = {
  follow_up: 'bg-blue-900/20 border-blue-800',
  check_in: 'bg-purple-900/20 border-purple-800',
  check_tracking: 'bg-orange-900/20 border-orange-800',
  whitelisting: 'bg-yellow-900/20 border-yellow-800',
  ad_expiry: 'bg-red-900/20 border-red-800',
  contract_renewal: 'bg-amber-900/20 border-amber-800',
  conversion: 'bg-green-900/20 border-green-800',
};

export default function FollowUps() {
  const { reminders, loading } = useData();
  const navigate = useNavigate();

  const highPriority = reminders.filter(r => r.priority === 'high');
  const mediumPriority = reminders.filter(r => r.priority === 'medium');

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-[#242736] rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 gap-4">{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Follow-ups & Reminders</h1>
        <p className="text-gray-400 text-sm mt-1">
          {reminders.length} total · {highPriority.length} high priority · {mediumPriority.length} medium priority
        </p>
      </div>

      {reminders.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <div className="text-4xl mb-4">✓</div>
          <p className="text-lg font-medium text-gray-400 mb-2">All caught up!</p>
          <p className="text-sm">No follow-ups needed right now. Check back as your campaigns progress.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* High priority first */}
          {highPriority.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                High Priority ({highPriority.length})
              </h2>
              <div className="space-y-2">
                {highPriority.map(r => (
                  <ReminderRow key={r.id} reminder={r} onClick={() => navigate(`/campaigns?highlight=${r.campaignId}`)} />
                ))}
              </div>
            </div>
          )}

          {/* Medium priority */}
          {mediumPriority.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                Medium Priority ({mediumPriority.length})
              </h2>
              <div className="space-y-2">
                {mediumPriority.map(r => (
                  <ReminderRow key={r.id} reminder={r} onClick={() => navigate(`/campaigns?highlight=${r.campaignId}`)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReminderRow({ reminder, onClick }) {
  return (
    <div
      className={`border rounded-xl px-5 py-4 flex items-center gap-4 cursor-pointer hover:brightness-110 transition-all ${TYPE_COLOR[reminder.type] || 'bg-[#1a1d27] border-[#2d3148]'}`}
      onClick={onClick}
    >
      <div className="text-xl flex-shrink-0">{TYPE_ICON[reminder.type] || '•'}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-white">{reminder.influencerName}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${reminder.priority === 'high' ? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'}`}>
            {reminder.priority}
          </span>
        </div>
        <p className="text-sm text-gray-300">{reminder.reason}</p>
        {reminder.detail && <p className="text-xs text-gray-500 mt-0.5">{reminder.detail}</p>}
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-xs text-gray-500 mb-1">
          {TYPE_LABELS[reminder.type] || reminder.type}
        </div>
        {reminder.daysSinceUpdate !== null && (
          <div className={`text-sm font-medium ${reminder.daysSinceUpdate >= 7 ? 'text-red-400' : 'text-yellow-400'}`}>
            {reminder.daysSinceUpdate}d ago
          </div>
        )}
      </div>
      <div className="text-gray-600 text-sm flex-shrink-0">→</div>
    </div>
  );
}
