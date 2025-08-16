'use client'

import { Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ColumnHeaderProps {
  title: string
  column: string
  hasFilter?: boolean
  filterType?: 'text' | 'select' | 'multi-select' | 'date'
  options?: string[]
  columnFilters: Record<string, any>
  activeColumnFilter: string | null
  onFilterClick: (column: string) => void
  onColumnFilterChange: (column: string, value: any) => void
  dropdownPosition?: 'left' | 'right'
}

export default function ColumnHeader({
  title,
  column,
  hasFilter = false,
  filterType = 'text',
  options = [],
  columnFilters,
  activeColumnFilter,
  onFilterClick,
  onColumnFilterChange,
  dropdownPosition = 'left'
}: ColumnHeaderProps) {
  const handleFilterClick = () => {
    onFilterClick(column)
  }

  return (
    <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 relative">
      <div className="flex items-center justify-between">
        <span>{title}</span>
        {hasFilter && (
          <div className="relative">
            <button
              onClick={handleFilterClick}
              className={cn(
                "ml-1 p-0.5 rounded hover:bg-gray-100 transition-colors",
                activeColumnFilter === column ? "bg-red-50 text-red-600" : "text-gray-400",
                columnFilters[column] && 
                (typeof columnFilters[column] === 'string' ? 
                  (columnFilters[column] as string) : 
                  Array.isArray(columnFilters[column]) ?
                    (columnFilters[column] as string[])?.length > 0 :
                    (columnFilters[column] as any)?.min || (columnFilters[column] as any)?.max || (columnFilters[column] as any)?.start || (columnFilters[column] as any)?.end
                ) ? "text-red-600" : "text-gray-400"
              )}
            >
              <Filter className="h-2.5 w-2.5" />
            </button>
            
            {/* Filter Dropdown */}
            {activeColumnFilter === column && (
              <div className={cn(
                "absolute top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[9999] column-filter-dropdown",
                column === 'title' ? 'left-0' : dropdownPosition === 'right' ? 'right-0' : 'left-0'
              )}
              style={{
                position: 'absolute',
                zIndex: 9999,
                maxHeight: '300px',
                overflowY: 'auto',
                transform: 'translateZ(0)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                ...(column === 'title' && {
                  left: '0px',
                  minWidth: '200px'
                })
              }}>
                <div className="p-2">
                  {filterType === 'text' && (
                    <input
                      type="text"
                      placeholder={`Filter ${title.toLowerCase()}...`}
                      value={columnFilters[column] as string || ''}
                      onChange={(e) => onColumnFilterChange(column, e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      autoFocus
                    />
                  )}
                  
                  {filterType === 'select' && (
                    <select
                      value={columnFilters[column] as string || ''}
                      onChange={(e) => onColumnFilterChange(column, e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">All {title}</option>
                      {options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  
                  {filterType === 'multi-select' && (
                    <select
                      multiple
                      value={columnFilters[column] as string[] || []}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value)
                        onColumnFilterChange(column, selected)
                      }}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  
                  {filterType === 'date' && (
                    <input
                      type="date"
                      value={columnFilters[column] as string || ''}
                      onChange={(e) => onColumnFilterChange(column, e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  )}
                  
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => {
                        if (filterType === 'text' || filterType === 'date') {
                          onColumnFilterChange(column, '')
                        } else {
                          onColumnFilterChange(column, [])
                        }
                        onFilterClick(column)
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </th>
  )
}
