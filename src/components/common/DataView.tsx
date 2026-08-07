'use client';

import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { saveAs } from 'file-saver';
import ActionButtonsBar from './ActionButtonsBar';
import FilterDrawer from './FilterDrawer';
import ViewModeDropdown from './ViewModeDropdown';

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
  viewType?: 'table' | 'grid' | 'card';
  scrollBuffer?: number; // px from bottom to trigger load more
  page?: number;
  pageSize?: number;
  section: string;
  tabKey: string;
};

function DataView<T>({
  data,
  columns,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  viewType = 'table',
  scrollBuffer = 100,
  page,
  pageSize,
  section,
  tabKey,
}: DataViewProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Checkbox selection state
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const allChecked = data.length > 0 && selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  // Modal state for row details
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [showRowModal, setShowRowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'image' | 'json' | 'form'>('image');

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map(col => String(col.accessor)));

  // Grid field selector state (for grid view only)
  const allGridFields = columns.filter(col => !/image/i.test(col.header) && !/name|title/i.test(col.header));
  const nameCol = columns.find(col => /name|title/i.test(col.header));
  const [gridFields, setGridFields] = useState<string[]>([]); // stores accessors of visible fields below image
  const [showGridFieldDropdown, setShowGridFieldDropdown] = useState<number | null>(null); // index of open dropdown

  // For dropdown positioning
  const [dropdownPos, setDropdownPos] = useState<{top: number, left: number} | null>(null);

  // Download dropdown state
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [selectedDownloadFields, setSelectedDownloadFields] = useState<string[]>([]);

  // Date sorting state
  const [dateSortOrder, setDateSortOrder] = useState<'latest' | 'oldest' | null>(null);
  const [showDateSortDropdown, setShowDateSortDropdown] = useState(false);

  // Add state for total sort order and dropdown
  const [totalSortOrder, setTotalSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [showTotalSortDropdown, setShowTotalSortDropdown] = useState(false);

  // Add state for name sort order and dropdown
  const [nameSortOrder, setNameSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [showNameSortDropdown, setShowNameSortDropdown] = useState(false);

  // Add state for title and customer sort order and dropdown
  const [titleSortOrder, setTitleSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [showTitleSortDropdown, setShowTitleSortDropdown] = useState(false);
  const [customerSortOrder, setCustomerSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [showCustomerSortDropdown, setShowCustomerSortDropdown] = useState(false);

  // Tree node type for field selection
  type FieldTreeNode = {
    key: string;
    path: string;
    children?: FieldTreeNode[];
  };

  // Recursively build a tree from the first data row
  function buildFieldTree(obj: any, prefix = ""): FieldTreeNode[] {
    if (typeof obj !== "object" || obj === null) return [];
    return Object.keys(obj).map(key => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        return {
          key,
          path,
          children: buildFieldTree(obj[key], path),
        };
      } else {
        return { key, path };
      }
    });
  }

  // Tree for download fields
  const fieldTree = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return buildFieldTree(data[0]);
  }, [data]);

  // Expanded state for tree nodes
  const [expandedNodes, setExpandedNodes] = useState<{ [path: string]: boolean }>({});
  const toggleNode = (path: string) => {
    setExpandedNodes(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Helper: get all leaf paths under a node
  function getAllLeafPaths(node: FieldTreeNode): string[] {
    if (!node.children) return [node.path];
    return node.children.flatMap(getAllLeafPaths);
  }

  // Selection logic for tree
  function isNodeChecked(node: FieldTreeNode): boolean {
    if (!node.children) return selectedDownloadFields.includes(node.path);
    return node.children.every(isNodeChecked);
  }
  function isNodeIndeterminate(node: FieldTreeNode): boolean {
    if (!node.children) return false;
    const checked = node.children.map(isNodeChecked);
    return checked.some(Boolean) && !checked.every(Boolean);
  }
  function handleNodeCheck(node: FieldTreeNode, checked: boolean) {
    const leafPaths = getAllLeafPaths(node);
    if (checked) {
      setSelectedDownloadFields(prev => Array.from(new Set([...prev, ...leafPaths])));
    } else {
      setSelectedDownloadFields(prev => prev.filter(p => !leafPaths.includes(p)));
    }
  }

  // Recursive tree rendering with improved UI
  function renderFieldTree(nodes: FieldTreeNode[], level = 0, parentLast: boolean[] = []) {
    return nodes.map((node, idx) => {
      const isLast = idx === nodes.length - 1;
      const hasChildren = !!node.children;
      return (
        <div key={node.path} style={{ position: 'relative', marginLeft: level ? 24 : 0 }} className="flex items-start mb-1 group">
          {/* Connector lines */}
          {level > 0 && (
            <span
              style={{
                position: 'absolute',
                left: -16,
                top: 0,
                bottom: 0,
                width: 16,
                borderLeft: parentLast.slice(0, -1).some(v => !v) ? '1px solid #d1d5db' : 'none',
                borderBottom: isLast ? 'none' : '1px solid #d1d5db',
                height: hasChildren && expandedNodes[node.path] ? '100%' : 24,
                zIndex: 0,
              }}
            />
          )}
          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleNode(node.path)}
              className="mr-1 text-xs text-gray-500 focus:outline-none flex-shrink-0"
              style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              tabIndex={-1}
              aria-label={expandedNodes[node.path] ? 'Collapse' : 'Expand'}
            >
              {expandedNodes[node.path] ? (
                <svg width="12" height="12" viewBox="0 0 24 24"><path d="M8 10l4 4 4-4" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24"><path d="M10 8l4 4-4 4" stroke="#555" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
              )}
            </button>
          )}
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isNodeChecked(node)}
            ref={el => { if (el) el.indeterminate = isNodeIndeterminate(node); }}
            onChange={e => handleNodeCheck(node, e.target.checked)}
            className="accent-blue-600 mr-2 mt-0.5 focus:ring-2 focus:ring-blue-400"
            id={`download-field-toggle-${node.path}`}
            style={{ zIndex: 1 }}
          />
          {/* Label */}
          <label
            htmlFor={`download-field-toggle-${node.path}`}
            className={`select-none cursor-pointer ${hasChildren ? 'font-semibold text-gray-800' : 'text-gray-700'} group-hover:text-blue-700`}
            style={{ zIndex: 1 }}
          >
            {node.key}
          </label>
          {/* Children */}
          {hasChildren && expandedNodes[node.path] && (
            <div className="w-full" style={{ marginLeft: 0 }}>
              {renderFieldTree(node.children ?? [], level + 1, [...parentLast, isLast])}
            </div>
          )}
        </div>
      );
    });
  }

  // Helper: get value by dot path (move above handleDownload to fix linter error)
  function getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  // Download handler (nested support)
  const handleDownload = () => {
    if (!selectedDownloadFields.length) return;
    const filtered = data.map(row => {
      const obj: any = {};
      selectedDownloadFields.forEach(path => {
        obj[path] = getValueByPath(row, path);
      });
      return obj;
    });
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    saveAs(blob, `selected_fields_data.json`);
    setShowDownloadDropdown(false);
  };

  // Close dropdown on outside click - removed since column dropdown is now in ActionButtonsBar

  // Close date sort dropdown on outside click
  useEffect(() => {
    if (!showDateSortDropdown) return;
    function handleClick(e: MouseEvent) {
      const dropdown = document.querySelector('[data-date-sort-dropdown]');
      if (dropdown && !dropdown.contains(e.target as Node)) {
        setShowDateSortDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDateSortDropdown]);

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

  const handleRowClick = (item: T) => {
    setSelectedItem(item);
    setShowRowModal(true);
    setModalTab('image');
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

  const [viewTypeState, setViewTypeState] = useState<'table' | 'grid' | 'card'>(viewType);

  // On mount, default gridFields to [] (only name/title shown)
  useEffect(() => {
    setGridFields([]);
  }, [columns]);

  // Helper to find image URL in an object
  function getImageSrc(obj: any): string | null {
    if (!obj || typeof obj !== 'object') return null;
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string' && v.match(/https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg)/i)) {
        return v;
      }
      if (typeof v === 'object' && v !== null) {
        const nested = getImageSrc(v);
        if (nested) return nested;
      }
    }
    return null;
  }

  // Filter columns based on visibleColumns
  const filteredColumns = columns.filter(col => visibleColumns.includes(String(col.accessor)));

  // Close dropdown on scroll or grid view change
  useEffect(() => {
    if (!showGridFieldDropdown) return;
    const close = () => setShowGridFieldDropdown(null);
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [showGridFieldDropdown]);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ESC key to exit fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  // Add at the top, after other useState hooks
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Add this function inside DataView
  const handleSaveFilter = async () => {
    if (!filterName) return;
    const filterConfig = {
      visibleColumns,
      // Add other filter/sort state here as needed
    };
    const filteredData = data;
    const userId = (window as any).currentUserId || 'demo-user';
    const sectionTabKey = `${section}#${tabKey}`;
    const payload = {
      userId,
      section,
      tabKey,
      'section#tabkey': sectionTabKey,
      filterName,
      filterConfig,
      filteredData,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString()
    };
    await fetch('/api/saved-filters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setShowSaveFilterModal(false);
    setFilterName('');
  };

  // Add state for saved filters and filtered data override
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [activeSavedFilter, setActiveSavedFilter] = useState<any | null>(null);
  const [dataOverride, setDataOverride] = useState<T[] | null>(null);

  // Fetch saved filters for this user and page
  useEffect(() => {
    const userId = (window as any).currentUserId || 'demo-user';
    const sectionTabKey = `${section}#${tabKey}`;
    fetch(`/api/saved-filters?userId=${encodeURIComponent(userId)}&sectionTabKey=${encodeURIComponent(sectionTabKey)}`)
      .then(res => res.json())
      .then(data => setSavedFilters(data.filters || []));
  }, [section, tabKey]);

  // Handler to apply a saved filter
  const handleApplySavedFilter = (filter: any) => {
    setActiveSavedFilter(filter);
    if (filter.filterConfig?.visibleColumns) {
      setVisibleColumns(filter.filterConfig.visibleColumns);
    }
    if (filter.filteredData) {
      setDataOverride(filter.filteredData);
    }
  };

  // When rendering the table/grid/card, use dataOverride if set
  const tableData = dataOverride || data;

  // Helper function to safely get date value from any object
  const getDateValue = (obj: any): number => {
    // Try common date field patterns
    const dateValue = obj?.created_at || 
                     obj?.createdAt || 
                     obj?.date ||
                     obj?.designCreatedAt ||
                     obj?.designUpdateAt ||
                     obj?.Item?.created_at ||
                     obj?.Item?.createdAt ||
                     obj?.Item?.date;
    
    return dateValue ? new Date(dateValue).getTime() : 0;
  };

  // Filter drawer state
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  // Example filter state
  const [filterStatus, setFilterStatus] = useState('All');

  // Use a single filteredTableData declaration and apply all filters here
  let filteredTableData = tableData;
  // Apply status filter from filter drawer
  if (filterStatus !== 'All') {
    filteredTableData = filteredTableData.filter((row: any) => {
      const status = (
        row.status ||
        row.Status ||
        row.orderStatus ||
        row.paymentStatus ||
        row.financial_status ||
        row.fulfillment_status ||
        ''
      ).toLowerCase().trim();
      return status === filterStatus.toLowerCase();
    });
  }
  if (dateSortOrder && filteredTableData.length) {
    filteredTableData = [...filteredTableData].sort((a: any, b: any) => {
      const aDate = getDateValue(a);
      const bDate = getDateValue(b);
      if (dateSortOrder === 'latest') {
        return bDate - aDate; // Latest first
      } else {
        return aDate - bDate; // Oldest first
      }
    });
  }
  // Add total sort logic
  if (totalSortOrder && filteredTableData.length) {
    filteredTableData = [...filteredTableData].sort((a: any, b: any) => {
      const aTotal = parseFloat(a.total ?? a.Total ?? a.total_price ?? 0);
      const bTotal = parseFloat(b.total ?? b.Total ?? b.total_price ?? 0);
      if (totalSortOrder === 'asc') return aTotal - bTotal;
      return bTotal - aTotal;
    });
  }
  // Add name sort logic
  if (nameSortOrder && filteredTableData.length) {
    filteredTableData = [...filteredTableData].sort((a: any, b: any) => {
      const aName = (a.name ?? a.Name ?? a.designName ?? '').toLowerCase();
      const bName = (b.name ?? b.Name ?? b.designName ?? '').toLowerCase();
      if (nameSortOrder === 'asc') return aName.localeCompare(bName);
      return bName.localeCompare(aName);
    });
  }
  // Add customer, title, and name sort logic (priority: Customer > Title > Name)
  if (customerSortOrder && filteredTableData.length) {
    filteredTableData = [...filteredTableData].sort((a: any, b: any) => {
      // Handle Shopify Orders: customer can be object or string
      function getCustomerName(row: any) {
        const val = row.customer ?? row.Customer ?? '';
        if (typeof val === 'object' && val !== null) {
          // Try first_name + last_name
          const first = val.first_name ?? '';
          const last = val.last_name ?? '';
          return `${first} ${last}`.trim();
        }
        return String(val);
      }
      const aCustomer = getCustomerName(a).toLowerCase();
      const bCustomer = getCustomerName(b).toLowerCase();
      if (customerSortOrder === 'asc') return aCustomer.localeCompare(bCustomer);
      return bCustomer.localeCompare(aCustomer);
    });
  } else if (titleSortOrder && filteredTableData.length) {
    filteredTableData = [...filteredTableData].sort((a: any, b: any) => {
      const aTitle = String(a.title ?? a.Title ?? '');
      const bTitle = String(b.title ?? b.Title ?? '');
      const aTitleLower = aTitle.toLowerCase();
      const bTitleLower = bTitle.toLowerCase();
      if (titleSortOrder === 'asc') return aTitleLower.localeCompare(bTitleLower);
      return bTitleLower.localeCompare(aTitleLower);
    });
  } else if (nameSortOrder && filteredTableData.length) {
    filteredTableData = [...filteredTableData].sort((a: any, b: any) => {
      const aName = String(a.name ?? a.Name ?? a.designName ?? '');
      const bName = String(b.name ?? b.Name ?? b.designName ?? '');
      const aNameLower = aName.toLowerCase();
      const bNameLower = bName.toLowerCase();
      if (nameSortOrder === 'asc') return aNameLower.localeCompare(bNameLower);
      return bNameLower.localeCompare(aNameLower);
    });
  }

  console.log("SAVED FILTERS", savedFilters);

  // Get selected data for download
  const selectedData = selectedRows.map(index => filteredTableData[index]).filter(Boolean);

  return (
    <div
      ref={scrollRef}
      className={`w-full h-[calc(100vh-200px)] overflow-y-auto bg-white border rounded shadow${isFullscreen ? ' fixed inset-0 z-[1000] h-screen w-screen rounded-none border-0' : ''}`}
      style={isFullscreen ? { minHeight: '100vh', minWidth: '100vw', background: 'white' } : { minHeight: 400 }}
    >
      {/* Action Buttons Bar - Separate Container Above */}
      <ActionButtonsBar
        selectedRows={selectedRows}
        totalRows={filteredTableData.length}
        visibleColumns={visibleColumns}
        allColumns={columns}
        onVisibleColumnsChange={setVisibleColumns}
        onSaveFilter={handleSaveFilter}
        section={section}
        tabKey={tabKey}
        selectedData={selectedData}
        showSaveFilter={true}
      />

      {/* Search and Filter Section - moved above the table */}
      <div className="w-full px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 flex-1"
            // Add your search logic here
          />
          <button className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-sm">
            {/* Search icon SVG */}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          {/* Filter Button */}
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all duration-200 shadow-sm text-sm font-medium"
            onClick={() => setFilterDrawerOpen(true)}
            title="Filter"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 017 17v-3.586a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Filter
          </button>
        </div>
      </div>

      {/* Filter Drawer */}
      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onApply={() => setFilterDrawerOpen(false)}
        onReset={() => setFilterStatus('All')}
        title="Filters"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="All">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="restocked">Restocked</option>
            <option value="other">Other</option>
          </select>
        </div>
      </FilterDrawer>

      {/* Header: Unified Toolbar with Controls */}
      <div className="flex flex-wrap gap-3 items-center sticky top-0 bg-white z-30 p-3 border-b justify-between">
        {/* Left side: Fullscreen button and selection info */}
        <div className="flex items-center gap-3 min-h-[24px]">
          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(v => !v)}
            className={`p-2 rounded-lg border transition-all duration-200 shadow-sm ${
              isFullscreen 
                ? 'bg-blue-100 text-blue-700 border-blue-300' 
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen'}
          >
            {/* Fullscreen SVG */}
            {isFullscreen ? (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 15v2a2 2 0 01-2 2H5m0 0a2 2 0 01-2-2v-2m2 2v-2m10-10h2a2 2 0 012 2v2m0 0V5a2 2 0 00-2-2h-2m2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M4 8V6a2 2 0 012-2h2M4 4l6 6M20 16v2a2 2 0 01-2 2h-2m6-6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </button>
          {/* Selection Info - only show if at least one selected */}
          <div className="text-sm text-gray-700 font-medium min-h-[24px] flex items-center">
            {selectedRows.length > 0 && (
              <span>{selectedRows.length} of {filteredTableData.length} selected</span>
                  )}
                </div>
              </div>
        {/* Right side: View mode dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          <ViewModeDropdown value={viewTypeState} onChange={setViewTypeState} />
          </div>
                </div>
      
      {/* Table Container with Scroll */}
      <div className="overflow-auto w-full" style={{ maxHeight: 'calc(100vh - 350px)' }}>
        {/* Table View */}
        {viewTypeState === 'table' && (
          <table className="w-full text-sm text-left table-fixed">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-20 shadow-sm">
              <tr className="border-b-2 border-gray-200">
                {/* Checkbox Column */}
                <th className="w-12 px-3 py-4 font-bold text-gray-900 border-r border-gray-200 bg-white/50 backdrop-blur-sm">
                  <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={el => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleMasterCheckbox}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                  />
                  </div>
                </th>
                {/* Serial Number Column */}
                <th className="w-16 px-3 py-4 font-bold text-gray-900 border-r border-gray-200 bg-white/50 backdrop-blur-sm">
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900 tracking-wide">S.No</span>
                  </div>
                </th>
                {filteredColumns.map((col) => {
                  // Determine column width based on content type
                  let colWidth = 'w-auto';
                  if (col.header.toLowerCase().includes('image')) {
                    colWidth = 'w-20';
                  } else if (col.header.toLowerCase().includes('id')) {
                    colWidth = 'w-32';
                  } else if (col.header.toLowerCase().includes('title')) {
                    colWidth = 'w-48';
                  } else if (col.header.toLowerCase().includes('vendor')) {
                    colWidth = 'w-24';
                  } else if (col.header.toLowerCase().includes('type')) {
                    colWidth = 'w-28';
                  } else if (col.header.toLowerCase().includes('status')) {
                    colWidth = 'w-20';
                  } else if (col.header.toLowerCase().includes('tags')) {
                    colWidth = 'w-64';
                  } else if (col.header.toLowerCase().includes('created') || col.header.toLowerCase().includes('updated')) {
                    colWidth = 'w-40';
                  }
                  
                  return (
                    <th key={String(col.accessor)} className={`${colWidth} px-3 py-4 font-semibold text-gray-800 border-r border-gray-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-200`}>
                    <div className="flex items-center justify-center group relative">
                      <div className="flex flex-col items-center min-h-[40px] justify-center">
                        <span className="text-sm font-bold text-gray-900 tracking-wide group-hover:text-gray-800 transition-colors duration-200 text-center leading-tight">
                          {col.header}
                        </span>
                        {/* Subtle indicator for sortable columns - only show on hover and with better spacing */}
                        {(col.header.toLowerCase().includes('created') || 
                          col.header.toLowerCase().includes('date') ||
                          col.header.toLowerCase().includes('updated') ||
                          col.header.toLowerCase().includes('title') ||
                          col.header.toLowerCase().includes('name')) && (
                          <div className="text-xs text-blue-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-medium leading-none">
                            Sortable
                          </div>
                        )}
                      </div>
                      
                      {/* Interactive Controls - Positioned absolutely to not affect centering */}
                      <div className="absolute right-1 flex items-center gap-1">
                      {/* Date sorting dropdown for created_at column */}
                      {(col.header.toLowerCase().includes('created') || 
                        col.header.toLowerCase().includes('date') ||
                        col.header.toLowerCase().includes('updated')) && (
                          <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDateSortDropdown(!showDateSortDropdown);
                            }}
                              className="p-1 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
                            title="Sort by date"
                          >
                              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform duration-200 hover:scale-110">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          </button>
                          {showDateSortDropdown && (
                            <div 
                                className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[140px] py-1"
                              data-date-sort-dropdown
                            >
                                <div className="px-2 py-1 text-xs font-bold text-gray-700 border-b border-gray-100">Sort Options</div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDateSortOrder('latest');
                                    setShowDateSortDropdown(false);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                                    dateSortOrder === 'latest' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 font-medium'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4" />
                                    </svg>
                                  Latest First
                                  </div>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDateSortOrder('oldest');
                                    setShowDateSortDropdown(false);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                                    dateSortOrder === 'oldest' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 font-medium'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                  Oldest First
                                  </div>
                                </button>
                                <div className="border-t border-gray-100 mt-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDateSortOrder(null);
                                    setShowDateSortDropdown(false);
                                  }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 text-gray-600 font-medium"
                                >
                                  Clear Sort
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                        
                        {/* Title/Name sorting */}
                        {(col.header.toLowerCase().includes('title') || col.header.toLowerCase().includes('name')) && (
                          <div className="relative">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setShowTitleSortDropdown(v => !v);
                            }}
                              className="p-1 rounded-md text-gray-500 hover:text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 transition-all duration-200"
                              title="Sort alphabetically"
                          >
                              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="transition-transform duration-200 hover:scale-110">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          </button>
                          {showTitleSortDropdown && (
                              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[140px] py-1">
                                <div className="px-2 py-1 text-xs font-bold text-gray-700 border-b border-gray-100">Sort Options</div>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setTitleSortOrder('asc');
                                    setShowTitleSortDropdown(false);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                                    titleSortOrder === 'asc' ? 'bg-purple-50 text-purple-600 font-semibold' : 'text-gray-700 font-medium'
                                  }`}
                                >
                                  A → Z
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setTitleSortOrder('desc');
                                    setShowTitleSortDropdown(false);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                                    titleSortOrder === 'desc' ? 'bg-purple-50 text-purple-600 font-semibold' : 'text-gray-700 font-medium'
                                  }`}
                                >
                                  Z → A
                                </button>
                                <div className="border-t border-gray-100 mt-1">
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setTitleSortOrder(null);
                                    setShowTitleSortDropdown(false);
                                  }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-150 text-gray-600 font-medium"
                                >
                                  Clear Sort
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                              </div>
                    </div>
                  </th>
                );
                })}
              </tr>
            </thead>
            <tbody>
              {filteredTableData.map((row: T, i: number) => (
                <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors duration-150" onClick={() => handleRowClick(row)}>
                  {/* Checkbox Cell */}
                  <td className="w-12 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(i)}
                      onChange={handleRowCheckbox(i)}
                      onClick={e => e.stopPropagation()}
                      className="rounded border-gray-300"
                    />
                  </td>
                  {/* Serial Number Cell */}
                  <td className="w-16 px-3 py-3 text-sm font-medium text-gray-700">{(page && pageSize) ? (page - 1) * pageSize + i + 1 : i + 1}</td>
                  {filteredColumns.map((col) => {
                    // Determine column width based on content type (same as header)
                    let colWidth = 'w-auto';
                    if (col.header.toLowerCase().includes('image')) {
                      colWidth = 'w-20';
                    } else if (col.header.toLowerCase().includes('id')) {
                      colWidth = 'w-32';
                    } else if (col.header.toLowerCase().includes('title')) {
                      colWidth = 'w-48';
                    } else if (col.header.toLowerCase().includes('vendor')) {
                      colWidth = 'w-24';
                    } else if (col.header.toLowerCase().includes('type')) {
                      colWidth = 'w-28';
                    } else if (col.header.toLowerCase().includes('status')) {
                      colWidth = 'w-20';
                    } else if (col.header.toLowerCase().includes('tags')) {
                      colWidth = 'w-64';
                    } else if (col.header.toLowerCase().includes('created') || col.header.toLowerCase().includes('updated')) {
                      colWidth = 'w-40';
                    }
                    
                    return (
                      <td key={String(col.accessor)} className={`${colWidth} px-3 py-3 text-sm text-gray-700 truncate`}>
                        {col.render ? col.render(row[col.accessor], row) : String(row[col.accessor] ?? '')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Grid View */}
      {viewTypeState === 'grid' && (
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        <div className="grid grid-cols-2 md:grid-cols-8 gap-2 p-2">
          {filteredTableData.map((row: T, i: number) => {
            const imgSrc = getImageSrc(row);
            return (
              <div
                key={i}
                className="relative bg-white border border-blue-200 rounded-lg shadow-sm cursor-pointer overflow-hidden flex flex-col items-stretch justify-end"
                style={{ width: '100%', aspectRatio: '1/1', minHeight: 0, minWidth: 0 }}
                onClick={() => handleRowClick(row)}
              >
                {/* Image, slightly reduced height */}
                <div className="w-full" style={{ height: '75%' }}>
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ display: 'block' }}
                    />
                  ) : null}
                </div>
                {/* Name/Title (always shown) */}
                {nameCol && (
                  <div className="w-full text-center text-xs font-semibold text-gray-800 truncate py-1 bg-white">
                    {nameCol.render ? nameCol.render(row[nameCol.accessor], row) : String(row[nameCol.accessor] ?? '')}
                  </div>
                )}
                {/* Additional grid fields (selected by user) */}
                {gridFields.map(accessor => {
                  const col = columns.find(c => String(c.accessor) === accessor);
                  if (!col) return null;
                  return (
                    <div key={accessor} className="w-full text-center text-xs text-gray-600 truncate pb-1 bg-white">
                      {col.render ? col.render(row[col.accessor], row) : String(row[col.accessor] ?? '')}
                    </div>
                  );
                })}
              </div>
            );
          })}
          </div>
        </div>
      )}
      {/* Card View */}
      {viewTypeState === 'card' && (
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
          {filteredTableData.map((row: T, i: number) => {
            const rowAny = row as any;
            // Extract fields for card
            const imgSrc = getImageSrc(rowAny);
            const name = rowAny['name'] ?? rowAny['designName'] ?? rowAny['title'] ?? rowAny['Title'] ?? '';
            const oldPrice = rowAny['oldPrice'] ?? rowAny['originalPrice'] ?? rowAny['price_before'] ?? rowAny['priceBefore'] ?? rowAny['strikePrice'] ?? rowAny['strikethroughPrice'] ?? rowAny['mrp'] ?? rowAny['MRP'] ?? rowAny['listPrice'] ?? rowAny['ListPrice'] ?? rowAny['old_price'] ?? rowAny['old'] ?? rowAny['price_old'] ?? rowAny['priceOld'] ?? '';
            const newPrice = rowAny['price'] ?? rowAny['Price'] ?? rowAny['newPrice'] ?? rowAny['currentPrice'] ?? rowAny['salePrice'] ?? rowAny['sale_price'] ?? rowAny['price_new'] ?? rowAny['priceNew'] ?? rowAny['priceAfter'] ?? rowAny['price_after'] ?? rowAny['priceAfterDiscount'] ?? rowAny['discountedPrice'] ?? rowAny['discount_price'] ?? rowAny['discountPrice'] ?? '';
            // Optional: badge/icon
            const badge = rowAny['badge'] ?? rowAny['icon'] ?? null;
            // Show up to 3 extra details (excluding main fields)
            const mainFields = ['name','designName','title','Title','oldPrice','originalPrice','price_before','priceBefore','strikePrice','strikethroughPrice','mrp','MRP','listPrice','ListPrice','old_price','old','price_old','priceOld','price','Price','newPrice','currentPrice','salePrice','sale_price','price_new','priceNew','priceAfter','price_after','priceAfterDiscount','discountedPrice','discount_price','discountPrice','badge','icon','designImageUrl','image','img','imgUrl','imageUrl','description','desc','DesignDescription'];
            const extraDetails = filteredColumns.filter(col => !mainFields.includes(String(col.accessor))).slice(0, 3);
            return (
                <div 
                  key={i} 
                  className="flex flex-row items-center bg-white border rounded-xl shadow p-2 gap-2 min-h-[80px] relative cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300"
                  onClick={() => handleRowClick(row)}
                >
                {/* Badge/Icon */}
                {badge && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-block w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">{badge}</span>
                  </div>
                )}
                {/* Image */}
                {imgSrc && (
                  <img src={imgSrc} alt={name} className="w-12 h-12 object-contain rounded border bg-gray-50 mr-2" />
                )}
                {/* Card Content */}
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  {/* Name/Title */}
                  <div className="flex items-center gap-1">
                    <span className="text-base font-bold text-gray-900 truncate">{name}</span>
                  </div>
                  {/* Price Row */}
                  <div className="flex items-center gap-2 mt-0.5 mb-0.5">
                    {oldPrice && (
                      <span className="text-gray-400 line-through text-xs">{typeof oldPrice === 'number' ? `$${oldPrice.toFixed(2)}` : oldPrice}</span>
                    )}
                    {newPrice && (
                      <span className="text-red-500 font-bold text-sm">{typeof newPrice === 'number' ? `$${newPrice.toFixed(2)}` : newPrice}</span>
                    )}
                  </div>
                  {/* Up to 3 extra details */}
                  {extraDetails.length > 0 && (
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {extraDetails.map((col, idx) => (
                        <div key={idx} className="flex text-xs text-gray-700">
                          <span className="font-semibold mr-1">{col.header}:</span>
                          {col.render ? col.render(rowAny[col.accessor], rowAny) : String(rowAny[col.accessor] ?? '')}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
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
      {/* Row Details Modal */}
      {showRowModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 relative w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-2xl"
              onClick={() => setShowRowModal(false)}
            >×</button>
            {/* Tabs */}
            <div className="flex border-b mb-4">
              <button
                className={`px-4 py-2 font-medium ${modalTab === 'image' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setModalTab('image')}
              >Image & Details</button>
              <button
                className={`px-4 py-2 font-medium ${modalTab === 'json' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setModalTab('json')}
              >JSON</button>
              <button
                className={`px-4 py-2 font-medium ${modalTab === 'form' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setModalTab('form')}
              >Form</button>
            </div>
            {/* Tab Content */}
            {modalTab === 'image' && (
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                {/* Try to find an image field */}
                {(() => {
                  const imgSrc = getImageSrc(selectedItem);
                  return imgSrc ? (
                    <img src={imgSrc} alt="" className="max-h-80 max-w-full mb-4 rounded shadow" />
                  ) : (
                    <div className="text-gray-400 mb-4">No image found</div>
                  );
                })()}
                {/* Show some details */}
                <div className="w-full flex flex-col items-center">
                  {Object.entries(selectedItem).map(([key, value]) => (
                    typeof value !== 'object' && (
                      <div key={key} className="mb-1">
                        <span className="font-semibold">{key}:</span> <span>{String(value)}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
            {modalTab === 'json' && (
              <div className="bg-gray-50 rounded p-2 text-xs overflow-x-auto h-80">
                <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
              </div>
            )}
            {modalTab === 'form' && (
              <form className="space-y-2">
                {Object.entries(selectedItem).map(([key, value]) => (
                  <div key={key}>
                    <label className="block font-semibold">{key}</label>
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      readOnly
                    />
                  </div>
                ))}
              </form>
            )}
          </div>
        </div>
      )}
      {showSaveFilterModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-2">Save Filter</h2>
            <input
              className="border p-2 rounded w-full mb-4"
              placeholder="Enter filter name"
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={handleSaveFilter}
              >
                Save
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowSaveFilterModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
          </div>
        )}
    </div>
  );
} 

export default DataView; 