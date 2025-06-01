'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  TableCellsIcon,
  Squares2X2Icon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';
import { useDispatch } from 'react-redux';
import { updateDesign, deleteDesign, fetchDesigns } from '@/store/slices/designLibrarySlice';
import type { AppDispatch } from '@/store/store';
import React from 'react';
import DecoupledHeader from './DecoupledHeader';

interface DataViewProps<T> {
  data: T[];
  columns: {
    header: string;
    accessor: keyof T;
    render?: (value: any, row: T) => React.ReactNode;
  }[];
  onSort?: (column: keyof T) => void;
  onSearch?: (query: string) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  section?: string;
  tabKey?: string;
  initialVisibleColumns?: string[];
}

type ViewType = 'table' | 'grid' | 'card';

export default function DataView<T>({
  data,
  columns,
  onSort,
  onSearch,
  onSelectionChange,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  section = '',
  tabKey = '',
  initialVisibleColumns,
}: DataViewProps<T>) {
  const [viewType, setViewType] = useState<ViewType>('table');
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [lastClickedIdx, setLastClickedIdx] = useState<number | null>(null);
  const [rangeSelecting, setRangeSelecting] = useState(false);
  const [showRangeOptionsIdx, setShowRangeOptionsIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [showRowModal, setShowRowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'json' | 'form'>('json');
  const [rowPinnedFields, setRowPinnedFields] = useState<{ [rowId: string]: string[] }>({});
  const [pinnedFields, setPinnedFields] = useState<string[]>([]);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const [activePinnedPreview, setActivePinnedPreview] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  // Column visibility state
  const allColumnAccessors = columns.map(col => String(col.accessor));
  const [visibleColumns, setVisibleColumns] = useState<string[]>(initialVisibleColumns || allColumnAccessors);
  const filteredColumns = columns.filter(col => visibleColumns.includes(String(col.accessor)));

  // Filter state
  const [filterValue, setFilterValue] = useState('');

  // If a filter is applied, filter the data (simple string match on all fields)
  const filteredData = filterValue
    ? data.filter(row =>
        filteredColumns.some(col => {
          const value = row[col.accessor];
          return value && String(value).toLowerCase().includes(filterValue.toLowerCase());
        })
      )
    : data;

  // Helper to get unique key for a row
  const getRowId = (item: any) => item.id ?? item.order_number ?? item.uid ?? JSON.stringify(item);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(data.map(getRowId));
      setSelectedRowIds(allIds);
      onSelectionChange?.(data);
    } else {
      setSelectedRowIds(new Set());
      onSelectionChange?.([]);
    }
  };

  // Handle individual row selection with Shift+Click support
  const handleRowSelect = (rowId: string, checked: boolean, idx: number, event?: React.MouseEvent) => {
    let newSelectedRowIds = new Set(selectedRowIds);
    if (event && event.shiftKey && lastClickedIdx !== null) {
      // Shift+Click: select range
      const [start, end] = [lastClickedIdx, idx].sort((a, b) => a - b);
      const idsInRange = data.slice(start, end + 1).map(getRowId);
      console.log('Shift+Click detected:', { lastClickedIdx, idx, idsInRange });
      idsInRange.forEach(id => newSelectedRowIds.add(id));
      setSelectedRowIds(newSelectedRowIds);
      onSelectionChange?.(data.filter(item => newSelectedRowIds.has(getRowId(item))));
    } else {
      // Normal click
      if (checked) {
        newSelectedRowIds.add(rowId);
      } else {
        newSelectedRowIds.delete(rowId);
      }
      setSelectedRowIds(newSelectedRowIds);
      onSelectionChange?.(data.filter(item => newSelectedRowIds.has(getRowId(item))));
      setLastClickedIdx(idx);
      console.log('Normal click:', { idx, rowId });
    }
    // Always update lastClickedIdx for Shift+Click
    if (!event || !event.shiftKey) {
      setLastClickedIdx(idx);
    }
  };

  const handleEditClick = (item: T) => {
    setEditItem(item);
    setEditForm({ ...item });
  };

  const handleEditChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    await dispatch(updateDesign(editForm));
    setEditItem(null);
    setSelectedItem(null);
  };

  const handleDelete = async (uid: string) => {
    await dispatch(deleteDesign(uid));
    setSelectedItem(null);
  };

  // Add download handler for individual rows
  const handleRowDownload = (row: T) => {
    const blob = new Blob([JSON.stringify(row, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${section}-${tabKey}-${getRowId(row)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add intersection observer for infinite scroll
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const loadMoreTrigger = document.getElementById('load-more-trigger');
    if (loadMoreTrigger) {
      observer.observe(loadMoreTrigger);
    }

    return () => {
      if (loadMoreTrigger) {
        observer.unobserve(loadMoreTrigger);
      }
    };
  }, [onLoadMore, hasMore, isLoadingMore]);

  // Handle showing range options on checkbox click
  const handleCheckboxClick = (idx: number) => {
    setShowRangeOptionsIdx(idx);
  };

  // Helper to scroll to a pinned field
  const scrollToField = (fieldKey: string) => {
    const el = document.getElementById(`form-field-${fieldKey}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedField(fieldKey);
      setTimeout(() => setHighlightedField(null), 1200);
    }
  };

  // When a new row is selected, load its pinned fields
  useEffect(() => {
    if (selectedItem) {
      const rowId = getRowId(selectedItem);
      setPinnedFields(rowPinnedFields[rowId] || []);
    }
  }, [selectedItem]);

  // Helper to render view-only form fields
  const renderViewOnlyForm = (row: any) => {
    if (!row) return null;
    // Always pin designImageUrl at the top if present
    const entries = Object.entries(row);
    let fields = entries.map(([key, value]) => ({ key, value }));
    // Move designImageUrl to the top if present
    const designImageIdx = fields.findIndex(f => f.key === 'designImageUrl');
    let designImageField = null;
    if (designImageIdx !== -1) {
      designImageField = fields[designImageIdx];
      fields.splice(designImageIdx, 1);
    }
    // Sort pinned fields to the top (except designImageUrl)
    const pinned = fields.filter(f => pinnedFields.includes(f.key));
    const unpinned = fields.filter(f => !pinnedFields.includes(f.key));
    // Order pinned fields as in pinnedFields array
    pinned.sort((a, b) => pinnedFields.indexOf(a.key) - pinnedFields.indexOf(b.key));
    const orderedFields = [
      ...(designImageField ? [designImageField] : []),
      ...pinned,
      ...unpinned,
    ];
    return (
      <div className="space-y-2">
        {/* Pinned field header at the top */}
        {pinnedFields.length > 0 && (
          <div className="mb-2 flex flex-col max-w-full">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-blue-700 text-sm">Pinned:</span>
              {pinnedFields.map((key) => (
                <button
                  key={key}
                  className={`px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 hover:bg-blue-200 focus:outline-none ${activePinnedPreview === key ? 'ring-2 ring-blue-400' : ''}`}
                  onClick={() => setActivePinnedPreview(prev => prev === key ? null : key)}
                  type="button"
                >
                  {key}
                </button>
              ))}
            </div>
            {activePinnedPreview && (() => {
              const field = orderedFields.find(f => f.key === activePinnedPreview);
              if (!field) return null;
              return (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded flex flex-col items-start">
                  <span className="text-xs font-semibold text-blue-700 mb-1">{field.key}</span>
                  {field.key === 'designImageUrl' && field.value && typeof field.value === 'string' && field.value.startsWith('http') ? (
                    <img src={String(field.value)} alt="Design" className="mb-2 w-32 h-32 object-contain rounded border border-gray-200" />
                  ) : null}
                  <span className="text-xs break-all">
                    {typeof field.value === 'object' ? JSON.stringify(field.value) : String(field.value ?? '')}
                  </span>
                </div>
              );
            })()}
          </div>
        )}
        {orderedFields.map(({ key, value }) => (
          <div
            key={key}
            id={`form-field-${key}`}
            className={`flex flex-col relative transition-all duration-300 ${highlightedField === key ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
          >
            <div className="flex items-center mb-1">
              <label className="text-xs font-semibold text-gray-500 mr-2">{key}</label>
              {/* Pin/unpin button, except for designImageUrl */}
              {key !== 'designImageUrl' && (
                <button
                  className={`ml-1 text-xs ${pinnedFields.includes(key) ? 'text-blue-600' : 'text-gray-400'} hover:text-blue-700`}
                  title={pinnedFields.includes(key) ? 'Unpin' : 'Pin to top'}
                  type="button"
                  onClick={() => {
                    setPinnedFields(prev => {
                      const rowId = getRowId(row);
                      const newPins = prev.includes(key)
                        ? prev.filter(f => f !== key)
                        : [...prev, key];
                      setRowPinnedFields(all => ({ ...all, [rowId]: newPins }));
                      return newPins;
                    });
                  }}
                >
                  {pinnedFields.includes(key) ? '📌' : '📍'}
                </button>
              )}
            </div>
            {/* Special rendering for designImageUrl */}
            {key === 'designImageUrl' && value && typeof value === 'string' && value.startsWith('http')
              ? <img src={String(value)} alt="Design" className="mb-2 w-32 h-32 object-contain rounded border border-gray-200" />
              : null}
            <input
              className="input input-sm bg-gray-100 border border-gray-200 rounded px-2 py-1 text-xs"
              value={typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}
              readOnly
            />
          </div>
        ))}
      </div>
    );
  };

  // Controls: stack vertically on mobile, horizontally on desktop
  return (
    <div className="flex flex-col flex-1 h-full min-h-0 p-0 m-0 bg-white">
      {/* Top controls: DecoupledHeader (left) and Filter (right) */}
      <div className="flex flex-row justify-between items-center w-full mb-2 gap-2">
        <div className="flex-1">
          <DecoupledHeader columns={columns.map(col => ({ header: col.header, accessor: String(col.accessor) }))} visibleColumns={visibleColumns} onColumnsChange={setVisibleColumns} />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="input input-sm border border-gray-300 rounded px-2 py-1 text-xs"
            placeholder="Filter..."
            value={filterValue}
            onChange={e => {
              setFilterValue(e.target.value);
              onSearch?.(e.target.value);
            }}
            style={{ minWidth: 120 }}
          />
        </div>
      </div>
      {/* Controls header with view toggles right-aligned */}
      <div className="flex flex-row justify-between items-center bg-white border-b p-0 m-0">
        <div />
        <div className="flex space-x-1 md:space-x-2 justify-end mt-2 sm:mt-0 p-2">
          <button
            onClick={() => setViewType('table')}
            className={`p-1 md:p-2 rounded-lg ${
              viewType === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <TableCellsIcon className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            onClick={() => setViewType('grid')}
            className={`p-1 md:p-2 rounded-lg ${
              viewType === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <ViewColumnsIcon className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            onClick={() => setViewType('card')}
            className={`p-1 md:p-2 rounded-lg ${
              viewType === 'card' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <Squares2X2Icon className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
      </div>

      {/* Clear Selection Button */}
      {selectedRowIds.size > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <button
            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            onClick={() => {
              setSelectedRowIds(new Set());
              setLastClickedIdx(null);
              setRangeSelecting(false);
              setShowRangeOptionsIdx(null);
              onSelectionChange?.([]);
            }}
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Scrollable Content Section */}
      <div className="flex-1 min-h-0 h-0 overflow-auto relative p-0 m-0">
        {/* Loading Overlay - Only show for initial load */}
        {data.length === 0 && !isLoadingMore && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {viewType === 'table' && (
          <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0 h-full">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm md:text-base">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedRowIds.size === data.length && data.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  {filteredColumns.map((column) => (
                    <th
                      key={String(column.header)}
                      className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => onSort?.(column.accessor as any)}
                    >
                      {column.header}
                    </th>
                  ))}
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item: any, index: number) => {
                  const rowId = getRowId(item);
                  const isChecked = selectedRowIds.has(rowId);
                  // Only allow range selection if nothing is selected or in range mode
                  const allowStart = !rangeSelecting && selectedRowIds.size === 0;
                  const allowEnd = rangeSelecting && lastClickedIdx !== null && index !== lastClickedIdx;
                  return (
                    <tr
                      key={rowId}
                      className={isChecked ? 'bg-blue-50 cursor-pointer' : 'cursor-pointer'}
                      style={{ height: '32px' }}
                      onClick={() => {
                        setSelectedItem(item);
                        setShowRowModal(true);
                        setModalTab('json');
                      }}
                    >
                      <td
                        className="px-2 py-1 whitespace-nowrap text-xs relative"
                        onMouseEnter={() => setHoveredIdx(index)}
                        onMouseLeave={() => setHoveredIdx(null)}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={isChecked}
                          disabled={rangeSelecting}
                          onChange={e => !rangeSelecting && handleRowSelect(rowId, e.target.checked, index)}
                          onClick={e => e.stopPropagation()}
                        />
                        {/* Range selection popover on hover */}
                        {hoveredIdx === index && allowStart && (
                          <span
                            className="absolute left-8 top-1 z-20 flex gap-1 bg-white shadow-lg border border-gray-200 rounded p-1"
                            style={{ minWidth: 50 }}
                          >
                            <button
                              className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs border border-green-400 hover:bg-green-200"
                              onClick={e => {
                                e.stopPropagation();
                                setLastClickedIdx(index);
                                setRangeSelecting(true);
                                setShowRangeOptionsIdx(null);
                                // Select the start checkbox
                                const startId = getRowId(data[index]);
                                const newSelected = new Set<string>([startId]);
                                setSelectedRowIds(newSelected);
                                onSelectionChange?.([data[index]]);
                              }}
                            >Start</button>
                          </span>
                        )}
                        {hoveredIdx === index && allowEnd && (
                          <span
                            className="absolute left-8 top-1 z-20 flex gap-1 bg-white shadow-lg border border-gray-200 rounded p-1"
                            style={{ minWidth: 50 }}
                          >
                            <button
                              className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs border border-blue-400 hover:bg-blue-200"
                              onClick={e => {
                                e.stopPropagation();
                                // Select the range from lastClickedIdx to index
                                if (lastClickedIdx !== null && index !== lastClickedIdx) {
                                  const [start, end] = [lastClickedIdx, index].sort((a, b) => a - b);
                                  const ids = new Set<string>(data.slice(start, end + 1).map(getRowId));
                                  setSelectedRowIds(ids);
                                  onSelectionChange?.(data.slice(start, end + 1));
                                }
                                setLastClickedIdx(null);
                                setRangeSelecting(false);
                                setShowRangeOptionsIdx(null);
                              }}
                            >End</button>
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap text-xs">
                        {index + 1}
                      </td>
                      {filteredColumns.map((column) => {
                        const value = item[column.accessor];
                        // If this is an image column, render a smaller image
                        if (column.header.toLowerCase().includes('image')) {
                          let src: string | undefined = undefined;
                          if (typeof value === 'string') {
                            src = value;
                          } else if (value && typeof value === 'object' && 'src' in value) {
                            src = (value as any).src;
                          }
                          return (
                            <td key={String(column.header)} className="px-2 py-1 whitespace-nowrap text-xs">
                              {src ? <img src={src} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} /> : null}
                            </td>
                          );
                        }
                        return (
                          <td key={String(column.header)} className="px-2 py-1 whitespace-nowrap text-xs">
                            {column.render ? (column.render(value, item) ?? String(value ?? '')) : String(value ?? '')}
                          </td>
                        );
                      })}
                      <td className="px-2 py-1 whitespace-nowrap text-xs">
                        <button
                          onClick={() => handleRowDownload(item)}
                          className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                          title="Download row data"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {viewType === 'grid' && (
          <div className="overflow-auto flex-1 min-h-0 h-full">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 p-1 gap-1">
              {filteredData.map((item: any, index: number) => (
                <div key={index} className="flex flex-col items-center gap-1 p-1 border border-blue-400 bg-white text-xs shadow-md">
                  {/* Image - clickable for modal */}
                  <div className="flex justify-center w-full">
                    {filteredColumns[0].render
                      ? filteredColumns[0].render(item[filteredColumns[0].accessor], item)
                      : <img src={String(item[filteredColumns[0].accessor])} alt="" className="w-28 h-28 object-cover rounded-lg" />
                    }
                  </div>
                  {/* Title */}
                  <div className="font-semibold text-base line-clamp-2 w-full text-center">
                    {filteredColumns[1].render
                      ? filteredColumns[1].render(item[filteredColumns[1].accessor], item)
                      : String(item[filteredColumns[1].accessor])}
                  </div>
                  {/* Description */}
                  <div className="text-gray-600 text-sm line-clamp-3 w-full text-center">
                    {filteredColumns[2].render
                      ? filteredColumns[2].render(item[filteredColumns[2].accessor], item)
                      : String(item[filteredColumns[2].accessor])}
                  </div>
                  {/* Date */}
                  <div className="text-xs text-gray-400 mt-auto w-full text-center">
                    {filteredColumns[4] && (filteredColumns[4].render
                      ? filteredColumns[4].render(item[filteredColumns[4].accessor], item)
                      : String(item[filteredColumns[4].accessor]))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {viewType === 'card' && (
          <div className="overflow-auto flex-1 min-h-0 h-full">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-2">
              {filteredData.map((item: any, index: number) => (
                <div key={index} className="flex flex-col items-center p-1 bg-white rounded shadow-md border-2 border-blue-400 cursor-pointer">
                  {/* Smaller image for compact card view */}
                  {filteredColumns[0].render
                    ? filteredColumns[0].render(item[filteredColumns[0].accessor], item)
                    : <img src={String(item[filteredColumns[0].accessor])} alt="" className="w-8 h-8 object-cover rounded-lg" />
                  }
                  {/* Optional: show a label or title below the image */}
                  {filteredColumns[1] && (
                    <div className="text-xs text-center mt-1 truncate w-full">
                      {filteredColumns[1].render
                        ? filteredColumns[1].render(item[filteredColumns[1].accessor], item)
                        : String(item[filteredColumns[1].accessor])}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Infinite scroll trigger */}
        {hasMore && (
          <div id="load-more-trigger" className="w-full flex justify-center py-4">
            {isLoadingMore ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-500">Loading more...</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">Scroll to load more</span>
            )}
          </div>
        )}

        {/* Row Modal */}
        {showRowModal && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-4 relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
                onClick={() => setShowRowModal(false)}
                title="Close"
              >
                &times;
              </button>
              <div className="flex border-b mb-4">
                <button
                  className={`px-4 py-2 text-sm font-semibold border-b-2 ${modalTab === 'json' ? 'border-blue-500 text-blue-700' : 'border-transparent text-gray-500'}`}
                  onClick={() => setModalTab('json')}
                >JSON</button>
                <button
                  className={`px-4 py-2 text-sm font-semibold border-b-2 ${modalTab === 'form' ? 'border-blue-500 text-blue-700' : 'border-transparent text-gray-500'}`}
                  onClick={() => setModalTab('form')}
                >Form</button>
              </div>
              <div className="max-h-96 overflow-auto">
                {modalTab === 'json' && (
                  <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">
                    {JSON.stringify(selectedItem, null, 2)}
                  </pre>
                )}
                {modalTab === 'form' && renderViewOnlyForm(selectedItem)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 