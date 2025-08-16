'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Download, 
  Upload, 
  Printer, 
  Settings, 
  MoreHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Eye,
  Edit,
  Trash2,
  Pin,
  PinOff,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SearchControlsProps, ViewMode } from './types'
import AdvancedSearchBuilder from './AdvancedSearchBuilder'
import FilterPanel from './FilterPanel'
import ColumnFilter from './ColumnFilter'

export default function SearchControls({
  searchQuery,
  setSearchQuery,
  searchConditions,
  showSearchBuilder,
  setShowSearchBuilder,
  showAdditionalControls,
  setShowAdditionalControls,
  activeFilter,
  setActiveFilter,
  customFilters,
  onAddCustomFilter,
  onRemoveCustomFilter,
  showCustomFilterDropdown,
  setShowCustomFilterDropdown,
  hiddenDefaultFilters,
  onShowAllFilters,
  onClearSearch,
  onClearSearchConditions,
  selectedItems,
  onBulkEdit,
  onExportSelected,
  onBulkDelete,
  currentItems,
  onSelectAll,
  activeColumnFilter,
  columnFilters,
  onFilterClick,
  onColumnFilterChange,
  getUniqueValues,
  onExport,
  onImport,
  onPrint,
  onSettings,
  showHeaderDropdown,
  setShowHeaderDropdown,
  viewMode,
  setViewMode,
  showAdvancedFilter,
  setShowAdvancedFilter,
  isFullScreen,
  onToggleFullScreen,
  isAlgoliaSearching,
  useAlgoliaSearch
}: SearchControlsProps) {
  const [showViewOptions, setShowViewOptions] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      if (!target.closest('.header-dropdown')) {
        setShowHeaderDropdown(false)
      }
      if (!target.closest('.custom-filter-dropdown')) {
        setShowCustomFilterDropdown(false)
      }
      if (!target.closest('.additional-controls-dropdown')) {
        setShowAdditionalControls(false)
      }
      if (!target.closest('.view-options-dropdown')) {
        setShowViewOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setShowHeaderDropdown, setShowCustomFilterDropdown, setShowAdditionalControls])

  const handleClearSearch = () => {
    setSearchQuery('')
    onClearSearch()
    searchInputRef.current?.focus()
  }

  const handleToggleAdvancedFilter = () => {
    setShowAdvancedFilter(!showAdvancedFilter)
  }

  const handleToggleSearchBuilder = () => {
    setShowSearchBuilder(!showSearchBuilder)
  }

  return (
    <div className="bg-white border-b border-gray-200 p-4 space-y-4">
      {/* Main Search Bar */}
      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={handleToggleAdvancedFilter}
          className={cn(
            "flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors",
            showAdvancedFilter
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          )}
        >
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters</span>
          {showAdvancedFilter && (
            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
              Active
            </span>
          )}
        </button>

        {/* Advanced Search Builder Toggle */}
        <button
          onClick={handleToggleSearchBuilder}
          className={cn(
            "flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors",
            showSearchBuilder
              ? "bg-purple-50 border-purple-200 text-purple-700"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          )}
        >
          <Search className="h-4 w-4" />
          <span className="text-sm font-medium">Advanced</span>
          {searchConditions.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
              {searchConditions.length}
            </span>
          )}
        </button>

        {/* View Mode Toggle */}
        <div className="relative view-options-dropdown">
          <button
            onClick={() => setShowViewOptions(!showViewOptions)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {viewMode === 'table' && <List className="h-4 w-4" />}
            {viewMode === 'grid' && <Grid className="h-4 w-4" />}
            {viewMode === 'card' && <Grid className="h-4 w-4" />}
            <span className="text-sm font-medium capitalize">{viewMode}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {showViewOptions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => {
                    setViewMode('table')
                    setShowViewOptions(false)
                  }}
                  className={cn(
                    "flex items-center space-x-3 w-full px-4 py-2 text-sm hover:bg-gray-50",
                    viewMode === 'table' && "bg-blue-50 text-blue-700"
                  )}
                >
                  <List className="h-4 w-4" />
                  <span>Table View</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode('grid')
                    setShowViewOptions(false)
                  }}
                  className={cn(
                    "flex items-center space-x-3 w-full px-4 py-2 text-sm hover:bg-gray-50",
                    viewMode === 'grid' && "bg-blue-50 text-blue-700"
                  )}
                >
                  <Grid className="h-4 w-4" />
                  <span>Grid View</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode('card')
                    setShowViewOptions(false)
                  }}
                  className={cn(
                    "flex items-center space-x-3 w-full px-4 py-2 text-sm hover:bg-gray-50",
                    viewMode === 'card' && "bg-blue-50 text-blue-700"
                  )}
                >
                  <Grid className="h-4 w-4" />
                  <span>Card View</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Full Screen Toggle */}
        <button
          onClick={onToggleFullScreen}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
        >
          {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        {/* Header Actions Dropdown */}
        <div className="relative header-dropdown">
          <button
            onClick={() => setShowHeaderDropdown(!showHeaderDropdown)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="text-sm font-medium">Actions</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {showHeaderDropdown && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => {
                    onExport()
                    setShowHeaderDropdown(false)
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => {
                    onImport()
                    setShowHeaderDropdown(false)
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import</span>
                </button>
                <button
                  onClick={() => {
                    onPrint()
                    setShowHeaderDropdown(false)
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </button>
                <div className="border-t border-gray-200 my-1" />
                <button
                  onClick={() => {
                    onSettings()
                    setShowHeaderDropdown(false)
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Controls */}
      {showAdditionalControls && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {selectedItems.length} of {currentItems.length} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={onBulkEdit}
                className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={onExportSelected}
                className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                onClick={onBulkDelete}
                className="flex items-center space-x-2 px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowAdditionalControls(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Active Filters Display */}
      {(activeFilter !== 'all' || customFilters.length > 0 || searchConditions.length > 0) && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {activeFilter !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {activeFilter}
              <button
                onClick={() => setActiveFilter('all')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {customFilters.map((filter) => (
            <span key={filter.id} className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {filter.name}
              <button
                onClick={() => onRemoveCustomFilter(filter.id)}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {searchConditions.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {searchConditions.length} search condition{searchConditions.length !== 1 ? 's' : ''}
              <button
                onClick={onClearSearchConditions}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Advanced Search Builder */}
      {showSearchBuilder && (
        <AdvancedSearchBuilder
          searchConditions={searchConditions}
          onClearConditions={onClearSearchConditions}
          onClose={() => setShowSearchBuilder(false)}
        />
      )}

      {/* Advanced Filter Panel */}
      {showAdvancedFilter && (
        <FilterPanel
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          customFilters={customFilters}
          onAddCustomFilter={onAddCustomFilter}
          onRemoveCustomFilter={onRemoveCustomFilter}
          showCustomFilterDropdown={showCustomFilterDropdown}
          setShowCustomFilterDropdown={setShowCustomFilterDropdown}
          hiddenDefaultFilters={hiddenDefaultFilters}
          onShowAllFilters={onShowAllFilters}
          getUniqueValues={getUniqueValues}
        />
      )}
    </div>
  )
}
