import React from 'react';

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
  setHoveredIdx
}: TableViewProps<T>) {
  // Helper to get unique key for a row
  const getRowId = (item: any) => item.id ?? item.order_number ?? item.uid ?? JSON.stringify(item);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm md:text-base">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-1 py-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={data.length > 0 && data.every(item => selectedRows.has(getRowId(item)))}
                onChange={(e) => onSelectAll?.(e.target.checked)}
              />
            </th>
            <th
              className="px-1 py-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap truncate overflow-hidden"
              style={{ textOverflow: 'ellipsis', maxWidth: 60 }}
            >
              #
            </th>
            {columns.map((column, idx) => (
              <th
                key={idx}
                className="px-1 py-0 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap truncate overflow-hidden"
                style={{ textOverflow: 'ellipsis', maxWidth: 140 }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
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
                onMouseEnter={() => setHoveredIdx?.(rowIdx)}
                onMouseLeave={() => setHoveredIdx?.(null)}
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
                  {/* Range selection UI */}
                  {!rangeSelecting && isHovered && (
                    <button
                      className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs border border-green-200 absolute left-7 top-1/2 -translate-y-1/2 z-10"
                      onClick={e => {
                        e.stopPropagation();
                        onRangeStart?.(rowIdx);
                      }}
                    >
                      Start
                    </button>
                  )}
                  {rangeSelecting && !isStart && isHovered && (
                    <button
                      className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs border border-blue-200 absolute left-7 top-1/2 -translate-y-1/2 z-10"
                      onClick={e => {
                        e.stopPropagation();
                        onRangeEnd?.(rowIdx);
                      }}
                    >
                      End
                    </button>
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