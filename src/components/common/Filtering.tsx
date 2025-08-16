"use client";
import React from "react";

interface FilteringProps {
  filters: string[];
  value: string;
  onFilterChange: (value: string) => void;
  label?: string;
}

export default function Filtering({ filters, value, onFilterChange, label = "Filter" }: FilteringProps) {
  return (
    <div className="flex items-center gap-2">
      {label && <label className="text-xs font-medium text-gray-500 mr-1">{label}:</label>}
      <select
        className="input input-sm rounded-full border-gray-300 text-xs px-2 py-1"
        value={value}
        onChange={e => onFilterChange(e.target.value)}
      >
        {filters.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
