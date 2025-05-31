import React, { useState } from 'react';

interface DecoupledHeaderProps {
  columns: { header: string; accessor: string }[];
  visibleColumns: string[];
  onColumnsChange: (visible: string[]) => void;
}

export default function DecoupledHeader({ columns, visibleColumns, onColumnsChange }: DecoupledHeaderProps) {
  const [open, setOpen] = useState(false);

  const handleToggleColumn = (accessor: string) => {
    if (visibleColumns.includes(accessor)) {
      onColumnsChange(visibleColumns.filter(col => col !== accessor));
    } else {
      onColumnsChange([...visibleColumns, accessor]);
    }
  };

  return (
    <div className="flex justify-between items-center w-full relative mb-2 gap-2 bg-white p-3 rounded shadow-sm"
         style={{ maxWidth: 700, width: '100%', flexWrap: 'wrap' }}>
      {/* Active columns as chips (left) */}
      <div className="flex flex-wrap gap-1">
        {columns.filter(col => visibleColumns.includes(col.accessor)).map(col => (
          <span
            key={col.accessor}
            className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-200"
          >
            {col.header}
          </span>
        ))}
      </div>
      {/* Settings button (right) */}
      <button
        className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
        onClick={() => setOpen(o => !o)}
        title="Configure columns"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded shadow-lg z-50 p-3">
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
        </div>
      )}
    </div>
  );
}
