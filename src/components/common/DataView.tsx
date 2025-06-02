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
import GridView from './GridView';
import TableView from './TableView';
import UniversalOperationBar from './UniversalOperationBar';
import FilterBar from './FilterBar';
import ModalNavigator from './ModalNavigator';

interface DataViewProps<T> {
  data: T[];
  columns: {
    header: string;
    accessor: keyof T;
    render?: (value: any, row: T, viewType?: 'table' | 'grid' | 'card') => React.ReactNode;
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
  gridColumns?: {
    header: string;
    accessor: keyof T;
    render?: (value: any, row: T, viewType?: 'table' | 'grid' | 'card') => React.ReactNode;
  }[];
  // FilterBar props
  status?: string;
  setStatus?: (v: string) => void;
  statusOptions?: string[];
  type?: string;
  setType?: (v: string) => void;
  typeOptions?: string[];
  board?: string;
  setBoard?: (v: string) => void;
  boardOptions?: string[];
  smartField?: string;
  setSmartField?: (v: string) => void;
  smartFieldOptions?: { label: string; value: string }[];
  smartValue?: string;
  setSmartValue?: (v: string) => void;
  onResetFilters?: () => void;
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
  gridColumns,
  status,
  setStatus,
  statusOptions,
  type,
  setType,
  typeOptions,
  board,
  setBoard,
  boardOptions,
  smartField,
  setSmartField,
  smartFieldOptions,
  smartValue,
  setSmartValue,
  onResetFilters,
}: DataViewProps<T>) {
  const [viewType, setViewType] = useState<ViewType>('table');
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [lastClickedIdx, setLastClickedIdx] = useState<number | null>(null);
  const [rangeSelecting, setRangeSelecting] = useState(false);
  const [rangeStartIdx, setRangeStartIdx] = useState<number | null>(null);
  const [rangeEndIdx, setRangeEndIdx] = useState<number | null>(null);
  const [showRangeOptionsIdx, setShowRangeOptionsIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [showRowModal, setShowRowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'json' | 'form' | 'image'>('json');
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
  const getRowId = (item: unknown) => {
    if (!item || typeof item !== 'object') return '';
    const obj = item as Record<string, any>;
    return obj.id ?? obj.order_number ?? obj.uid ?? JSON.stringify(obj);
  };

  // Handle row selection
  const handleRowSelect = (rowId: string, checked: boolean) => {
    const newSelectedRowIds = new Set(selectedRowIds);
    if (checked) {
      newSelectedRowIds.add(rowId);
    } else {
      newSelectedRowIds.delete(rowId);
    }
    setSelectedRowIds(newSelectedRowIds);
    onSelectionChange?.(data.filter(item => newSelectedRowIds.has(getRowId(item))));
  };

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
    const imageSrc = getImageSrc(row);
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
        {/* Always show image at the top if present, except for design library */}
        {section !== 'design library' && imageSrc && (
          <img
            src={imageSrc}
            alt="Design"
            className="mb-2 w-32 h-32 object-contain rounded border border-gray-200"
          />
        )}
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

  // Range selection logic
  const handleRangeStart = (idx: number) => {
    setRangeStartIdx(idx);
    setRangeEndIdx(null);
    setRangeSelecting(true);
  };
  const handleRangeEnd = (idx: number) => {
    if (rangeStartIdx !== null) {
      setRangeEndIdx(idx);
      setRangeSelecting(false);
      // Select all rows in range
      const [start, end] = [rangeStartIdx, idx].sort((a, b) => a - b);
      const idsInRange = data.slice(start, end + 1).map(getRowId);
      const newSelectedRowIds = new Set(selectedRowIds);
      idsInRange.forEach(id => newSelectedRowIds.add(id));
      setSelectedRowIds(newSelectedRowIds);
      onSelectionChange?.(data.filter(item => newSelectedRowIds.has(getRowId(item))));
      setRangeStartIdx(null);
      setRangeEndIdx(null);
    }
  };
  const clearRangeSelection = () => {
    setRangeStartIdx(null);
    setRangeEndIdx(null);
    setRangeSelecting(false);
  };

  // Handle row click to open modal
  const handleRowClick = (item: T) => {
    setSelectedItem(item);
    setShowRowModal(true);
  };

  // Helper to get the best image src for any data type
  const getImageSrc = (item: any) =>
    // Shopify Products
    item.image?.src || item.image ||
    // Pinterest Pins
    item.Item?.media?.images?.['600x']?.url ||
    // Pinterest Boards
    item.Item?.media?.image_cover_url ||
    // Design Library
    item.designImageUrl ||
    // Fallbacks
    item.image_url || item.cover || item.thumbnail || item.productImage || '';

  const currentIndex = filteredData.findIndex(item => getRowId(item) === getRowId(selectedItem));
  const handleNext = () => {
    if (currentIndex < filteredData.length - 1) {
      setSelectedItem(filteredData[currentIndex + 1]);
    }
  };
  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedItem(filteredData[currentIndex - 1]);
    }
  };

  // Controls: stack vertically on mobile, horizontally on desktop
  return (
    <div className="flex flex-col flex-1 h-full min-h-0 p-0 m-0 bg-white">
      {/* Redesigned Top Controls: Card-style container for column selector and filter bar */}
      <div className="w-full mb-3">
        <div className="flex flex-col md:flex-row gap-2 items-stretch bg-gray-50 border border-gray-200 rounded-xl shadow-sm px-4 py-3">
          <div className="flex-1 min-w-0 flex items-center">
            <DecoupledHeader columns={columns.map(col => ({ header: col.header, accessor: String(col.accessor) }))} visibleColumns={visibleColumns} onColumnsChange={setVisibleColumns} />
          </div>
          <div className="flex-shrink-0 flex items-center justify-end">
            {(!!statusOptions?.length || !!typeOptions?.length || !!boardOptions?.length || !!smartFieldOptions?.length) && smartField && setSmartField && smartValue !== undefined && setSmartValue && onResetFilters && (
              <div className="w-full md:w-auto">
                <FilterBar
                  status={status || ''}
                  setStatus={setStatus || (() => {})}
                  statusOptions={statusOptions || []}
                  type={type || ''}
                  setType={setType || (() => {})}
                  typeOptions={typeOptions || []}
                  board={board || ''}
                  setBoard={setBoard || (() => {})}
                  boardOptions={boardOptions || []}
                  smartField={smartField}
                  setSmartField={setSmartField}
                  smartFieldOptions={smartFieldOptions || []}
                  smartValue={smartValue}
                  setSmartValue={setSmartValue}
                  onReset={onResetFilters}
                />
              </div>
            )}
          </div>
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
          <TableView 
            data={filteredData} 
            columns={filteredColumns} 
            selectedRows={selectedRowIds}
            onRowSelect={handleRowSelect}
            onSelectAll={handleSelectAll}
            rangeSelecting={rangeSelecting}
            rangeStartIdx={rangeStartIdx}
            onRangeStart={handleRangeStart}
            onRangeEnd={handleRangeEnd}
            hoveredIdx={hoveredIdx}
            setHoveredIdx={setHoveredIdx}
            onRowClick={handleRowClick}
          />
        )}
        {viewType === 'grid' && (
          <GridView
            data={filteredData}
            columns={gridColumns || filteredColumns}
            viewType="grid"
            onItemClick={(item) => {
              setSelectedItem(item);
              setShowRowModal(true);
              setModalTab('json');
            }}
          />
        )}
        {viewType === 'card' && (
          <div className="overflow-auto flex-1 min-h-0 h-full">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-2">
              {filteredData.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-1 bg-white rounded shadow-md border-2 border-blue-400 cursor-pointer"
                  onClick={() => {
                    setSelectedItem(item);
                    setShowRowModal(true);
                    setModalTab('json');
                  }}
                >
                  {/* Smaller image for compact card view */}
                  {filteredColumns[0].render
                    ? filteredColumns[0].render(item[filteredColumns[0].accessor], item, 'card')
                    : <img src={String(item[filteredColumns[0].accessor])} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                  }
                  {/* Optional: show a label or title below the image */}
                  {filteredColumns[1] && (
                    <div className="text-xs text-center mt-1 truncate w-full">
                      {filteredColumns[1].render
                        ? filteredColumns[1].render(item[filteredColumns[1].accessor], item, 'card')
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
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            onClick={() => setShowRowModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-lg max-w-lg w-full p-4 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
                onClick={() => setShowRowModal(false)}
                title="Close"
              >
                &times;
              </button>
              <div className="flex border-b mb-4">
                <button
                  className={`px-4 py-2 text-sm font-semibold border-b-2 ${modalTab === 'image' ? 'border-blue-500 text-blue-700' : 'border-transparent text-gray-500'}`}
                  onClick={() => setModalTab('image')}
                >Image & Details</button>
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
                {modalTab === 'image' && (
                  <div className="flex flex-col items-center">
                    <img
                      src={getImageSrc(selectedItem)}
                      alt="Large"
                      className="mb-4 rounded shadow max-h-80 object-contain"
                      style={{ maxWidth: '100%' }}
                    />
                  </div>
                )}
                {modalTab === 'json' && (
                  <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto">
                    {JSON.stringify(selectedItem, null, 2)}
                  </pre>
                )}
                {modalTab === 'form' && renderViewOnlyForm(selectedItem)}
              </div>
              <ModalNavigator
                currentIndex={currentIndex}
                total={filteredData.length}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 