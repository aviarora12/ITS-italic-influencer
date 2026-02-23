import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { SkeletonCard } from '../components/common/Skeleton';
import { statusColor, formatDateTime } from '../utils/formatters';

function StatCard({ label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo: 'border-indigo-800/50 bg-indigo-900/10',
    green: 'border-green-800/50 bg-green-900/10',
    yellow: 'border-yellow-800/50 bg-yellow-900/10',
    red: 'border-red-800/50 bg-red-900/10',
  };
  return (
    <div className={`border rounded-xl p-5 ${colors[color]}`}>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-300">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { campaigns, shipments, activity, reminders, loading } = useData();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const active = campaigns.filter(c =>
      !['Complete', 'Not Interested', 'No Response', 'Ghosted', 'Too Expensive', 'Posted'].includes(c['Status'])
    );
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const postsThisWeek = campaigns.filter(c => {
      const updated = new Date(c['Updated At'] || c['Created At']);
      return c['Status'] === 'Posted' && updated >= thisWeek;
    });
    const pendingShipments = shipments.filter(s => !s['Date Delivered']);
    const todayReminders = reminders.filter(r => r.priority === 'high');
    return { active, postsThisWeek, pendingShipments, todayReminders };
  }, [campaigns, shipments, reminders]);

  const recentActivity = useMemo(() => {
    return [...activity]
      .sort((a, b) => new Date(b['Created At']) - new Date(a['Created At']))
      .slice(0, 8);
  }, [activity]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 w-48 bg-[#242736] rounded animate-pulse mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Overview of your influencer campaigns</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Campaigns" value={stats.active.length} color="indigo" />
        <StatCard label="Posts This Week" value={stats.postsThisWeek.length} color="green" />
        <StatCard label="Pending Delivery" value={stats.pendingShipments.length} sub="shipments in transit" color="yellow" />
        <StatCard
          label="Follow-ups Due"
          value={stats.todayReminders.length}
          sub="high priority"
          color={stats.todayReminders.length > 0 ? 'red' : 'indigo'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follow-ups */}
        <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d3148]">
            <h2 className="font-semibold text-white">Follow-ups</h2>
            <button
              onClick={() => navigate('/followups')}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              View all →
            </button>
          </div>
          <div className="divide-y divide-[#2d3148]">
            {reminders.slice(0, 6).length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500 text-sm">No follow-ups right now</div>
            ) : (
              reminders.slice(0, 6).map(r => (
                <div
                  key={r.id}
                  className="px-5 py-3 flex items-start gap-3 hover:bg-[#242736] cursor-pointer transition-colors"
                  onClick={() => navigate(`/campaigns?highlight=${r.campaignId}`)}
                >
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    r.priority === 'high' ? 'bg-red-400' : 'bg-yellow-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{r.influencerName}</div>
                    <div className="text-xs text-gray-400">{r.reason}</div>
                    {r.detail && <div className="text-xs text-gray-500 mt-0.5">{r.detail}</div>}
                  </div>
                  {r.daysSinceUpdate !== null && (
                    <div className="text-xs text-gray-500 flex-shrink-0">{r.daysSinceUpdate}d ago</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#2d3148]">
            <h2 className="font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="divide-y divide-[#2d3148]">
            {recentActivity.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500 text-sm">No activity yet</div>
            ) : (
              recentActivity.map(a => (
                <div key={a['ID']} className="px-5 py-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium">{a['Influencer Name']}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{a['Note']}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{formatDateTime(a['Created At'])}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pipeline overview */}
      <div className="mt-6 bg-[#1a1d27] border border-[#2d3148] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d3148]">
          <h2 className="font-semibold text-white">Campaign Pipeline</h2>
          <button onClick={() => navigate('/campaigns')} className="text-xs text-indigo-400 hover:text-indigo-300">
            Open Campaigns →
          </button>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            {campaigns.slice(0, 12).map(c => (
              <div
                key={c['ID']}
                className="flex items-center gap-2 bg-[#242736] border border-[#3d4160] rounded-lg px-3 py-2 cursor-pointer hover:border-indigo-600 transition-colors"
                onClick={() => navigate(`/campaigns?highlight=${c['ID']}`)}
              >
                <span className="text-xs font-medium text-white">{c['Influencer Name']}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${statusColor(c['Status'])}`}>{c['Status']}</span>
              </div>
            ))}
            {campaigns.length > 12 && (
              <div className="flex items-center text-xs text-gray-500 px-3">
                +{campaigns.length - 12} more
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
