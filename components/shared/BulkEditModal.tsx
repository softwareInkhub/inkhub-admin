'use client'

import React, { useState } from 'react'
import { X, Edit } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BulkEditModalProps {
  isOpen: boolean
  onClose: () => void
  selectedItems: string[]
  onBulkEdit: (updates: Record<string, any>) => void
  title?: string
}

export default function BulkEditModal({
  isOpen,
  onClose,
  selectedItems,
  onBulkEdit,
  title = 'Bulk Edit'
}: BulkEditModalProps) {
  const [updates, setUpdates] = useState<Record<string, any>>({})

  if (!isOpen) return null

  const handleSave = () => {
    onBulkEdit(updates)
    onClose()
  }

  const handleFieldChange = (field: string, value: any) => {
    setUpdates(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-sm text-gray-600">
            Editing {selectedItems.length} selected items
          </div>

          {/* Edit Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={updates.status || ''}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No change</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor
              </label>
              <input
                type="text"
                value={updates.vendor || ''}
                onChange={(e) => handleFieldChange('vendor', e.target.value)}
                placeholder="Enter vendor name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type
              </label>
              <input
                type="text"
                value={updates.productType || ''}
                onChange={(e) => handleFieldChange('productType', e.target.value)}
                placeholder="Enter product type"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={updates.tags || ''}
                onChange={(e) => handleFieldChange('tags', e.target.value)}
                placeholder="Enter tags (comma-separated)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  )
}
