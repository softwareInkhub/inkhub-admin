'use client';

import React, { useState, useEffect, useRef } from 'react';
import { saveAs } from 'file-saver';

interface ActionButtonsBarProps {
  selectedRows: number[];
  totalRows: number;
  visibleColumns: string[];
  allColumns: any[];
  onVisibleColumnsChange: (columns: string[]) => void;
  onSaveFilter?: () => void;
  section: string;
  tabKey: string;
  selectedData?: any[];
  showSaveFilter?: boolean;
}

export default function ActionButtonsBar({
  selectedRows,
  totalRows,
  visibleColumns,
  allColumns,
  onVisibleColumnsChange,
  onSaveFilter,
  section,
  tabKey,
  selectedData = [],
  showSaveFilter = true,
}: ActionButtonsBarProps) {
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

  const barRef = useRef<HTMLDivElement>(null);

  // Ensure only one dropdown is open at a time
  const handleDownloadClick = () => {
    setShowDownloadDropdown((prev) => {
      if (!prev) setShowColumnDropdown(false);
      return !prev;
    });
  };
  const handleColumnClick = () => {
    setShowColumnDropdown((prev) => {
      if (!prev) setShowDownloadDropdown(false);
      return !prev;
    });
  };

  // Click-away listener to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setShowDownloadDropdown(false);
        setShowColumnDropdown(false);
      }
    }
    if (showDownloadDropdown || showColumnDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDownloadDropdown, showColumnDropdown]);

  // Download functionality for different formats
  const handleDownloadCSV = () => {
    if (selectedRows.length === 0) return;
    
    const dataToDownload = selectedData.length > 0 ? selectedData : [];
    const headers = allColumns.map(col => col.header).join(',');
    const csvContent = [headers, ...dataToDownload.map(row => 
      allColumns.map(col => {
        const value = row[col.accessor];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    )].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${section}_${tabKey}_selected_data.csv`);
    setShowDownloadDropdown(false);
  };

  const handleDownloadJSON = () => {
    if (selectedRows.length === 0) return;
    
    const dataToDownload = selectedData.length > 0 ? selectedData : [];
    const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { 
      type: 'application/json' 
    });
    saveAs(blob, `${section}_${tabKey}_selected_data.json`);
    setShowDownloadDropdown(false);
  };

  const handleDownloadPDF = () => {
    if (selectedRows.length === 0) return;
    
    // For PDF, we'll create a simple text-based PDF using jsPDF or similar
    // For now, we'll create a text file with PDF-like formatting
    const dataToDownload = selectedData.length > 0 ? selectedData : [];
    const pdfContent = `Selected Data Report\n\n${dataToDownload.map((row, index) => 
      `Record ${index + 1}:\n${allColumns.map(col => `${col.header}: ${row[col.accessor]}`).join('\n')}\n`
    ).join('\n')}`;
    
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    saveAs(blob, `${section}_${tabKey}_selected_data.txt`);
    setShowDownloadDropdown(false);
  };

  // Save filter functionality
  const handleSaveFilter = async () => {
    if (!filterName || !onSaveFilter) return;
    
    try {
      onSaveFilter();
      setShowSaveFilterModal(false);
      setFilterName('');
    } catch (error) {
      console.error('Failed to save filter:', error);
    }
  };

  // Copy functionality
  const handleCopy = async () => {
    if (selectedRows.length === 0) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(selectedData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      setCopied(false);
    }
  };

  return (
    <>
      {/* Action Buttons Bar - Separate Container */}
      <div ref={barRef} className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50 justify-end">
        {/* Download Button with Dropdown */}
        <div className="relative">
          <button
            onClick={handleDownloadClick}
            disabled={selectedRows.length === 0}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="Download selected data"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="4" y="17" width="16" height="4" rx="2" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Download
            <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showDownloadDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-[120px] max-h-96 overflow-y-auto">
              <button
                onClick={handleDownloadCSV}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                CSV
              </button>
              <button
                onClick={handleDownloadJSON}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 15l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                JSON
              </button>
              <button
                onClick={handleDownloadPDF}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors text-left"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                PDF
              </button>
            </div>
          )}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          disabled={selectedRows.length === 0}
          className={`px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm ${copied ? 'border-green-500 bg-green-50 text-green-700' : ''}`}
          title="Copy selected data to clipboard"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
            <rect x="3" y="3" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {copied ? 'Copied!' : 'Copy'}
        </button>

        {/* Columns Button */}
        <div className="relative">
          <button
            onClick={handleColumnClick}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 flex items-center gap-2 transition-all duration-200 shadow-sm"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M8 6h8M8 12h8M8 18h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Columns ({visibleColumns.length})
          </button>
          {showColumnDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-3 min-w-[250px] max-h-96 overflow-y-auto">
              <div className="mb-3 text-sm font-semibold text-gray-800">Select columns to display:</div>
              <div className="max-h-60 overflow-y-auto">
                {allColumns.map(col => (
                  <label key={String(col.accessor)} className="flex items-center gap-2 text-sm py-1.5 hover:bg-gray-50 rounded px-1">
                    <input
                      type="checkbox"
                      checked={visibleColumns.includes(String(col.accessor))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onVisibleColumnsChange([...visibleColumns, String(col.accessor)]);
                        } else {
                          onVisibleColumnsChange(visibleColumns.filter(c => c !== String(col.accessor)));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="flex-1 font-medium">{col.header}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-gray-200">
                <button
                  onClick={() => onVisibleColumnsChange(allColumns.map(col => String(col.accessor)))}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium mr-3"
                >
                  Select All
                </button>
                <button
                  onClick={() => onVisibleColumnsChange([])}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save Filter Button */}
        {showSaveFilter && (
          <button
            onClick={() => setShowSaveFilterModal(true)}
            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="7,3 7,8 15,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Save Filter
          </button>
        )}
      </div>

      {/* Save Filter Modal */}
      {showSaveFilterModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Save Filter</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Name
              </label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Enter a name for this filter"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveFilterModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFilter}
                disabled={!filterName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 