import React, { useState } from 'react';

interface TableViewProps<T> {
  data: T[];
  columns: {
    header: string;
    accessor: keyof T;
    render?: (value: any, row: T, viewType?: 'table' | 'grid' | 'card') => React.ReactNode;
  }[];
  onRowClick?: (row: T) => void;
  selectedRows?: Set<string>;
  onRowSelect?: (rowId: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  rangeSelecting?: boolean;
  rangeStartIdx?: number | null;
  onRangeStart?: (idx: number) => void;
  onRangeEnd?: (idx: number) => void;
  hoveredIdx?: number | null;
  setHoveredIdx?: (idx: number | null) => void;
  onClearRange?: () => void;
}

function TableView<T>({ 
  data, 
  columns, 
  onRowClick,
  selectedRows = new Set(),
  onRowSelect,
  onSelectAll,
  rangeSelecting = false,
  rangeStartIdx = null,
  onRangeStart,
  onRangeEnd,
  hoveredIdx = null,
  setHoveredIdx,
  onClearRange
}: TableViewProps<T>) {
  // Helper to get unique key for a row
  const getRowId = (item: any) => item.id ?? item.order_number ?? item.uid ?? JSON.stringify(item);
  // Track which context menu is open
  const [openMenuIdx, setOpenMenuIdx] = useState<number | null>(null);

  return (
    <div className="overflow-auto max-h-[45vh]">
      <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm md:text-base">
        <thead className="bg-white sticky top-0 z-20 shadow-md">
          <tr>
            <th className="px-1 py-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={data.length > 0 && data.every(item => selectedRows.has(getRowId(item)))}
                onChange={(e) => onSelectAll?.(e.target.checked)}
              />
            </th>
            <th
              className="px-1 py-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap truncate overflow-hidden bg-white"
              style={{ textOverflow: 'ellipsis', maxWidth: 60 }}
            >
              #
            </th>
            {columns.map((column, idx) => (
              <th
                key={idx}
                className="px-1 py-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap truncate overflow-hidden bg-white"
                style={{ textOverflow: 'ellipsis', maxWidth: 140 }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="align-top">
          {/* Add a gap row after the header */}
          <tr>
            <td colSpan={columns.length + 2} className="bg-white" style={{ height: '6px', border: 'none', padding: 0 }}></td>
          </tr>
          {data.map((item, rowIdx) => {
            const rowId = getRowId(item);
            const isHovered = hoveredIdx === rowIdx;
            const isStart = rangeStartIdx === rowIdx;
            return (
              <tr
                key={rowIdx}
                className="cursor-pointer hover:bg-gray-50 relative"
                style={{ height: '24px' }}
                onClick={() => onRowClick?.(item)}
                onMouseEnter={() => { setHoveredIdx?.(rowIdx); setOpenMenuIdx(null); }}
                onMouseLeave={() => { setHoveredIdx?.(null); setOpenMenuIdx(null); }}
              >
                <td className="px-1 py-0 whitespace-nowrap relative">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedRows.has(rowId)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onRowSelect?.(rowId, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {/* Direct context menu for range selection on hover */}
                  {isHovered && (
                    <div className="absolute left-7 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-200 rounded shadow-lg min-w-[100px] flex flex-col text-xs">
                      <button
                        className="px-3 py-1 hover:bg-blue-100 text-left"
                        onClick={e => { e.stopPropagation(); onRangeStart?.(rowIdx); }}
                      >Start</button>
                      {rangeSelecting && !isStart && (
                        <button
                          className="px-3 py-1 hover:bg-blue-100 text-left"
                          onClick={e => { e.stopPropagation(); onRangeEnd?.(rowIdx); }}
                        >End</button>
                      )}
                      <button
                        className="px-3 py-1 hover:bg-red-100 text-left"
                        onClick={e => { e.stopPropagation(); onClearRange?.(); }}
                      >Clear Selection</button>
                    </div>
                  )}
                  {isStart && rangeSelecting && (
                    <span className="ml-2 px-2 py-0.5 bg-green-200 text-green-900 rounded text-xs border border-green-300 absolute left-7 top-1/2 -translate-y-1/2 z-10">Start</span>
                  )}
                </td>
                <td
                  className="px-1 py-0 whitespace-nowrap text-xs truncate overflow-hidden"
                  style={{ textOverflow: 'ellipsis', maxWidth: 60 }}
                >
                  {rowIdx + 1}
                </td>
                {columns.map((column, colIdx) => {
                  const value = item[column.accessor];
                  return (
                    <td
                      key={colIdx}
                      className="px-1 py-0 whitespace-nowrap text-xs truncate overflow-hidden"
                      style={{ textOverflow: 'ellipsis', maxWidth: 140 }}
                    >
                      {column.render ? column.render(value, item, 'table') : String(value ?? '')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TableView; 