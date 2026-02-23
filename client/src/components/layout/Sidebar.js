import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '⊞', exact: true },
  { path: '/influencers', label: 'Influencers', icon: '◉' },
  { path: '/campaigns', label: 'Campaigns', icon: '◈' },
  { path: '/shipments', label: 'Shipments', icon: '◫' },
  { path: '/content', label: 'Content', icon: '▣' },
  { path: '/contracts', label: 'Contracts', icon: '◧' },
  { path: '/followups', label: 'Follow-ups', icon: '◎', badge: true },
];

export default function Sidebar() {
  const { reminders } = useData();
  const location = useLocation();
  const urgentCount = reminders.filter(r => r.priority === 'high').length;

  return (
    <div className="w-56 bg-[#0a0c14] border-r border-[#1e2235] flex flex-col h-screen fixed left-0 top-0 z-10">
      <div className="px-5 py-5 border-b border-[#1e2235]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">I</div>
          <div>
            <div className="text-sm font-semibold text-white leading-tight">Italic</div>
            <div className="text-xs text-gray-500">Influencer Hub</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${isActive
                  ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1d27]'
                }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && urgentCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {urgentCount > 9 ? '9+' : urgentCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
