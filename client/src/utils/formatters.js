export function formatFollowers(count) {
  const n = parseInt(count, 10);
  if (isNaN(n)) return count || '—';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return Math.floor((d.getTime() - Date.now()) / 86400000);
}

export function statusColor(status) {
  const map = {
    // Gifted track
    'DM Sent': 'bg-blue-900/50 text-blue-300 border-blue-700',
    'Interested': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    'Address Collected': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    'Product Sent': 'bg-orange-900/50 text-orange-300 border-orange-700',
    'Delivered': 'bg-purple-900/50 text-purple-300 border-purple-700',
    'Posted': 'bg-green-900/50 text-green-300 border-green-700',
    'Converted to Paid': 'bg-green-900/50 text-green-300 border-green-700',
    // Dead ends
    'Not Interested': 'bg-gray-800 text-gray-400 border-gray-600',
    'No Response': 'bg-gray-800 text-gray-400 border-gray-600',
    'Too Expensive': 'bg-gray-800 text-gray-400 border-gray-600',
    // Paid track
    'Reached Out': 'bg-blue-900/50 text-blue-300 border-blue-700',
    'Rate Negotiating': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
    'Contract Sent': 'bg-orange-900/50 text-orange-300 border-orange-700',
    'Contract Signed': 'bg-purple-900/50 text-purple-300 border-purple-700',
    'Complete': 'bg-green-900/50 text-green-300 border-green-700',
    // Dead ends paid
    'Ghosted': 'bg-gray-800 text-gray-400 border-gray-600',
    // Retainer
    'Active': 'bg-green-900/50 text-green-300 border-green-700',
    'Paused': 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  };
  return map[status] || 'bg-gray-800 text-gray-300 border-gray-600';
}

export function typeColor(type) {
  const map = {
    'Gifted': 'bg-indigo-900/50 text-indigo-300',
    'Paid': 'bg-emerald-900/50 text-emerald-300',
    'Retainer': 'bg-amber-900/50 text-amber-300',
  };
  return map[type] || 'bg-gray-800 text-gray-300';
}

export const GIFTED_STATUSES = [
  'DM Sent', 'Interested', 'Address Collected', 'Product Sent',
  'Delivered', 'Posted', 'Converted to Paid',
  'Not Interested', 'No Response', 'Too Expensive',
];

export const PAID_STATUSES = [
  'Reached Out', 'Interested', 'Rate Negotiating', 'Contract Sent',
  'Contract Signed', 'Product Sent', 'Posted', 'Complete',
  'Not Interested', 'Ghosted',
];

export const RETAINER_STATUSES = ['Active', 'Paused', 'Complete'];

export const DEAD_END_STATUSES = ['Not Interested', 'No Response', 'Too Expensive', 'Ghosted'];

export function getStatusesForType(type) {
  if (type === 'Paid') return PAID_STATUSES;
  if (type === 'Retainer') return RETAINER_STATUSES;
  return GIFTED_STATUSES;
}

export function isDeadEnd(status) {
  return DEAD_END_STATUSES.includes(status);
}
