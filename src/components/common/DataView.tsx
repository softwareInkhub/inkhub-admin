'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  TableCellsIcon,
  Squares2X2Icon,
  ViewColumnsIcon,
  Cog6ToothIcon,
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
import CardConfigModal from './CardConfigModal';
import GridConfigModal from './GridConfigModal';
import TableConfigModal from './TableConfigModal';

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

// Utility to flatten nested objects into dot-separated keys
function flattenObject(obj: any, prefix = '', result: Record<string, any> = {}) {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenObject(value, newKey, result);
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

// Recursive component to render nested form fields with collapsible sections
const RenderNestedForm = React.memo(({ data, parentKey = '', openSections, toggleSection }: { data: any; parentKey?: string; openSections: Record<string, boolean>; toggleSection: (key: string) => void }) => {
  if (Array.isArray(data)) {
    const sectionKey = parentKey;
    const isOpen = openSections[sectionKey] ?? true;
    return (
      <div className="pl-4 border-l-2 border-gray-200 my-1">
        <button
          className="flex items-center gap-1 text-xs text-gray-500 mb-1 focus:outline-none"
          onClick={() => toggleSection(sectionKey)}
        >
          <span className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
          Array [{data.length}]
        </button>
        {isOpen && data.map((item, idx) => (
          <div key={idx} className="mb-2">
            <span className="text-xs font-semibold text-gray-400 mr-2">[{idx}]</span>
            <RenderNestedForm data={item} parentKey={`${sectionKey}[${idx}]`} openSections={openSections} toggleSection={toggleSection} />
          </div>
        ))}
      </div>
    );
  } else if (typeof data === 'object' && data !== null) {
    const sectionKey = parentKey;
    const isOpen = openSections[sectionKey] ?? true;
    return (
      <div className="pl-2 border-l-2 border-gray-100 my-1 space-y-2">
        <button
          className="flex items-center gap-1 text-xs text-gray-500 mb-1 focus:outline-none"
          onClick={() => toggleSection(sectionKey)}
        >
          <span className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
          Object
        </button>
        {isOpen && Object.entries(data).map(([key, value]) => {
          const childKey = sectionKey ? `${sectionKey}.${key}` : key;
          return (
            <div key={childKey} className="flex flex-col mb-1">
              <label className="text-xs font-semibold text-gray-500 mb-1">{key}</label>
              <RenderNestedForm data={value} parentKey={childKey} openSections={openSections} toggleSection={toggleSection} />
            </div>
          );
        })}
      </div>
    );
  } else if (typeof data === 'string' && (data.startsWith('http://') || data.startsWith('https://'))) {
    return (
      <a
        href={data}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline break-all text-xs whitespace-pre-line"
      >
        {data}
      </a>
    );
  } else {
    return (
      <div className="input input-sm bg-gray-100 border border-gray-200 rounded px-2 py-1 text-xs break-all whitespace-pre-line min-h-[32px]">
        {typeof data === 'object' ? JSON.stringify(data) : String(data ?? '')}
      </div>
    );
  }
});

// Recursive JSON Explorer with checkboxes, select all, priority, and collapsible objects/arrays
const JsonExplorer = ({ data, checkedFields, setCheckedFields, expandedFields, setExpandedFields, parentKey = '' }: {
  data: any;
  checkedFields: Set<string>;
  setCheckedFields: (fields: Set<string>) => void;
  expandedFields: Set<string>;
  setExpandedFields: (fields: Set<string>) => void;
  parentKey?: string;
}) => {
  // Helper to build a unique key for each field
  const getKey = (key: string | number) => (parentKey ? `${parentKey}.${key}` : String(key));

  // Helper to toggle checked state for a field and all its children
  const toggleCheck = (key: string, value: any, checked: boolean) => {
    const newChecked = new Set(checkedFields);
    const updateChildren = (val: any, k: string) => {
      newChecked[checked ? 'add' : 'delete'](k);
      if (typeof val === 'object' && val !== null) {
        if (Array.isArray(val)) {
          val.forEach((item, idx) => updateChildren(item, `${k}[${idx}]`));
        } else {
          Object.entries(val).forEach(([childKey, childVal]) => updateChildren(childVal, `${k}.${childKey}`));
        }
      }
    };
    updateChildren(value, key);
    setCheckedFields(newChecked);
  };

  // Helper to toggle expanded/collapsed state
  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(key)) newExpanded.delete(key);
    else newExpanded.add(key);
    setExpandedFields(newExpanded);
  };

  // Helper to check if all children are checked
  const areAllChildrenChecked = (value: any, key: string): boolean => {
    let allChecked = checkedFields.has(key);
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        allChecked = allChecked && value.every((item, idx) => areAllChildrenChecked(item, `${key}[${idx}]`));
      } else {
        allChecked = allChecked && Object.entries(value).every(([childKey, childVal]) => areAllChildrenChecked(childVal, `${key}.${childKey}`));
      }
    }
    return allChecked;
  };

  // Helper to render a field
  const renderField = (key: string | number, value: any) => {
    const fieldKey = getKey(key);
    const isChecked = checkedFields.has(fieldKey);
    const isExpanded = expandedFields.has(fieldKey);
    const isObject = typeof value === 'object' && value !== null;
    const isArray = Array.isArray(value);
    return (
      <div key={fieldKey} className="pl-2 border-l border-gray-200 my-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={e => toggleCheck(fieldKey, value, e.target.checked)}
            className="accent-blue-600"
          />
          {isObject ? (
            <button
              className="text-xs text-gray-600 font-mono px-1 py-0.5 rounded hover:bg-gray-100 focus:outline-none"
              onClick={() => toggleExpand(fieldKey)}
              type="button"
            >
              {isArray ? (isExpanded ? '[...]' : '[...]') : (isExpanded ? '{...}' : '{...}')}
            </button>
          ) : null}
          <span className="text-xs font-semibold text-gray-700 font-mono">{String(key)}</span>
          {!isObject && (
            typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')) ? (
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all text-xs whitespace-pre-line">{value}</a>
            ) : (
              <span className="text-xs break-all whitespace-pre-line">{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}</span>
            )
          )}
        </div>
        {isObject && isExpanded && (
          <div className="ml-4">
            {isArray
              ? value.map((item: any, idx: number) => renderField(idx, item))
              : Object.entries(value).map(([childKey, childVal]) => renderField(childKey, childVal))}
          </div>
        )}
      </div>
    );
  };

  // Priority: checked fields first
  let entries: [string | number, any][] = [];
  if (Array.isArray(data)) {
    entries = data.map((item, idx) => [idx, item]);
  } else if (typeof data === 'object' && data !== null) {
    entries = Object.entries(data);
  }
  const checkedEntries = entries.filter(([k]) => checkedFields.has(getKey(k)));
  const uncheckedEntries = entries.filter(([k]) => !checkedFields.has(getKey(k)));
  const orderedEntries = [...checkedEntries, ...uncheckedEntries];

  return (
    <div>
      {orderedEntries.map(([k, v]) => renderField(k, v))}
    </div>
  );
};

