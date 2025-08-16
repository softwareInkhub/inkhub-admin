'use client'

import React, { useState } from 'react'
import { X, Download, FileText, FileSpreadsheet, FileCode } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ExportConfig } from './types'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  data: any[]
  selectedItems: string[]
  onExport: (config: ExportConfig) => void
  title?: string
}

export default function ExportModal({
  isOpen,
  onClose,
  data,
  selectedItems,
  onExport,
  title = 'Export Data'
}: ExportModalProps) {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'csv',
    includeImages: false,
    selectedOnly: false,
    columns: []
  })

  if (!isOpen) return null

  const handleExport = () => {
    onExport(exportConfig)
    onClose()
  }

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Comma-separated values' },
    { value: 'json', label: 'JSON', icon: FileCode, description: 'JavaScript Object Notation' },
    { value: 'pdf', label: 'PDF', icon: FileText, description: 'Portable Document Format' },
    { value: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel format' }
  ]

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
          {/* Export Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Export Format</h4>
            <div className="space-y-2">
              {formatOptions.map((option) => {
                const Icon = option.icon
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors",
                      exportConfig.format === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={option.value}
                      checked={exportConfig.format === option.value}
                      onChange={(e) => setExportConfig(prev => ({ ...prev, format: e.target.value as any }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <Icon className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Export Scope */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Export Scope</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="scope"
                  checked={!exportConfig.selectedOnly}
                  onChange={() => setExportConfig(prev => ({ ...prev, selectedOnly: false }))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">All Data</div>
                  <div className="text-xs text-gray-500">Export all {data.length} items</div>
                </div>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="scope"
                  checked={exportConfig.selectedOnly}
                  onChange={() => setExportConfig(prev => ({ ...prev, selectedOnly: true }))}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Selected Items Only</div>
                  <div className="text-xs text-gray-500">Export {selectedItems.length} selected items</div>
                </div>
              </label>
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Additional Options</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={exportConfig.includeImages}
                  onChange={(e) => setExportConfig(prev => ({ ...prev, includeImages: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Include Images</div>
                  <div className="text-xs text-gray-500">Include image URLs in export</div>
                </div>
              </label>
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
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  )
}
