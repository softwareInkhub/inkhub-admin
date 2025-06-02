import React from "react";
import Filtering from "./Filtering";

interface FilterBarProps {
  status: string;
  setStatus: (v: string) => void;
  statusOptions: string[];
  type: string;
  setType: (v: string) => void;
  typeOptions: string[];
  board: string;
  setBoard: (v: string) => void;
  boardOptions: string[];
  smartField: string;
  setSmartField: (v: string) => void;
  smartFieldOptions: { label: string; value: string }[];
  smartValue: string;
  setSmartValue: (v: string) => void;
  onReset: () => void;
}

export default function FilterBar({
  status, setStatus, statusOptions,
  type, setType, typeOptions,
  board, setBoard, boardOptions,
  smartField, setSmartField, smartFieldOptions,
  smartValue, setSmartValue,
  onReset
}: FilterBarProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 shadow-sm">
      <div className="flex flex-wrap gap-2 flex-1 items-center">
        <Filtering
          filters={statusOptions}
          value={status}
          onFilterChange={setStatus}
          label="Status"
        />
        <Filtering
          filters={typeOptions}
          value={type}
          onFilterChange={setType}
          label="Type"
        />
        <Filtering
          filters={boardOptions}
          value={board}
          onFilterChange={setBoard}
          label="Board"
        />
        {/* Smart field+value filter */}
        <div className="flex items-center gap-2">
          <select
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={smartField}
            onChange={e => setSmartField(e.target.value)}
          >
            {smartFieldOptions.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          <input
            className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            value={smartValue}
            onChange={e => setSmartValue(e.target.value)}
            placeholder={`Filter by ${smartFieldOptions.find(f => f.value === smartField)?.label || ""}`}
          />
        </div>
      </div>
      <button
        className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-medium transition-colors"
        onClick={onReset}
        title="Clear all filters"
        type="button"
      >
        Clear
      </button>
    </div>
  );
} 