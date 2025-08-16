'use client'

import React, { useState, useMemo } from 'react'
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DataTableProps, TableColumn, BaseEntity } from './types'
import StatusBadge from './StatusBadge'
import ImageDisplay from './ImageDisplay'
import HighlightedText from './HighlightedText'

export default function DataTable<T extends BaseEntity>({
  data,
  columns,
  loading = false,
  error = null,
  pagination,
  selectedItems = [],
  onSelectItem,
  onSelectAll,
  onRowClick,
  searchQuery = '',
  showImages = true,
  isFullScreen = false
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn as keyof T]
      const bValue = b[sortColumn as keyof T]

      if (aValue === bValue) return 0

      let comparison = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime()
      } else {
        comparison = String(aValue).localeCompare(String(bValue))
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [data, sortColumn, sortDirection])

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const handleRowClick = (item: T, event: React.MouseEvent) => {
    // Don't trigger if clicking on checkbox or action buttons
    if ((event.target as HTMLElement).closest('input[type="checkbox"]') ||
        (event.target as HTMLElement).closest('button')) {
      return
    }
    
    onRowClick?.(item)
  }

  const handleSelectItem = (id: string) => {
    onSelectItem?.(id)
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-200 rounded-t-lg"></div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 border-b border-gray-200 last:border-b-0"></div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32 text-red-600">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Error Loading Data</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">No Data Found</div>
          <div className="text-sm">Try adjusting your search or filters</div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 overflow-hidden",
      isFullScreen && "flex-1 flex flex-col"
    )}>
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-700">
          {/* Checkbox Column */}
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedItems.length === data.length && data.length > 0}
              onChange={onSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>

          {/* Data Columns */}
          {columns.map((column) => (
            <div
              key={column.key}
              className={cn(
                "flex items-center space-x-1 cursor-pointer hover:text-gray-900 transition-colors",
                column.align === 'center' && "justify-center",
                column.align === 'right' && "justify-end"
              )}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <span>{column.label}</span>
              {column.sortable && (
                <div className="flex flex-col">
                  <ChevronUp 
                    className={cn(
                      "h-3 w-3",
                      sortColumn === column.key && sortDirection === 'asc' 
                        ? "text-blue-600" 
                        : "text-gray-400"
                    )} 
                  />
                  <ChevronDown 
                    className={cn(
                      "h-3 w-3 -mt-1",
                      sortColumn === column.key && sortDirection === 'desc' 
                        ? "text-blue-600" 
                        : "text-gray-400"
                    )} 
                  />
                </div>
              )}
            </div>
          ))}

          {/* Actions Column removed */}
        </div>
      </div>

      {/* Table Body */}
      <div className={cn(
        "divide-y divide-gray-200",
        isFullScreen && "flex-1 overflow-auto"
      )}>
        {sortedData.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "grid grid-cols-12 gap-4 px-4 py-3 text-sm hover:bg-gray-50 transition-colors cursor-pointer",
              selectedItems.includes(item.id) && "bg-blue-50 hover:bg-blue-100"
            )}
            onClick={(e) => handleRowClick(item, e)}
          >
            {/* Checkbox */}
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={(e) => handleSelectItem(item.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Data Cells */}
            {columns.map((column) => (
              <div
                key={column.key}
                className={cn(
                  "flex items-center space-x-2",
                  column.align === 'center' && "justify-center",
                  column.align === 'right' && "justify-end"
                )}
              >
                {column.render ? (
                  column.render(item[column.key as keyof T], item)
                ) : (
                  <div className="truncate">
                    {(() => {
                      const value = item[column.key as keyof T]
                      
                      // Handle different data types
                      if (column.key === 'images' && showImages && Array.isArray(value)) {
                        return (
                          <ImageDisplay
                            src={value[0] || ''}
                            alt={`${item.id} image`}
                            size="sm"
                          />
                        )
                      }

                      if (column.key === 'status' && typeof value === 'string') {
                        return <StatusBadge status={value} type="status" />
                      }

                      if (column.key === 'price' && typeof value === 'number') {
                        return <span className="font-medium">₹{(value || 0).toFixed(2)}</span>
                      }

                      if (column.key === 'createdAt' || column.key === 'updatedAt') {
                        return (
                          <span className="text-gray-500">
                            {new Date(value as string).toLocaleDateString()}
                          </span>
                        )
                      }

                      if (column.key === 'tags' && Array.isArray(value)) {
                        return (
                          <div className="flex flex-wrap gap-1">
                            {value.slice(0, 2).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {value.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{value.length - 2}
                              </span>
                            )}
                          </div>
                        )
                      }

                      // Handle search highlighting
                      if (searchQuery && typeof value === 'string') {
                        return (
                          <HighlightedText
                            text={value}
                            searchQuery={searchQuery}
                            className="text-gray-900"
                          />
                        )
                      }

                      return <span className="text-gray-900">{String(value || '')}</span>
                    })()}
                  </div>
                )}
              </div>
            ))}

            {/* Actions section removed */}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={pagination.itemsPerPage}
                onChange={(e) => pagination.onItemsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">per page</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
