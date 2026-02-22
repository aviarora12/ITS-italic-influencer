import React from 'react';
import { useApp } from '../../context/AppContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border cursor-pointer transition-all
            ${t.type === 'error'
              ? 'bg-red-900/90 border-red-700 text-red-100'
              : t.type === 'warning'
              ? 'bg-yellow-900/90 border-yellow-700 text-yellow-100'
              : 'bg-surface-2 border-green-700 text-green-100'
            }`}
          style={{ minWidth: '260px', backdropFilter: 'blur(8px)' }}
        >
          <span className="text-lg">
            {t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : '✓'}
          </span>
          <span className="text-sm font-medium">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
