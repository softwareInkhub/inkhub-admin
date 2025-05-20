import { useState } from 'react';

interface DataViewSectionProps {
  activeTab: string;
  analytics: any;
  data: any[];
  columns: { header: string; accessor: string }[];
}

const VIEW_TYPES = [
  { label: 'Table', value: 'table' },
  { label: 'Grid', value: 'grid' },
  { label: 'Card', value: 'card' },
];

export default function DataViewSection({ activeTab, analytics, data, columns }: DataViewSectionProps) {
  const [viewType, setViewType] = useState('table');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Sorting logic
  let sortedData = [...data];
  if (sortBy) {
    sortedData.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortDir === 'asc' ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Render table view
  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded-lg">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="px-4 py-2 border-b bg-gray-50 text-left cursor-pointer select-none"
                onClick={() => {
                  if (sortBy === col.accessor) {
                    setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(col.accessor);
                    setSortDir('asc');
                  }
                }}
              >
                {col.header}
                {sortBy === col.accessor && (sortDir === 'asc' ? ' ▲' : ' ▼')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.accessor} className="px-4 py-2 border-b">
                  {row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render grid view
  const renderGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {sortedData.map((row, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4">
          {columns.map((col) => (
            <div key={col.accessor} className="mb-1">
              <span className="font-semibold text-gray-700">{col.header}: </span>
              <span>{row[col.accessor]}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // Render card view
  const renderCard = () => (
    <div className="flex flex-wrap gap-4">
      {sortedData.map((row, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6 min-w-[220px]">
          {columns.map((col) => (
            <div key={col.accessor} className="mb-2">
              <span className="font-semibold text-gray-700">{col.header}: </span>
              <span>{row[col.accessor]}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Quick actions: view type, sorting */}
      <div className="flex items-center space-x-4">
        <span className="font-medium text-gray-700">View:</span>
        {VIEW_TYPES.map((v) => (
          <button
            key={v.value}
            className={`btn btn-secondary ${viewType === v.value ? 'bg-primary-100 text-primary-700' : ''}`}
            onClick={() => setViewType(v.value)}
          >
            {v.label}
          </button>
        ))}
      </div>
      {/* Data view */}
      {viewType === 'table' && renderTable()}
      {viewType === 'grid' && renderGrid()}
      {viewType === 'card' && renderCard()}
    </div>
  );
} 