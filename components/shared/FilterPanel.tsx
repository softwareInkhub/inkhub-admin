'use client'

import React from 'react'
import { CustomFilter } from './types'

interface FilterPanelProps {
  activeFilter: string
  setActiveFilter: (filter: string) => void
  customFilters: CustomFilter[]
  onAddCustomFilter: (filter: CustomFilter) => void
  onRemoveCustomFilter: (id: string) => void
  showCustomFilterDropdown: boolean
  setShowCustomFilterDropdown: (show: boolean) => void
  hiddenDefaultFilters: Set<string>
  onShowAllFilters: () => void
  getUniqueValues: (field: string) => string[]
}

export default function FilterPanel({
  activeFilter,
  setActiveFilter,
  customFilters,
  onAddCustomFilter,
  onRemoveCustomFilter,
  showCustomFilterDropdown,
  setShowCustomFilterDropdown,
  hiddenDefaultFilters,
  onShowAllFilters,
  getUniqueValues
}: FilterPanelProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h3 className="text-base font-semibold text-gray-900">Advanced Filters</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {customFilters.length} active
          </span>
        </div>
        <button
          onClick={() => {
            setActiveFilter('all')
            // Clear custom filters
            customFilters.forEach(filter => onRemoveCustomFilter(filter.id))
          }}
          className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-1 rounded-md transition-colors flex items-center space-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Clear all</span>
        </button>
      </div>
      
      {/* Filter Content */}
      <div className="space-y-3">
        {/* Active Filters Display */}
        {customFilters.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {customFilters.map((filter) => (
              <span key={filter.id} className="inline-flex items-center space-x-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{filter.name}</span>
                <button
                  onClick={() => onRemoveCustomFilter(filter.id)}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        
        {/* Add Custom Filter Button */}
        <button
          onClick={() => setShowCustomFilterDropdown(!showCustomFilterDropdown)}
          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200"
        >
          Add Custom Filter
        </button>
      </div>
    </div>
  )
}
