import React, { useState, useRef, useEffect } from 'react';

const VIEW_MODES = [
  {
    value: 'table',
    label: 'Table',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    value: 'grid',
    label: 'Grid',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
        <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
        <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
        <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    value: 'card',
    label: 'Card',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="7" width="18" height="10" rx="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 10h18" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
];

interface ViewModeDropdownProps {
  value: 'table' | 'grid' | 'card';
  onChange: (mode: 'table' | 'grid' | 'card') => void;
}

export default function ViewModeDropdown({ value, onChange }: ViewModeDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const current = VIEW_MODES.find(m => m.value === value) || VIEW_MODES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 flex items-center gap-2 transition-all duration-200 shadow-sm"
        onClick={() => setOpen(v => !v)}
        title={current.label}
      >
        {current.icon}
        <span>{current.label}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {VIEW_MODES.map(mode => (
            <button
              key={mode.value}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 transition-colors ${value === mode.value ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-700'}`}
              onClick={() => {
                onChange(mode.value as any);
                setOpen(false);
              }}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 