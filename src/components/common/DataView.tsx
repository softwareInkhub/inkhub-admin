'use client';

import React, { useRef, useEffect, useState } from 'react';

export type DataViewColumn<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: any, row: T) => React.ReactNode;
};

export type DataViewProps<T> = {
  data: T[];
  columns: DataViewColumn<T>[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  viewType?: 'table' | 'grid';
  scrollBuffer?: number; // px from bottom to trigger load more
};

function DataView<T>({
  data,
  columns,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  viewType = 'table',
  scrollBuffer = 100,
}: DataViewProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Checkbox selection state
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const allChecked = data.length > 0 && selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  const handleMasterCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(data.map((_, i) => i));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowCheckbox = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(prev => [...prev, idx]);
    } else {
      setSelectedRows(prev => prev.filter(i => i !== idx));
    }
  };

  useEffect(() => {
    // If data changes, reset selection
    setSelectedRows([]);
  }, [data]);

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollRef.current;
      if (!container || !onLoadMore || isLoadingMore || !hasMore) return;
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      if (distanceFromBottom < scrollBuffer) {
        onLoadMore();
      }
    };
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [onLoadMore, isLoadingMore, hasMore, scrollBuffer]);

  return (
    <div
      ref={scrollRef}
      className="w-full h-[53vh] overflow-y-auto bg-white border rounded shadow"
      style={{ minHeight: 200 }}
    >
      {viewType === 'table' && (
        <table className="min-w-full text-xs text-left">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {/* Checkbox Column */}
              <th className="px-3 py-2 font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={el => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={handleMasterCheckbox}
                />
              </th>
              {/* Serial Number Column */}
              <th className="px-3 py-2 font-semibold text-gray-700">#</th>
              {columns.map((col) => (
                <th key={String(col.accessor)} className="px-3 py-2 font-semibold text-gray-700">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b last:border-b-0 hover:bg-gray-50">
                {/* Checkbox Cell */}
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(i)}
                    onChange={handleRowCheckbox(i)}
                  />
                </td>
                {/* Serial Number Cell */}
                <td className="px-3 py-2">{i + 1}</td>
                {columns.map((col) => (
                  <td key={String(col.accessor)} className="px-3 py-2">
                    {col.render ? col.render(row[col.accessor], row) : String(row[col.accessor] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        )}
        {viewType === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          {data.map((row, i) => (
            <div key={i} className="bg-gray-50 border rounded p-3 shadow-sm">
              {columns.map((col) => (
                <div key={String(col.accessor)} className="mb-1">
                  <span className="font-semibold text-gray-600 mr-1">{col.header}:</span>
                  {col.render ? col.render(row[col.accessor], row) : String(row[col.accessor] ?? '')}
                </div>
              ))}
                          </div>
                        ))}
                      </div>
                    )}
      {/* Load more trigger */}
        {hasMore && (
        <div className="w-full flex justify-center py-4">
            {isLoadingMore ? (
              <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-500">Loading more...</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">Scroll to load more</span>
            )}
          </div>
        )}
    </div>
  );
} 

export default DataView; 