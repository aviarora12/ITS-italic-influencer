import React from 'react';

export function SkeletonBlock({ className = '' }) {
  return (
    <div className={`animate-pulse bg-[#242736] rounded ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[#1a1d27] border border-[#2d3148] rounded-xl p-4 space-y-3">
      <SkeletonBlock className="h-4 w-3/4" />
      <SkeletonBlock className="h-3 w-1/2" />
      <SkeletonBlock className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="border-b border-[#2d3148]">
      {[1,2,3,4,5].map(i => (
        <td key={i} className="px-4 py-3">
          <SkeletonBlock className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-[#2d3148]">
          <SkeletonBlock className="h-4 flex-1" />
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
