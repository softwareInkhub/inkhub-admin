import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DecoupledHeaderProps {
  columns: { header: string; accessor: string }[];
  visibleColumns: string[];
  onColumnsChange: (visible: string[]) => void;
}

export default function DecoupledHeader({ columns, visibleColumns, onColumnsChange }: DecoupledHeaderProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  const handleToggleColumn = (accessor: string) => {
    if (visibleColumns.includes(accessor)) {
      onColumnsChange(visibleColumns.filter(col => col !== accessor));
    } else {
      onColumnsChange([...visibleColumns, accessor]);
    }
  };

  // Click-away to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Set dropdown position when opening
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.right - 224 + window.scrollX, // 224px = w-56
      });
    }
  }, [open]);

  return (
    <div className="flex justify-between items-center w-full relative bg-gradient-to-r from-white via-blue-50 to-white rounded-xl shadow p-2 gap-2 border border-blue-100" style={{ maxWidth: 700, width: '100%', flexWrap: 'wrap', minHeight: 0 }}>
      {/* Active columns as chips (left) */}
      <div className="flex flex-wrap gap-x-1 gap-y-1 items-center min-h-0 p-0 m-0">
        {columns.filter(col => visibleColumns.includes(col.accessor)).map(col => (
          <span
            key={col.accessor}
            className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs border border-blue-200 font-medium shadow-sm hover:bg-blue-200 transition-colors cursor-pointer"
            style={{lineHeight: '1.1', margin: 0}}
          >
            {col.header}
          </span>
        ))}
      </div>
      {/* Settings button (right) */}
      <button
        ref={buttonRef}
        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 focus:outline-none shadow-md border border-blue-200 transition-colors flex items-center justify-center"
        onClick={() => setOpen(o => !o)}
        title="Configure columns"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      {open && dropdownPos && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-56 bg-white border border-gray-200 rounded shadow-lg z-50 p-3"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-sm text-gray-700">Show Columns</span>
            <button
              className="ml-2 text-gray-400 hover:text-red-500 text-lg font-bold px-1"
              onClick={() => setOpen(false)}
              title="Close"
            >
              &times;
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {columns.map(col => (
              <label key={col.accessor} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(col.accessor)}
                  onChange={() => handleToggleColumn(col.accessor)}
                />
                {col.header}
              </label>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
