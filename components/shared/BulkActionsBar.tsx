'use client'

import React from 'react'
import { 
  Edit, 
  Download, 
  Trash2, 
  X,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BulkActionsBarProps {
  selectedItems: string[]
  totalItems: number
  onBulkEdit: () => void
  onExportSelected: () => void
  onBulkDelete: () => void
  onClearSelection?: () => void
  className?: string
}

export default function BulkActionsBar({
  selectedItems,
  totalItems,
  onBulkEdit,
  onExportSelected,
  onBulkDelete,
  onClearSelection,
  className
}: BulkActionsBarProps) {
  if (selectedItems.length === 0) {
    return null
  }

  return (
    <div className={cn(
      "bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center justify-between",
      className
    )}>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-blue-800 font-medium">
          {selectedItems.length} of {totalItems} selected
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
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onClearSelection}
          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
          title="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
