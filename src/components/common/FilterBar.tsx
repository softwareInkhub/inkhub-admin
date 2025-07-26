import React from 'react';

type FilterBarProps = {
  searchValue: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: () => void;
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
      {props.children}
    </div>
  );
} 