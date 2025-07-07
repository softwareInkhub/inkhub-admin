import React from 'react';

type FilterBarProps = {
  searchValue: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: () => void;
  sortOptions?: { label: string; value: string }[];
  sortValue?: string;
  onSortChange?: (v: string) => void;
  statusOptions?: string[];
  statusValue?: string;
  onStatusChange?: (v: string) => void;
  showStatus?: boolean;
  showFulfillment?: boolean;
  fulfillmentOptions?: string[];
  fulfillmentValue?: string;
  onFulfillmentChange?: (v: string) => void;
  showDateRange?: boolean;
  dateRangeValue?: any;
  onDateRangeChange?: (v: any) => void;
  onResetFilters?: () => void;
  children?: React.ReactNode;
};

export default function FilterBar(props: FilterBarProps) {
  return (
    <div className="flex gap-2 items-center bg-gray-100 p-2 rounded">
      <input
        type="text"
        value={props.searchValue}
        onChange={e => props.onSearchChange(e.target.value)}
        placeholder="Search..."
        className="border rounded px-2 py-1"
        onKeyDown={e => { if (e.key === 'Enter') props.onSearchSubmit(); }}
      />
      <button onClick={props.onSearchSubmit} className="px-2 py-1 bg-gray-800 text-white rounded">🔍</button>
      {props.sortOptions && (
        <select value={props.sortValue} onChange={e => props.onSortChange?.(e.target.value)} className="border rounded px-2 py-1">
          {props.sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}
      {props.showStatus && props.statusOptions && (
        <select value={props.statusValue} onChange={e => props.onStatusChange?.(e.target.value)} className="border rounded px-2 py-1">
          {props.statusOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
      {props.showFulfillment && props.fulfillmentOptions && (
        <select value={props.fulfillmentValue} onChange={e => props.onFulfillmentChange?.(e.target.value)} className="border rounded px-2 py-1">
          {props.fulfillmentOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
      {props.showDateRange && (
        <input
          type="text"
          value={props.dateRangeValue || ''}
          onChange={e => props.onDateRangeChange?.(e.target.value)}
          placeholder="Select date range"
          className="border rounded px-2 py-1"
        />
      )}
      {props.onResetFilters && (
        <button onClick={props.onResetFilters} className="px-3 py-1 bg-gray-200 rounded">Reset Filters</button>
      )}
      {props.children}
    </div>
  );
} 