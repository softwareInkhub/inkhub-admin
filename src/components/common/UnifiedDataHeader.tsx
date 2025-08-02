'use client';
import React from 'react';
import { Search, Filter, Download, Copy, Columns, Save, X } from 'lucide-react';
import { ChartBarIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

interface AnalyticsCard {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'gray';
  gradient?: boolean;
}

interface FilterTab {
  id: string;
  name: string;
  type: 'filter' | 'view' | 'category';
  active?: boolean;
  count?: number;
  icon?: React.ReactNode;
}

interface UnifiedDataHeaderProps {
  // Analytics section
  analyticsCards?: AnalyticsCard[];
  
  // Filter tabs section
  filterTabs?: FilterTab[];
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  showAllButton?: boolean;
  allButtonText?: string;
  showCreateFilterButton?: boolean;
  onCreateFilter?: () => void;
  
  // Search and actions section
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (e?: React.FormEvent) => void;
  searchPlaceholder?: string;
  
  // Search filter
  showSearchFilter?: boolean;
  searchFilterOptions?: Array<{ value: string; label: string }>;
  selectedSearchFilter?: string;
  onSearchFilterChange?: (filter: string) => void;
  showSearchFilterDropdown?: boolean;
  onSearchFilterDropdownToggle?: () => void;
  
  // Action buttons
  onDownload?: () => void;
  onCopy?: () => void;
  onColumns?: () => void;
  onSaveFilter?: () => void;
  showDownload?: boolean;
  showCopy?: boolean;
  showColumns?: boolean;
  showSaveFilter?: boolean;
  downloadDisabled?: boolean;
  copyDisabled?: boolean;
  columnsDisabled?: boolean;
  saveFilterDisabled?: boolean;
  
  // Filter tags
  showFilterTags?: boolean;
  activeFilters?: Array<{ key: string; value: string; label?: string }>;
  onRemoveFilter?: (key: string) => void;
  
  // Download dropdown
  showDownloadDropdown?: boolean;
  selectedDownloadFormat?: string;
  onDownloadFormatChange?: (format: string) => void;
  
  // Additional dropdown props
  showColumnDropdown?: boolean;
  selectedDownloadFields?: string[];
  visibleColumns?: string[];
  onVisibleColumnsChange?: (columns: string[]) => void;
  columns?: any[];
  onDownloadFieldsChange?: (fields: string[]) => void;
  onDownloadExecute?: () => void;
  
  className?: string;
}

export default function UnifiedDataHeader({
  analyticsCards = [],
  filterTabs = [],
  activeTabId,
  onTabChange,
  showAllButton = true,
  allButtonText = 'ALL',
  showCreateFilterButton = false,
  onCreateFilter,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = 'Search...',
  showSearchFilter = false,
  searchFilterOptions = [],
  selectedSearchFilter = '',
  onSearchFilterChange,
  showSearchFilterDropdown = false,
  onSearchFilterDropdownToggle,
  onDownload,
  onCopy,
  onColumns,
  onSaveFilter,
  showDownload = true,
  showCopy = true,
  showColumns = true,
  showSaveFilter = true,
  downloadDisabled = false,
  copyDisabled = false,
  columnsDisabled = false,
  saveFilterDisabled = false,
  showFilterTags = false,
  activeFilters = [],
  onRemoveFilter,
  showDownloadDropdown = false,
  selectedDownloadFormat = 'JSON',
  onDownloadFormatChange,
  showColumnDropdown = false,
  selectedDownloadFields = [],
  visibleColumns = [],
  onVisibleColumnsChange,
  columns = [],
  onDownloadFieldsChange,
  onDownloadExecute,
  className = ''
}: UnifiedDataHeaderProps) {
  
  // Calculate total count for ALL button
  const totalCount = filterTabs.reduce((sum, tab) => sum + (tab.count || 0), 0);

  // Handle click outside to close dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Close search filter dropdown if clicking outside
      if (showSearchFilterDropdown && !target.closest('.search-filter-dropdown')) {
        onSearchFilterDropdownToggle?.();
      }
      
      // Close download dropdown if clicking outside
      if (showDownloadDropdown && !target.closest('.download-dropdown')) {
        onDownload?.();
      }
      
      // Close column dropdown if clicking outside
      if (showColumnDropdown && !target.closest('.column-dropdown')) {
        onColumns?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchFilterDropdown, showDownloadDropdown, showColumnDropdown, onSearchFilterDropdownToggle, onDownload, onColumns]);

  return (
    <div className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Analytics Cards Section - Original Design */}
      {analyticsCards.length > 0 && (
        <div className="flex flex-row items-center bg-white border-b border-gray-200 rounded-t-lg px-4 py-2 shadow-sm w-full">
          {/* Total Data Card */}
          <div className="flex flex-col items-center justify-center">
            <div className="border-2 border-blue-100 rounded-xl px-4 py-2 bg-gradient-to-br from-blue-50/40 to-white shadow text-center min-w-[80px] transition-transform duration-150 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-center mb-0.5">
                <ChartBarIcon className="w-5 h-5 text-blue-400 mr-1" />
                <span className="text-xs font-semibold text-blue-900">Total Data</span>
              </div>
              <div className="text-lg font-extrabold text-blue-700 tracking-wide">
                {analyticsCards[0]?.value || '--'}
              </div>
            </div>
          </div>
          
          {/* Loaded Data Card */}
          <div className="flex flex-col items-center justify-center ml-2">
            <div className="border-2 border-green-100 rounded-xl px-4 py-2 bg-gradient-to-br from-green-50/40 to-white shadow text-center min-w-[80px] transition-transform duration-150 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-center mb-0.5">
                <CheckCircleIcon className="w-5 h-5 text-green-400 mr-1" />
                <span className="text-xs font-semibold text-green-900">Loaded Data</span>
              </div>
              <div className="text-lg font-extrabold text-green-700 tracking-wide">
                {analyticsCards[1]?.value || '--'}
              </div>
            </div>
          </div>
          
          {/* Algolia Count Card */}
          <div className="flex flex-col items-center justify-center ml-2">
            <div className="border-2 border-purple-400 rounded-xl px-4 py-2 bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg text-center min-w-[120px] transition-transform duration-150 hover:-translate-y-1 hover:shadow-2xl">
              <div className="text-xs font-semibold mb-0.5 text-white drop-shadow">Algolia Count</div>
              <div className="text-lg font-extrabold text-white drop-shadow tracking-wide">
                {analyticsCards[2]?.value || '--'}
              </div>
            </div>
          </div>
          
          {/* Box 4-11 Cards */}
          {[4,5,6,7,8,9,10,11].map((num) => (
            <div key={num} className="flex flex-col items-center justify-center ml-2">
              <div className="border-2 border-gray-200 rounded-xl px-4 py-2 bg-gradient-to-br from-gray-50 to-white shadow text-center min-w-[120px] transition-transform duration-150 hover:-translate-y-1 hover:shadow-lg">
                <div className="text-xs font-semibold mb-0.5 text-gray-800">Box {num}</div>
                <div className="text-lg font-bold text-gray-700">--</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs Section */}
      {filterTabs.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* ALL Button */}
              {showAllButton && (
                <button
                  onClick={() => onTabChange?.('all')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border font-medium text-sm transition-all duration-200 ${
                    activeTabId === 'all' || !activeTabId
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{allButtonText}</span>
                  {totalCount > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                      activeTabId === 'all' || !activeTabId
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}>
                      {totalCount}
                    </span>
                  )}
                </button>
              )}

              {/* Filter Tabs */}
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border font-medium text-sm transition-all duration-200 ${
                    activeTabId === tab.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {tab.icon && <span className="text-gray-500">{tab.icon}</span>}
                  <span>{tab.name}</span>
                  {tab.count && (
                    <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                      activeTabId === tab.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Create New Filter Button */}
            {showCreateFilterButton && (
              <button
                onClick={onCreateFilter}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-green-500 bg-green-50 hover:bg-green-100 text-green-700 font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create Filter</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search and Actions Section */}
      <div className="px-6 py-4">
        <div className="flex flex-col space-y-3">
          {/* Filter Tags */}
          {showFilterTags && activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <div
                  key={filter.key}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm"
                >
                  <span>{filter.label || filter.key}: {filter.value}</span>
                  <button
                    onClick={() => onRemoveFilter?.(filter.key)}
                    className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search and Action Buttons Row */}
          <div className="flex items-center space-x-3">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSearchSubmit?.()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Search Filter Dropdown */}
            {showSearchFilter && (
              <div className="relative search-filter-dropdown">
                <button
                  onClick={onSearchFilterDropdownToggle}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Search Filter"
                >
                  <Filter size={16} />
                </button>
                {showSearchFilterDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      {searchFilterOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => onSearchFilterChange?.(option.value)}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            selectedSearchFilter === option.value
                              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Download Button */}
              {showDownload && (
                <div className="relative download-dropdown">
                  <button
                    onClick={onDownload}
                    disabled={downloadDisabled}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                  {showDownloadDropdown && (
                    <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow p-4 z-50 min-w-[250px]">
                      <div className="flex border-b mb-2">
                        <span className="font-semibold text-blue-700 border-b-2 border-blue-500 px-2 py-1">Download</span>
                      </div>
                      
                      {/* Format Selection */}
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-2">Select format:</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onDownloadFormatChange?.('JSON')}
                            className={`px-3 py-1 rounded text-sm font-medium border ${
                              selectedDownloadFormat === 'JSON' 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            JSON
                          </button>
                          <button
                            onClick={() => onDownloadFormatChange?.('CSV')}
                            className={`px-3 py-1 rounded text-sm font-medium border ${
                              selectedDownloadFormat === 'CSV' 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            CSV
                          </button>
                          <button
                            onClick={() => onDownloadFormatChange?.('PDF')}
                            className={`px-3 py-1 rounded text-sm font-medium border ${
                              selectedDownloadFormat === 'PDF' 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            PDF
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-2 text-sm font-medium">Select fields to include:</div>
                      <div className="max-h-40 overflow-y-auto mb-2">
                        {columns?.map(col => (
                          <div key={String(col.accessor)} className="flex items-center mb-1">
                            <input
                              type="checkbox"
                              checked={selectedDownloadFields?.includes(String(col.accessor))}
                              onChange={e => {
                                if (e.target.checked) {
                                  onDownloadFieldsChange?.([...(selectedDownloadFields || []), String(col.accessor)]);
                                } else {
                                  onDownloadFieldsChange?.(selectedDownloadFields?.filter(a => a !== String(col.accessor)) || []);
                                }
                              }}
                              className="accent-blue-600 mr-2"
                              id={`download-field-toggle-${String(col.accessor)}`}
                            />
                            <label htmlFor={`download-field-toggle-${String(col.accessor)}`}>{col.header}</label>
                          </div>
                        ))}
                      </div>
                      <button
                        className="w-full bg-blue-600 text-white rounded px-3 py-1 mt-1 disabled:opacity-50"
                        disabled={!selectedDownloadFields?.length || !selectedDownloadFormat}
                        onClick={onDownloadExecute}
                      >
                        Download {selectedDownloadFormat || 'Data'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Copy Button */}
              {showCopy && (
                <button
                  onClick={onCopy}
                  disabled={copyDisabled}
                  className="flex items-center space-x-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Copy size={16} />
                  <span>Copy</span>
                </button>
              )}

              {/* Columns Button */}
              {showColumns && (
                <div className="relative column-dropdown">
                  <button
                    onClick={onColumns}
                    disabled={columnsDisabled}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Columns size={16} />
                    <span>Columns</span>
                  </button>
                  {showColumnDropdown && (
                    <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow p-4 z-50 min-w-[200px]">
                      <div className="flex border-b mb-2">
                        <span className="font-semibold text-blue-700 border-b-2 border-blue-500 px-2 py-1">Columns</span>
                      </div>
                      <div className="mb-2 text-sm font-medium">Add or remove columns</div>
                      {columns?.map(col => (
                        <div key={String(col.accessor)} className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            checked={visibleColumns?.includes(String(col.accessor))}
                            onChange={e => {
                              if (e.target.checked) {
                                onVisibleColumnsChange?.([...(visibleColumns || []), String(col.accessor)]);
                              } else {
                                onVisibleColumnsChange?.(visibleColumns?.filter(a => a !== String(col.accessor)) || []);
                              }
                            }}
                            className="accent-pink-600 mr-2"
                            id={`col-toggle-${String(col.accessor)}`}
                          />
                          <label 
                            htmlFor={`col-toggle-${String(col.accessor)}`}
                            className={`${visibleColumns?.includes(String(col.accessor)) ? 'text-gray-900' : 'text-gray-500'}`}
                          >
                            {col.header}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Save Filter Button */}
              {showSaveFilter && (
                <button
                  onClick={onSaveFilter}
                  disabled={saveFilterDisabled}
                  className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded font-semibold shadow hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ minWidth: 120 }}
                >
                  <Save size={16} />
                  <span>Save Filter</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 