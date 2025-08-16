'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DecoupledHeaderProps {
  columns: { header: string; accessor: string }[];
  visibleColumns: string[];
  onColumnsChange: (visible: string[]) => void;
  setSidebarOpen: (open: boolean) => void;
}

export default function DecoupledHeader({ columns, visibleColumns, onColumnsChange }: DecoupledHeaderProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  const handleToggleColumn = (accessor: string) => {
    const newVisibleColumns = visibleColumns.includes(accessor)
      ? visibleColumns.filter(col => col !== accessor)
      : [...visibleColumns, accessor];
    onColumnsChange(newVisibleColumns);
  };

  const handleDropdownToggle = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
    setOpen(prev => !prev);
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
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        onClick={handleDropdownToggle}
      >
        Columns
      </button>

      {open && dropdownPos &&
        createPortal(
          <div
            ref={dropdownRef}
            className="origin-top-right absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
            style={{ top: `${dropdownPos.top}px`, left: `${dropdownPos.left}px` }}
          >
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              {columns.map(column => (
                <div key={column.accessor} className="flex items-center px-4 py-2">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(column.accessor)}
                    onChange={() => handleToggleColumn(column.accessor)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="ml-3 text-sm text-gray-700">{column.header}</label>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
