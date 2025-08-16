'use client'

import { Search, Filter, Grid, List, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchControlsProps {
  searchQuery: string
  searchConditions: any[]
  showSearchBuilder: boolean
  showAdvancedFilter: boolean
  showViewOptions: boolean
  showAdditionalControls: boolean
  viewMode: 'table' | 'grid' | 'list'
  selectedOrders: string[]
  onSearchChange: (query: string) => void
  onSearchBuilderToggle: () => void
  onAdvancedFilterToggle: () => void
  onViewOptionsToggle: () => void
  onAdditionalControlsToggle: () => void
  onViewModeChange: (mode: 'table' | 'grid' | 'list') => void
  onClearSearch: () => void
  onPreviewOrders: () => void
  onExportSelected: () => void
  onBulkEdit: () => void
  onBulkDelete: () => void
  getViewModeIcon: () => React.ReactNode
}

export default function SearchControls({
  searchQuery,
  searchConditions,
  showSearchBuilder,
  showAdvancedFilter,
  showViewOptions,
  showAdditionalControls,
  viewMode,
  selectedOrders,
  onSearchChange,
  onSearchBuilderToggle,
  onAdvancedFilterToggle,
  onViewOptionsToggle,
  onAdditionalControlsToggle,
  onViewModeChange,
  onClearSearch,
  onPreviewOrders,
  onExportSelected,
  onBulkEdit,
  onBulkDelete,
  getViewModeIcon
}: SearchControlsProps) {
  return (
    <div className="flex items-center space-x-1">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
        <input
          type="text"
          placeholder={searchConditions.length > 0 ? "Advanced search active..." : "Search orders..."}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={searchConditions.length > 0}
          className={cn(
            "pl-7 pr-3 py-1.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm",
            searchConditions.length > 0 
              ? "border-blue-300 bg-blue-50 text-gray-500" 
              : "border-gray-300 focus:border-transparent"
          )}
        />
        {searchConditions.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {searchConditions.length}
          </div>
        )}
        {(searchQuery || searchConditions.length > 0) && (
          <button
            onClick={onClearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <button
        onClick={onSearchBuilderToggle}
        className={cn(
          "px-2 py-1.5 text-xs border border-gray-300 rounded-md transition-colors",
          showSearchBuilder || searchConditions.length > 0
            ? "bg-blue-50 border-blue-300 text-blue-600"
            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
        )}
      >
        {searchConditions.length > 0 ? `${searchConditions.length} Conditions` : 'Advanced'}
      </button>
      <button
        onClick={onAdvancedFilterToggle}
        className={cn(
          "p-1.5 border border-gray-300 rounded-md transition-colors",
          showAdvancedFilter 
            ? "bg-blue-50 border-blue-300 text-blue-600" 
            : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
        )}
      >
        <Filter className="h-3 w-3" />
      </button>
      
      {/* View Mode Button */}
      <div className="relative">
        <button
          onClick={onViewOptionsToggle}
          className={cn(
            "p-1.5 border border-gray-300 rounded-md transition-colors group",
            showViewOptions 
              ? "bg-blue-50 border-blue-300 text-blue-600" 
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          )}
        >
          {getViewModeIcon()}
        </button>
        
        {/* View Options Dropdown */}
        {showViewOptions && (
          <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-20 view-options-dropdown">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-700 mb-2">View Mode</div>
              <div className="space-y-1">
                {[
                  { key: 'table', label: 'Table View', icon: <Grid className="h-3 w-3" /> },
                  { key: 'grid', label: 'Grid View', icon: <Grid className="h-3 w-3" /> },
                  { key: 'list', label: 'List View', icon: <List className="h-3 w-3" /> }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => onViewModeChange(option.key as 'table' | 'grid' | 'list')}
                    className={cn(
                      "w-full text-left px-2 py-1 text-xs rounded transition-colors flex items-center space-x-2",
                      viewMode === option.key
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Additional Controls Button */}
      <div className="relative">
        <button
          onClick={onAdditionalControlsToggle}
          className={cn(
            "p-1.5 border border-gray-300 rounded-md transition-colors group",
            showAdditionalControls 
              ? "bg-blue-50 border-blue-300 text-blue-600" 
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          )}
        >
          <ChevronDown className={cn(
            "h-3 w-3 transition-transform duration-200",
            showAdditionalControls ? "rotate-180" : ""
          )} />
        </button>
        
        {/* Additional Controls Dropdown */}
        {showAdditionalControls && (
          <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 additional-controls-dropdown">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-700 mb-2">Additional Options</div>
              <div className="space-y-1">
                <button
                  onClick={onPreviewOrders}
                  className="w-full text-left px-2 py-1 text-xs rounded transition-colors flex items-center space-x-2 text-gray-700 hover:bg-gray-100"
                >
                  <span>👁️</span>
                  <span>Preview Orders ({selectedOrders.length || 'All'})</span>
                </button>
                <button
                  onClick={onExportSelected}
                  className="w-full text-left px-2 py-1 text-xs rounded transition-colors flex items-center space-x-2 text-gray-700 hover:bg-gray-100"
                >
                  <span>📥</span>
                  <span>Export Selected ({selectedOrders.length || 'All'})</span>
                </button>
                <button 
                  onClick={onBulkEdit}
                  className="w-full text-left px-2 py-1 text-xs rounded transition-colors flex items-center space-x-2 text-gray-700 hover:bg-gray-100"
                >
                  <span>✏️</span>
                  <span>Bulk Edit ({selectedOrders.length || 'All'})</span>
                </button>
                <button 
                  onClick={onBulkDelete}
                  className="w-full text-left px-2 py-1 text-xs rounded transition-colors flex items-center space-x-2 text-gray-700 hover:bg-gray-100"
                >
                  <span>🗑️</span>
                  <span>Bulk Delete ({selectedOrders.length || 'All'})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