// Helper to check if all fields are checked in the JSON explorer
function areAllFieldsChecked(data: any, checkedFields: Set<string>, parentKey = 'root'): boolean {
  const checkKey = (key: string | number) => (parentKey ? `${parentKey}.${key}` : String(key));
  if (Array.isArray(data)) {
    return checkedFields.has(parentKey) && data.every((item, idx) => areAllFieldsChecked(item, checkedFields, `${parentKey}[${idx}]`));
  } else if (typeof data === 'object' && data !== null) {
    return checkedFields.has(parentKey) && Object.entries(data).every(([key, value]) => areAllFieldsChecked(value, checkedFields, parentKey ? `${parentKey}.${key}` : key));
  } else {
    return checkedFields.has(parentKey);
  }
}

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

  // Collapsible state for nested form view
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const toggleSection = useCallback((key: string) => {
    setOpenSections((prev: Record<string, boolean>) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Helper to render view-only form fields
  const renderViewOnlyForm = (row: any) => {
    if (!row) return null;
    return (
      <div className="p-1">
        <RenderNestedForm data={row} openSections={openSections} toggleSection={toggleSection} />
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
    setSelectedRowIds(new Set());
    onSelectionChange?.([]);
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

  useEffect(() => {
    if (!showRowModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showRowModal, currentIndex, filteredData, setSelectedItem]);

  // Add state for grid field selection
  const [gridSettingsOpen, setGridSettingsOpen] = useState(false);
  const [selectedGridFields, setSelectedGridFields] = useState<string[]>([]);

  // Find image column index for gridColumns or filteredColumns
  const gridCols = gridColumns || filteredColumns;
  const imageColIdx = gridCols.findIndex(col => col.header.toLowerCase().includes('image') || col.header.toLowerCase().includes('cover'));
  const imageCol = gridCols[imageColIdx];

  // Get all possible keys from the first data row (flattened)
  const allDataKeys: string[] = (data.length > 0 && typeof data[0] === 'object' && data[0] !== null)
    ? Object.keys(flattenObject(data[0]))
    : [];

  // Build available fields for table configuration
  const availableTableFields = allDataKeys
    .map((key: string) => {
      const col = columns.find((c) => String(c.accessor) === key);
      return {
        header: col?.header || key,
        accessor: key,
        render: col?.render as ((value: any, row: T, viewType?: 'table' | 'grid' | 'card' | string) => React.ReactNode) | undefined,
      };
    });

  // Build available fields for grid configuration
  const availableGridFields = allDataKeys
    .filter((key: string) => key !== (imageCol?.accessor && String(imageCol.accessor)))
    .map((key: string) => {
      const col = gridCols.find((c) => String(c.accessor) === key);
      return {
        header: col?.header || key,
        accessor: key,
        render: col?.render as ((value: any, row: T, viewType?: 'table' | 'grid' | 'card' | string) => React.ReactNode) | undefined,
      };
    });

  // Build gridCols to include all selectable fields
  const gridColsComplete = [
    ...gridCols.map(col => ({ ...col, accessor: String(col.accessor) })),
    ...allDataKeys
      .filter(key => !gridCols.some(col => String(col.accessor) === key))
      .map(key => ({
        header: key,
        accessor: key,
        render: undefined,
      })),
  ];

  // Add before the modal return:
  const [jsonCheckedFields, setJsonCheckedFields] = useState<Set<string>>(new Set());
  const [jsonExpandedFields, setJsonExpandedFields] = useState<Set<string>>(new Set());
  const handleSelectAllJson = (data: any, checked: boolean) => {
    const allKeys = new Set<string>();
    const collectKeys = (val: any, key: string) => {
      allKeys[checked ? 'add' : 'delete'](key);
      if (typeof val === 'object' && val !== null) {
        if (Array.isArray(val)) {
          val.forEach((item, idx) => collectKeys(item, `${key}[${idx}]`));
        } else {
          Object.entries(val).forEach(([childKey, childVal]) => collectKeys(childVal, `${key}.${childKey}`));
        }
      }
    };
    collectKeys(data, 'root');
    setJsonCheckedFields(allKeys);
  };

  // Card view: manage modal and selected fields state at the parent level
  const [cardModalOpenIdx, setCardModalOpenIdx] = useState<number | null>(null);
  const [cardSelectedFieldsMap, setCardSelectedFieldsMap] = useState<Record<number, string[]>>({});

  // Add state for table configuration
  const [tableSettingsOpen, setTableSettingsOpen] = useState(false);
  const [selectedTableFields, setSelectedTableFields] = useState<string[]>([]);

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
        <div className="flex space-x-1 md:space-x-2 justify-end mt-2 sm:mt-0 p-2 items-center relative">
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
          {/* Settings Icon (show based on view type) */}
          <div className="relative">
            <button
              className="ml-2 p-1 rounded-full bg-white shadow border hover:bg-gray-100"
              onClick={() => {
                if (viewType === 'grid') {
                  setGridSettingsOpen(true);
                } else if (viewType === 'table') {
                  setTableSettingsOpen(true);
                }
              }}
              title={`Configure ${viewType} fields`}
            >
              <Cog6ToothIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

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
            columns={filteredColumns.filter(col => selectedTableFields.length === 0 || selectedTableFields.includes(String(col.accessor)))} 
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
            onClearRange={clearRangeSelection}
          />
        )}
        {viewType === 'grid' && (
          <GridView
            data={filteredData}
            columns={gridColsComplete}
            viewType="grid"
            onItemClick={(item) => {
              setSelectedItem(item);
              setShowRowModal(true);
              setModalTab('json');
            }}
            selectedFields={selectedGridFields}
            getFlattenedRow={(row: any) => flattenObject(row)}
          />
        )}
        {viewType === 'card' && (
          <div className="overflow-auto flex-1 min-h-0 h-full">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-2">
              {filteredData.map((item: any, index: number) => {
                // Image extraction logic (same as GridView)
                let imageUrl: string | undefined = undefined;
                // Try to find an image field
                const imageField = filteredColumns.find(col => {
                  const header = col.header.toLowerCase();
                  const accessor = String(col.accessor).toLowerCase();
                  return ["image", "cover", "thumbnail", "photo", "img"].some(keyword => header.includes(keyword) || accessor.includes(keyword));
                });
                let imageValue = imageField ? item[imageField.accessor] : undefined;
                if (Array.isArray(imageValue) && imageValue[0]?.src) {
                  imageUrl = imageValue[0].src;
                } else if (typeof imageValue === 'object' && imageValue !== null && imageValue.src) {
                  imageUrl = imageValue.src;
                } else if (typeof imageValue === 'string') {
                  imageUrl = imageValue;
                }
                // Pinterest Pins/Boards
                if (!imageUrl && item.Item?.media?.images?.['600x']?.url) {
                  imageUrl = item.Item.media.images['600x'].url;
                } else if (!imageUrl && item.Item?.media?.image_cover_url) {
                  imageUrl = item.Item.media.image_cover_url;
                }
                // All possible keys from the item (flattened)
                const flattenObject = (obj: any, prefix = '', result: Record<string, any> = {}) => {
                  for (const key in obj) {
                    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
                    const value = obj[key];
                    const newKey = prefix ? `${prefix}.${key}` : key;
                    if (value && typeof value === 'object' && !Array.isArray(value)) {
                      flattenObject(value, newKey, result);
                    } else {
                      result[newKey] = value;
                    }
                  }
                  return result;
                };
                const flatItem = flattenObject(item);
                const allKeys = Object.keys(flatItem);
                const cardSelectedFields = cardSelectedFieldsMap[index] || [];
                return (
                  <div
                    key={index}
                    className="relative flex flex-col items-center bg-white rounded shadow-md border-2 border-blue-400 cursor-pointer"
                  >
                    {/* Settings Icon */}
                    <button
                      className="absolute top-1 right-1 z-10 bg-white rounded-full p-1 shadow border hover:bg-gray-100"
                      onClick={e => { e.stopPropagation(); setCardModalOpenIdx(index); }}
                      title="Configure card fields"
                      type="button"
                    >
                      <Cog6ToothIcon className="w-5 h-5 text-gray-500" />
                    </button>
                    {/* Only render the image */}
                    {imageUrl ? (
                      <img src={imageUrl} alt="" className="w-20 h-20 object-cover rounded" />
                    ) : (
                      <div className="w-20 h-20 flex items-center justify-center bg-gray-100 text-gray-400 rounded text-xs">No Image</div>
                    )}
                    {/* Render selected fields below the image */}
                    {cardSelectedFields.length > 0 && (
                      <div className="w-full mt-2 flex flex-col gap-1 items-center">
                        {cardSelectedFields.map(fieldKey => (
                          <div key={fieldKey} className="w-full text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 break-all text-center">
                            <span className="font-semibold text-gray-500 mr-1">{fieldKey}:</span>
                            <span>{typeof flatItem[fieldKey] === 'object' ? JSON.stringify(flatItem[fieldKey]) : String(flatItem[fieldKey] ?? '')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Card settings modal */}
                    {cardModalOpenIdx === index && (
                      <CardConfigModal
                        open={cardModalOpenIdx === index}
                        onClose={() => setCardModalOpenIdx(null)}
                        allKeys={allKeys}
                        selectedFields={cardSelectedFields}
                        onChange={fields => setCardSelectedFieldsMap(prev => ({ ...prev, [index]: fields }))}
                        title="Select fields to show"
                      />
                    )}
                  </div>
                );
              })}
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
              className="bg-white rounded-lg shadow-lg max-w-7xl w-full h-[900px] max-h-[90vh] p-6 relative flex flex-col"
              onClick={e => e.stopPropagation()}
              tabIndex={0}
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
              <div className="flex-1 min-h-0 overflow-auto">
                {modalTab === 'image' && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <img
                      src={getImageSrc(selectedItem)}
                      alt="Large"
                      className="mb-4 rounded shadow max-h-[600px] object-contain"
                      style={{ maxWidth: '100%' }}
                    />
                  </div>
                )}
                {modalTab === 'json' && selectedItem && (
                  <div className="bg-gray-50 rounded p-2 text-xs overflow-x-auto h-full">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={areAllFieldsChecked(selectedItem, jsonCheckedFields, 'root')}
                        onChange={e => handleSelectAllJson(selectedItem, e.target.checked)}
                        className="accent-blue-600"
                      />
                      <span className="font-semibold">Select All</span>
                    </div>
                    <JsonExplorer
                      data={selectedItem}
                      checkedFields={jsonCheckedFields}
                      setCheckedFields={setJsonCheckedFields}
                      expandedFields={jsonExpandedFields}
                      setExpandedFields={setJsonExpandedFields}
                      parentKey="root"
                    />
                  </div>
                )}
                {modalTab === 'form' && renderViewOnlyForm(selectedItem)}
              </div>
              {/* Move ModalNavigator outside scrollable content */}
              <ModalNavigator
                currentIndex={currentIndex}
                total={filteredData.length}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            </div>
          </div>
        )}

        {/* Grid Settings Modal */}
        {gridSettingsOpen && (
          <GridConfigModal<T>
            open={gridSettingsOpen}
            onClose={() => setGridSettingsOpen(false)}
            availableFields={availableGridFields}
            selectedFields={selectedGridFields}
            onChange={setSelectedGridFields}
            title="Select fields to show"
          />
        )}

        {/* Table Settings Modal */}
        {tableSettingsOpen && (
          <TableConfigModal<T>
            open={tableSettingsOpen}
            onClose={() => setTableSettingsOpen(false)}
            availableFields={availableTableFields}
            selectedFields={selectedTableFields}
            onChange={setSelectedTableFields}
            title="Select columns to show"
          />
        )}
      </div>
    </div>
  );
} 