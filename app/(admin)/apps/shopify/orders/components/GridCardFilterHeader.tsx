'use client'

import { cn } from '@/lib/utils'
import CardsPerRowDropdown from './CardsPerRowDropdown'

interface GridCardFilterHeaderProps {
  selectedOrders: string[]
  currentOrders: any[]
  onSelectAll: () => void
  activeColumnFilter: string | null
  columnFilters: Record<string, any>
  onFilterClick: (column: string) => void
  onColumnFilterChange: (column: string, value: any) => void
  getUniqueValues: (field: string) => string[]
  cardsPerRow?: number
  onCardsPerRowChange?: (value: number) => void
}

export default function GridCardFilterHeader({
  selectedOrders,
  currentOrders,
  onSelectAll,
  activeColumnFilter,
  columnFilters,
  onFilterClick,
  onColumnFilterChange,
  getUniqueValues,
  cardsPerRow = 4,
  onCardsPerRowChange
}: GridCardFilterHeaderProps) {
  const renderFilterDropdown = (column: string, filterType: string, options?: string[]) => {
    if (activeColumnFilter !== column) return null

    return (
      <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] column-filter-dropdown backdrop-blur-sm"
        style={{
          position: 'absolute',
          zIndex: 9999,
          maxHeight: '320px',
          overflowY: 'auto',
          transform: 'translateZ(0)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          minWidth: '220px',
          maxWidth: '320px'
        }}>
        <div className="p-4">
          {filterType === 'text' && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder={`Filter ${column}...`}
                value={columnFilters[column] as string || ''}
                onChange={(e) => onColumnFilterChange(column, e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white text-black"
                autoFocus
              />
            </div>
          )}
          
          {filterType === 'select' && (
            <div className="space-y-3">
              <select
                value={columnFilters[column] as string || ''}
                onChange={(e) => onColumnFilterChange(column, e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white text-black"
              >
                <option value="">All {column}</option>
                {options?.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )}
          
          {filterType === 'multi-select' && (
            <div className="space-y-3">
              <select
                multiple
                value={columnFilters[column] as string[] || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  onColumnFilterChange(column, selected)
                }}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white focus:bg-white min-h-[80px] text-black"
              >
                {options?.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Enhanced numeric filtering for total */}
          {(filterType === 'numeric' || column === 'total') && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-black mb-2">FILTER OPTIONS:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onColumnFilterChange(column, { min: '0', max: '100' })}
                  className="text-xs px-2 py-1 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-md hover:from-green-100 hover:to-green-200 transition-all duration-200 text-green-700 font-medium"
                >
                  Under ₹100
                </button>
                <button
                  onClick={() => onColumnFilterChange(column, { min: '100', max: '500' })}
                  className="text-xs px-2 py-1 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-md hover:from-blue-100 hover:to-blue-200 transition-all duration-200 text-blue-700 font-medium"
                >
                  ₹100-500
                </button>
                <button
                  onClick={() => onColumnFilterChange(column, { min: '500', max: '1000' })}
                  className="text-xs px-2 py-1 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-md hover:from-purple-100 hover:to-purple-200 transition-all duration-200 text-purple-700 font-medium"
                >
                  ₹500-1000
                </button>
                <button
                  onClick={() => onColumnFilterChange(column, { min: '1000', max: '' })}
                  className="text-xs px-2 py-1 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-md hover:from-orange-100 hover:to-orange-200 transition-all duration-200 text-orange-700 font-medium"
                >
                  Over ₹1000
                </button>
              </div>
            </div>
          )}
          
          {/* Date filtering */}
          {filterType === 'date' && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-black mb-2">FILTER OPTIONS:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onColumnFilterChange(column, 'today')}
                  className="text-xs px-2 py-1 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-md hover:from-green-100 hover:to-green-200 transition-all duration-200 text-green-700 font-medium"
                >
                  Today
                </button>
                <button
                  onClick={() => onColumnFilterChange(column, 'yesterday')}
                  className="text-xs px-2 py-1 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-md hover:from-blue-100 hover:to-blue-200 transition-all duration-200 text-blue-700 font-medium"
                >
                  Yesterday
                </button>
                <button
                  onClick={() => onColumnFilterChange(column, 'this_week')}
                  className="text-xs px-2 py-1 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-md hover:from-purple-100 hover:to-purple-200 transition-all duration-200 text-purple-700 font-medium"
                >
                  This Week
                </button>
                <button
                  onClick={() => onColumnFilterChange(column, 'this_month')}
                  className="text-xs px-2 py-1 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-md hover:from-orange-100 hover:to-orange-200 transition-all duration-200 text-orange-700 font-medium"
                >
                  This Month
                </button>
                <button
                  onClick={() => onColumnFilterChange(column, 'last_7_days')}
                  className="text-xs px-2 py-1 bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-md hover:from-indigo-100 hover:to-indigo-200 transition-all duration-200 text-indigo-700 font-medium"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => onColumnFilterChange(column, 'last_30_days')}
                  className="text-xs px-2 py-1 bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 rounded-md hover:from-pink-100 hover:to-pink-200 transition-all duration-200 text-pink-700 font-medium"
                >
                  Last 30 Days
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Format: YYYY-MM-DD
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border-b border-gray-200 py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Select All Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedOrders.length === currentOrders.length && currentOrders.length > 0}
              onChange={onSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              {selectedOrders.length} of {currentOrders.length} selected
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Cards Per Row Dropdown */}
          {onCardsPerRowChange && (
            <CardsPerRowDropdown
              value={cardsPerRow}
              onChange={onCardsPerRowChange}
              className="w-32"
            />
          )}
        </div>
      </div>
    </div>
  )
}
