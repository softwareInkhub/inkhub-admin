import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

interface CardConfigModalProps {
  open: boolean;
  onClose: () => void;
  allKeys: string[];
  selectedFields: string[];
  onChange: (fields: string[]) => void;
  title?: string;
}

const CardConfigModal: React.FC<CardConfigModalProps> = ({ open, onClose, allKeys, selectedFields, onChange, title }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-0 min-w-[320px] max-w-full w-full sm:w-[500px] relative animate-fadeInScale" onClick={e => e.stopPropagation()}>
        {/* Modal Header with Title and Clear All */}
        <div className="sticky top-0 z-10 bg-white rounded-t-xl flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <span className="font-bold text-lg">{title || 'Select fields to show'}</span>
          <div className="flex gap-2 items-center">
            <button
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-gray-700 transition-colors"
              onClick={e => { e.stopPropagation(); onChange([]); }}
              title="Clear all selections"
              type="button"
            >
              Clear All
            </button>
            <button
              className="text-gray-400 hover:text-red-500 text-xl px-2 py-1 rounded transition-colors"
              onClick={e => { e.stopPropagation(); onClose(); }}
              title="Close"
              type="button"
            >
              &times;
            </button>
          </div>
        </div>
        {/* Checkbox Grid */}
        <div className="max-h-[60vh] overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allKeys.map(key => (
            <label key={key} className="flex items-center gap-2 cursor-pointer py-2 px-2 rounded border border-gray-200 bg-white shadow-sm hover:shadow-md hover:bg-gray-50 focus-within:bg-gray-100 transition-all">
              <input
                type="checkbox"
                checked={selectedFields.includes(key)}
                onChange={() => {
                  if (selectedFields.includes(key)) {
                    onChange(selectedFields.filter(f => f !== key));
                  } else {
                    onChange([...selectedFields, key]);
                  }
                }}
                className="accent-blue-600"
              />
              <span className="truncate" title={key}>{key}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardConfigModal; 