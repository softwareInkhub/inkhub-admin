'use client';

import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { saveAs } from 'file-saver';

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
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

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

  // Close dropdown on outside click
  useEffect(() => {
    if (!showColumnDropdown) return;
    function handleClick(e: MouseEvent) {
      const dropdown = document.getElementById('column-dropdown');
      if (dropdown && !dropdown.contains(e.target as Node)) {
        setShowColumnDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showColumnDropdown]);

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

  console.log("SAVED FILTERS", savedFilters);

  return (
    <div
      ref={scrollRef}
      className={`w-full h-[53vh] overflow-y-auto bg-white border rounded shadow${isFullscreen ? ' fixed inset-0 z-[1000] h-screen w-screen rounded-none border-0' : ''}`}
      style={isFullscreen ? { minHeight: '100vh', minWidth: '100vw', background: 'white' } : { minHeight: 200 }}
    >
      {/* Header: View Mode Toggle Buttons & Column Toggle */}
      <div className="flex gap-2 mb-2 items-center sticky top-0 bg-white z-20 p-2 border-b justify-between">
        <div className="flex gap-2 items-center">
          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(v => !v)}
            className={`p-2 rounded border ${isFullscreen ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen'}
          >
            {/* Fullscreen SVG */}
            {isFullscreen ? (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 15v2a2 2 0 01-2 2H5m0 0a2 2 0 01-2-2v-2m2 2v-2m10-10h2a2 2 0 012 2v2m0 0V5a2 2 0 00-2-2h-2m2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M4 8V6a2 2 0 012-2h2M4 4l6 6M20 16v2a2 2 0 01-2 2h-2m6-6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </button>
          {/* View Mode Toggle Buttons */}
          <button
            onClick={() => setViewTypeState('table')}
            className={`p-2 rounded ${viewTypeState === 'table' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
            title="Table View"
          >
            {/* Table icon SVG */}
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke="currentColor" strokeWidth="2"/></svg>
          </button>
          <button
            onClick={() => setViewTypeState('grid')}
            className={`p-2 rounded ${viewTypeState === 'grid' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
            title="Grid View"
          >
            {/* Grid icon SVG */}
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg>
          </button>
          <button
            onClick={() => setViewTypeState('card')}
            className={`p-2 rounded ${viewTypeState === 'card' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
            title="Card View"
          >
            {/* Card icon SVG */}
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M4 11h16" stroke="currentColor" strokeWidth="2"/></svg>
          </button>
          {/* Download Button */}
          <div className="relative">
            <button
              onClick={() => setShowDownloadDropdown(v => !v)}
              className="px-3 py-1 border rounded ml-2 text-sm font-medium flex items-center gap-1"
              title="Download filtered JSON"
            >
              {/* Download SVG */}
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="17" width="16" height="4" rx="2" stroke="currentColor" strokeWidth="2"/></svg>
              Download
            </button>
            {showDownloadDropdown && (
              <div className="absolute left-0 mt-2 bg-white border rounded shadow p-4 z-30 min-w-[220px]">
                <div className="flex border-b mb-2">
                  <span className="font-semibold text-blue-700 border-b-2 border-blue-500 px-2 py-1">Download JSON</span>
                </div>
                <div className="mb-2 text-sm font-medium">Select fields to include:</div>
                <div className="max-h-40 overflow-y-auto mb-2">
                  {fieldTree.length === 0 ? (
                    <div className="text-gray-400 text-xs mb-2">No fields found</div>
                  ) : (
                    renderFieldTree(fieldTree)
                  )}
                </div>
                <button
                  className="w-full bg-blue-600 text-white rounded px-3 py-1 mt-1 disabled:opacity-50"
                  disabled={!selectedDownloadFields.length}
                  onClick={handleDownload}
                >Save & Download</button>
              </div>
            )}
          </div>
          {/* Column Toggle Button */}
          <div className="relative">
            <button
              onClick={() => setShowColumnDropdown(v => !v)}
              className="px-3 py-1 border rounded ml-2 text-sm font-medium"
              title="Add or remove columns"
            >
              Columns
            </button>
            {showColumnDropdown && (
              <div id="column-dropdown" className="absolute left-0 mt-2 bg-white border rounded shadow p-4 z-30 min-w-[200px]">
                <div className="flex border-b mb-2">
                  <span className="font-semibold text-blue-700 border-b-2 border-blue-500 px-2 py-1">Columns</span>
                </div>
                <div className="mb-2 text-sm font-medium">Add or remove columns</div>
                {columns.map(col => (
                  <div key={String(col.accessor)} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(String(col.accessor))}
                      onChange={e => {
                        if (e.target.checked) {
                          setVisibleColumns(prev => [...prev, String(col.accessor)]);
                        } else {
                          setVisibleColumns(prev => prev.filter(a => a !== String(col.accessor)));
                        }
                      }}
                      className="accent-pink-600 mr-2"
                      id={`col-toggle-${String(col.accessor)}`}
                    />
                    <label htmlFor={`col-toggle-${String(col.accessor)}`}>{col.header}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <button
          className="ml-auto px-4 py-2 bg-green-600 text-white rounded font-semibold shadow hover:bg-green-700 transition-colors"
          style={{ minWidth: 120 }}
          onClick={() => setShowSaveFilterModal(true)}
        >
          Save Filter
        </button>
      </div>
      {/* Table View */}
      {viewTypeState === 'table' && (
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
              <th className="px-3 py-2 font-semibold text-gray-700">S.No</th>
              {filteredColumns.map((col) => (
                <th key={String(col.accessor)} className="px-3 py-2 font-semibold text-gray-700">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, i) => (
              <tr key={i} className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(row)}>
                {/* Checkbox Cell */}
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(i)}
                    onChange={handleRowCheckbox(i)}
                    onClick={e => e.stopPropagation()}
                  />
                </td>
                {/* Serial Number Cell */}
                <td className="px-3 py-2">{(page && pageSize) ? (page - 1) * pageSize + i + 1 : i + 1}</td>
                {filteredColumns.map((col) => (
                  <td key={String(col.accessor)} className="px-3 py-2">
                    {col.render ? col.render(row[col.accessor], row) : String(row[col.accessor] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        )}
      {/* Grid View */}
      {viewTypeState === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-8 gap-2 p-2">
          {tableData.map((row, i) => {
            const imgSrc = getImageSrc(row);
            return (
              <div
                key={i}
                className="relative bg-white border border-blue-200 rounded-lg shadow-sm cursor-pointer overflow-hidden flex flex-col items-stretch justify-end"
                style={{ width: '100%', aspectRatio: '1/1', minHeight: 0, minWidth: 0 }}
                onClick={() => handleRowClick(row)}
              >
                {/* Settings Icon (top-right, opens grid field dropdown) */}
                <button
                  type="button"
                  className="absolute top-2 right-2 z-30 bg-white rounded-full p-1 shadow hover:bg-blue-100"
                  onClick={e => {
                    e.stopPropagation();
                    // Calculate dropdown position relative to viewport
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setDropdownPos({
                      top: rect.bottom + 6, // 6px below the icon
                      left: rect.right - 200 // align right edge, 200px width
                    });
                    setShowGridFieldDropdown(showGridFieldDropdown === i ? null : i);
                  }}
                  title="Grid Field Settings"
                >
                  {/* Gear SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-1.14 1.603-1.14 1.902 0a1.724 1.724 0 002.573 1.01c.943-.545 2.043.454 1.498 1.398a1.724 1.724 0 001.01 2.573c1.14.3 1.14 1.603 0 1.902a1.724 1.724 0 00-1.01 2.573c.545.943-.454 2.043-1.398 1.498a1.724 1.724 0 00-2.573 1.01c-.3 1.14-1.603 1.14-1.902 0a1.724 1.724 0 00-2.573-1.01c-.943.545-2.043-.454-1.498-1.398a1.724 1.724 0 00-1.01-2.573c-1.14-.3-1.14-1.603 0-1.902a1.724 1.724 0 001.01-2.573c-.545-.943.454-2.043 1.398-1.498.943.545 2.043-.454 1.498-1.398z" /></svg>
                </button>
                {showGridFieldDropdown === i && dropdownPos && ReactDOM.createPortal(
                  <div
                    className="fixed z-50 bg-white border rounded shadow p-4 min-w-[200px] max-w-[90vw]"
                    style={{ top: dropdownPos.top, left: dropdownPos.left }}
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex border-b mb-2">
                      <span className="font-semibold text-blue-700 border-b-2 border-blue-500 px-2 py-1">Grid Fields</span>
                    </div>
                    <div className="mb-2 text-sm font-medium">Select fields to show below image</div>
                    {allGridFields.map(col => (
                      <div key={String(col.accessor)} className="flex items-center mb-1">
                        <input
                          type="checkbox"
                          checked={gridFields.includes(String(col.accessor))}
                          onChange={e => {
                            if (e.target.checked) {
                              setGridFields(prev => [...prev, String(col.accessor)]);
                            } else {
                              setGridFields(prev => prev.filter(a => a !== String(col.accessor)));
                            }
                          }}
                          className="accent-blue-600 mr-2"
                          id={`grid-field-toggle-${String(col.accessor)}`}
                        />
                        <label htmlFor={`grid-field-toggle-${String(col.accessor)}`}>{col.header}</label>
                      </div>
                    ))}
                  </div>,
                  document.body
                )}
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
      )}
      {/* Card View */}
      {viewTypeState === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {tableData.map((row, i) => (
            <div key={i} className="bg-white border rounded p-4 shadow cursor-pointer" onClick={() => handleRowClick(row)}>
              {filteredColumns.map((col) => (
                <div key={String(col.accessor)} className="mb-2">
                  <span className="font-semibold text-gray-700 mr-1">{col.header}:</span>
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
      {/* Exit Fullscreen Button (overlay, mobile-friendly) */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="fixed top-4 right-4 z-[1100] bg-blue-600 text-white px-4 py-2 rounded shadow-lg text-sm"
        >
          Exit Fullscreen
        </button>
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