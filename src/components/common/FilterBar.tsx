import React from 'react';

type FilterBarProps = {
  searchValue: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: () => void;
  children?: React.ReactNode;
  // Search filter props
  searchFilterOptions?: Array<{ value: string; label: string }>;
  selectedSearchFilter?: string;
  onSearchFilterChange?: (filter: string) => void;
  showSearchFilter?: boolean;
  showSearchFilterDropdown?: boolean;
  onSearchFilterDropdownToggle?: () => void;
  // New props for the buttons
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
  // Filter tags props
  activeFilters?: Array<{ key: string; value: string; label?: string }>;
  onRemoveFilter?: (key: string) => void;
  showFilterTags?: boolean;
  // Dropdown props
  showDownloadDropdown?: boolean;
  showColumnDropdown?: boolean;
  selectedDownloadFields?: string[];
  selectedDownloadFormat?: string;
  visibleColumns?: string[];
  onVisibleColumnsChange?: (columns: string[]) => void;
  columns?: any[];
  onDownloadFieldsChange?: (fields: string[]) => void;
  onDownloadFormatChange?: (format: string) => void;
  onDownloadExecute?: () => void;
};

export default function FilterBar(props: FilterBarProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* Filter Tags Container */}
      {props.showFilterTags && props.activeFilters && props.activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center bg-gray-50 p-2 rounded border">
          <span className="text-sm text-gray-600 mr-2">Active filters:</span>
          {props.activeFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => props.onRemoveFilter?.(filter.key)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-300 transition-colors flex items-center gap-1"
              title={`Remove ${filter.label || filter.value} filter`}
            >
              {filter.label || filter.value}
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" className="text-gray-500">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </div>
      )}
      
      {/* Search Bar Container */}
      <div className="flex gap-2 items-center bg-gray-100 p-2 rounded justify-between relative">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={props.searchValue}
            onChange={e => props.onSearchChange(e.target.value)}
            placeholder="Search..."
            className="border rounded px-2 py-1"
            onKeyDown={e => { if (e.key === 'Enter') props.onSearchSubmit(); }}
          />
          
          {/* Search Filter Icon */}
          {props.showSearchFilter && (
            <div className="relative">
              <button
                onClick={props.onSearchFilterDropdownToggle}
                className={`px-2 py-1 border rounded transition-colors flex items-center justify-center ${
                  props.selectedSearchFilter ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-white hover:bg-gray-50 text-gray-600'
                }`}
                title="Filter options"
              >
                {/* Filter SVG Icon */}
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="currentColor">
                  <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {/* Search Filter Dropdown */}
              {props.showSearchFilterDropdown && props.searchFilterOptions && (
                <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-30 min-w-[150px]">
                  <div className="p-2 border-b">
                    <div className="text-sm font-medium text-gray-700">Search by field:</div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => props.onSearchFilterChange?.('')}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                        !props.selectedSearchFilter ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      All Fields
                    </button>
                    {props.searchFilterOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => props.onSearchFilterChange?.(option.value)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                          props.selectedSearchFilter === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
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
          
          <button onClick={props.onSearchSubmit} className="px-2 py-1 bg-gray-800 text-white rounded">🔍</button>
          {props.children}
        </div>
        
        {/* Action Buttons on the Right */}
        <div className="flex gap-2 items-center">
          {props.showDownload && (
            <button
              onClick={props.onDownload}
              disabled={props.downloadDisabled}
              className="px-3 py-1 border rounded text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50"
              title="Download filtered data"
            >
              {/* Download SVG */}
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="4" y="17" width="16" height="4" rx="2" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Download
            </button>
          )}
          
          {props.showCopy && (
            <button
              onClick={props.onCopy}
              disabled={props.copyDisabled}
              className="px-3 py-1 border rounded text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50"
              title="Copy filtered data to clipboard"
            >
              {/* Copy SVG */}
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Copy
            </button>
          )}
          
          {props.showColumns && (
            <button
              onClick={props.onColumns}
              disabled={props.columnsDisabled}
              className="px-3 py-1 border rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50"
              title="Add or remove columns"
            >
              Columns
            </button>
          )}
          
          {props.showSaveFilter && (
            <button
              onClick={props.onSaveFilter}
              disabled={props.saveFilterDisabled}
              className="px-4 py-2 bg-green-600 text-white rounded font-semibold shadow hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minWidth: 120 }}
            >
              Save Filter
            </button>
          )}
        </div>
        
        {/* Download Dropdown */}
        {props.showDownloadDropdown && (
          <div className="absolute right-0 top-full mt-2 bg-white border rounded shadow p-4 z-30 min-w-[250px]">
            <div className="flex border-b mb-2">
              <span className="font-semibold text-blue-700 border-b-2 border-blue-500 px-2 py-1">Download</span>
            </div>
            
            {/* Format Selection */}
            <div className="mb-3">
              <div className="text-sm font-medium mb-2">Select format:</div>
              <div className="flex gap-2">
                <button
                  onClick={() => props.onDownloadFormatChange?.('JSON')}
                  className={`px-3 py-1 rounded text-sm font-medium border ${
                    props.selectedDownloadFormat === 'JSON' 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => props.onDownloadFormatChange?.('CSV')}
                  className={`px-3 py-1 rounded text-sm font-medium border ${
                    props.selectedDownloadFormat === 'CSV' 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  CSV
                </button>
                <button
                  onClick={() => props.onDownloadFormatChange?.('PDF')}
                  className={`px-3 py-1 rounded text-sm font-medium border ${
                    props.selectedDownloadFormat === 'PDF' 
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
              {props.columns?.map(col => (
                <div key={String(col.accessor)} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    checked={props.selectedDownloadFields?.includes(String(col.accessor))}
                    onChange={e => {
                      if (e.target.checked) {
                        props.onDownloadFieldsChange?.([...(props.selectedDownloadFields || []), String(col.accessor)]);
                      } else {
                        props.onDownloadFieldsChange?.(props.selectedDownloadFields?.filter(a => a !== String(col.accessor)) || []);
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
              disabled={!props.selectedDownloadFields?.length || !props.selectedDownloadFormat}
              onClick={props.onDownloadExecute}
            >
              Download {props.selectedDownloadFormat || 'Data'}
            </button>
          </div>
        )}
        
        {/* Column Dropdown */}
        {props.showColumnDropdown && (
          <div className="absolute right-0 top-full mt-2 bg-white border rounded shadow p-4 z-30 min-w-[200px]">
            <div className="flex border-b mb-2">
              <span className="font-semibold text-blue-700 border-b-2 border-blue-500 px-2 py-1">Columns</span>
            </div>
            <div className="mb-2 text-sm font-medium">Add or remove columns</div>
            {props.columns?.map(col => (
              <div key={String(col.accessor)} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={props.visibleColumns?.includes(String(col.accessor))}
                  onChange={e => {
                    if (e.target.checked) {
                      props.onVisibleColumnsChange?.([...(props.visibleColumns || []), String(col.accessor)]);
                    } else {
                      props.onVisibleColumnsChange?.(props.visibleColumns?.filter(a => a !== String(col.accessor)) || []);
                    }
                  }}
                  className="accent-pink-600 mr-2"
                  id={`col-toggle-${String(col.accessor)}`}
                />
                <label 
                  htmlFor={`col-toggle-${String(col.accessor)}`}
                  className={`${props.visibleColumns?.includes(String(col.accessor)) ? 'text-gray-900' : 'text-gray-500'}`}
                >
                  {col.header}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 