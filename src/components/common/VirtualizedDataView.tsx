'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import ActionButtonsBar from './ActionButtonsBar';

export type DataViewColumn<T> = {
  header: string;
  accessor: keyof T;
  render?: (value: any, row: T) => React.ReactNode;
  width?: number;
};

export type VirtualizedDataViewProps<T> = {
  data: T[];
  columns: DataViewColumn<T>[];
  height?: number;
  itemHeight?: number;
  section: string;
  tabKey: string;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: number[]) => void;
  selectedRows?: number[];
  onSaveFilter?: () => void;
  showSaveFilter?: boolean;
};

function VirtualizedDataView<T>({
  data,
  columns,
  height = 600,
  itemHeight = 50,
  section,
  tabKey,
  onRowClick,
  onSelectionChange,
  selectedRows = [],
  onSaveFilter,
  showSaveFilter = true,
}: VirtualizedDataViewProps<T>) {
  const listRef = useRef<List>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map(col => String(col.accessor)));
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filterValue, setFilterValue] = useState('');

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filter
    if (filterValue) {
      result = result.filter((row: any) => {
        return visibleColumns.some(col => {
          const value = row[col];
          return String(value || '').toLowerCase().includes(filterValue.toLowerCase());
        });
      });
    }

    // Apply sort
    if (sortConfig) {
      result.sort((a: any, b: any) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filterValue, sortConfig, visibleColumns]);

  // Column widths calculation
  const columnWidths = useMemo(() => {
    return columns.map(col => col.width || 150);
  }, [columns]);

  const totalWidth = useMemo(() => {
    return columnWidths.reduce((sum, width) => sum + width, 0);
  }, [columnWidths]);

  // Row renderer for virtualization
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = processedData[index];
    const isSelected = selectedRows.includes(index);

    return (
      <div
        style={style}
        className={`flex items-center border-b hover:bg-gray-50 cursor-pointer ${
          isSelected ? 'bg-blue-50' : ''
        }`}
        onClick={() => onRowClick?.(row)}
      >
        {/* Checkbox */}
        <div className="w-8 flex items-center justify-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              const newSelection = e.target.checked
                ? [...selectedRows, index]
                : selectedRows.filter(i => i !== index);
              onSelectionChange?.(newSelection);
            }}
            className="rounded border-gray-300"
          />
        </div>
        
        {/* Row number */}
        <div className="w-12 flex items-center justify-center text-sm text-gray-500">
          {index + 1}
        </div>

        {/* Data cells */}
        {columns.map((col, colIndex) => {
          if (!visibleColumns.includes(String(col.accessor))) return null;
          
          return (
            <div
              key={String(col.accessor)}
              className="px-2 py-1 text-sm truncate"
              style={{ width: columnWidths[colIndex] }}
            >
              {col.render 
                ? col.render(row[col.accessor], row)
                : String(row[col.accessor] ?? '')
              }
            </div>
          );
        })}
      </div>
    );
  }, [processedData, selectedRows, columns, visibleColumns, columnWidths, onRowClick, onSelectionChange]);

  // Header component
  const Header = useCallback(() => {
    return (
      <div className="flex items-center bg-gray-100 border-b sticky top-0 z-10">
        {/* Checkbox header */}
        <div className="w-8 flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedRows.length === processedData.length && processedData.length > 0}
            ref={el => {
              if (el) el.indeterminate = selectedRows.length > 0 && selectedRows.length < processedData.length;
            }}
            onChange={(e) => {
              const newSelection = e.target.checked
                ? processedData.map((_, i) => i)
                : [];
              onSelectionChange?.(newSelection);
            }}
            className="rounded border-gray-300"
          />
        </div>

        {/* Row number header */}
        <div className="w-12 flex items-center justify-center text-sm font-semibold text-gray-700">
          #
        </div>

        {/* Column headers */}
        {columns.map((col, colIndex) => {
          if (!visibleColumns.includes(String(col.accessor))) return null;
          
          return (
            <div
              key={String(col.accessor)}
              className="px-2 py-2 text-sm font-semibold text-gray-700 flex items-center justify-between"
              style={{ width: columnWidths[colIndex] }}
            >
              <span>{col.header}</span>
              
              {/* Sort button */}
              <button
                onClick={() => {
                  setSortConfig(prev => {
                    if (prev?.key === String(col.accessor)) {
                      if (prev.direction === 'asc') {
                        return { key: String(col.accessor), direction: 'desc' };
                      } else {
                        return null;
                      }
                    } else {
                      return { key: String(col.accessor), direction: 'asc' };
                    }
                  });
                }}
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                {sortConfig?.key === String(col.accessor) ? (
                  sortConfig.direction === 'asc' ? '↑' : '↓'
                ) : (
                  '↕'
                )}
              </button>
            </div>
          );
        })}
      </div>
    );
  }, [columns, visibleColumns, columnWidths, selectedRows, processedData, onSelectionChange, sortConfig]);

  // Get selected data for download
  const selectedData = useMemo(() => {
    return selectedRows.map(index => processedData[index]).filter(Boolean);
  }, [selectedRows, processedData]);

  return (
    <div className="w-full bg-white border rounded shadow">
      {/* Action Buttons Bar - Separate Container Above */}
      <ActionButtonsBar
        selectedRows={selectedRows}
        totalRows={processedData.length}
        visibleColumns={visibleColumns}
        allColumns={columns}
        onVisibleColumnsChange={setVisibleColumns}
        onSaveFilter={onSaveFilter}
        section={section}
        tabKey={tabKey}
        selectedData={selectedData}
        showSaveFilter={showSaveFilter}
      />

      {/* Main Toolbar - Search Only */}
      <div className="flex items-center justify-between p-2 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          />
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Showing {processedData.length} of {data.length} items
          </span>
        </div>
      </div>

      {/* Virtualized table */}
      <div style={{ height, width: '100%' }}>
        <Header />
        <List
          ref={listRef}
          height={height - 140} // Subtract header and toolbar heights
          itemCount={processedData.length}
          itemSize={itemHeight}
          width="100%"
        >
          {Row}
        </List>
      </div>
    </div>
  );
}

export default VirtualizedDataView; 