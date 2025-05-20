'use client';

import { useState } from 'react';
import {
  TableCellsIcon,
  Squares2X2Icon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';

interface DataViewProps<T> {
  data: T[];
  columns: {
    header: string;
    accessor: keyof T;
    render?: (value: any) => React.ReactNode;
  }[];
  onSort?: (column: keyof T) => void;
  onSearch?: (query: string) => void;
}

type ViewType = 'table' | 'grid' | 'card';

export default function DataView<T>({
  data,
  columns,
  onSort,
  onSearch,
}: DataViewProps<T>) {
  const [viewType, setViewType] = useState<ViewType>('table');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const renderTableView = () => (
    <div className="overflow-auto flex-1 min-h-0">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.accessor)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort?.(column.accessor)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={String(column.accessor)} className="px-6 py-4 whitespace-nowrap">
                  {column.render
                    ? column.render(item[column.accessor])
                    : String(item[column.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGridView = () => (
    <div className="overflow-auto flex-1 min-h-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {data.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            {columns.map((column) => (
              <div key={String(column.accessor)} className="mb-2">
                <span className="font-medium text-gray-500">{column.header}: </span>
                {column.render
                  ? column.render(item[column.accessor])
                  : String(item[column.accessor])}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCardView = () => (
    <div className="overflow-auto flex-1 min-h-0">
      <div className="space-y-4 p-4">
        {data.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            {columns.map((column) => (
              <div key={String(column.accessor)} className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">{column.header}</h3>
                <div className="mt-1">
                  {column.render
                    ? column.render(item[column.accessor])
                    : String(item[column.accessor])}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Controls Section */}
      <div className="flex justify-between items-center p-4 bg-white border-b">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewType('table')}
            className={`p-2 rounded-lg ${
              viewType === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <TableCellsIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewType('grid')}
            className={`p-2 rounded-lg ${
              viewType === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewType('card')}
            className={`p-2 rounded-lg ${
              viewType === 'card' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <ViewColumnsIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 min-h-0">
        {viewType === 'table' && renderTableView()}
        {viewType === 'grid' && renderGridView()}
        {viewType === 'card' && renderCardView()}
      </div>
    </div>
  );
} 