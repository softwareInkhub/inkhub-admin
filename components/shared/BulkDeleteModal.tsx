'use client'

import React from 'react'
import { X, Trash2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BulkDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  selectedItems: string[]
  onBulkDelete: () => void
  title?: string
}

export default function BulkDeleteModal({
  isOpen,
  onClose,
  selectedItems,
  onBulkDelete,
  title = 'Confirm Delete'
}: BulkDeleteModalProps) {
  if (!isOpen) return null

  const handleDelete = () => {
    onBulkDelete()
    onClose()
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
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">Are you sure?</h4>
              <p className="text-sm text-gray-600">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              You are about to delete <strong>{selectedItems.length}</strong> selected items.
              This action will permanently remove these items from the system.
            </p>
          </div>

          <div className="text-sm text-gray-600">
            <p>This will delete:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>All associated data and files</li>
              <li>Related records and references</li>
              <li>Any linked content or media</li>
            </ul>
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
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete {selectedItems.length} Items</span>
          </button>
        </div>
      </div>
    </div>
  )
}
