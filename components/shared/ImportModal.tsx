'use client'

import React, { useState } from 'react'
import { X, Upload, FileText, FileSpreadsheet, FileCode } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (file: File, config: ImportConfig) => void
  title?: string
}

interface ImportConfig {
  format: 'csv' | 'json' | 'excel'
  updateExisting: boolean
  skipDuplicates: boolean
}

export default function ImportModal({
  isOpen,
  onClose,
  onImport,
  title = 'Import Data'
}: ImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importConfig, setImportConfig] = useState<ImportConfig>({
    format: 'csv',
    updateExisting: false,
    skipDuplicates: true
  })

  if (!isOpen) return null

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile, importConfig)
      onClose()
    }
  }

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Comma-separated values' },
    { value: 'json', label: 'JSON', icon: FileCode, description: 'JavaScript Object Notation' },
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
          {/* File Upload */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Upload File</h4>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                {selectedFile ? selectedFile.name : 'Click to select a file or drag and drop'}
              </p>
              <input
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Select File
              </label>
            </div>
          </div>

          {/* Import Options */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Import Options</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={importConfig.updateExisting}
                  onChange={(e) => setImportConfig(prev => ({ ...prev, updateExisting: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Update Existing Records</div>
                  <div className="text-xs text-gray-500">Update records that already exist</div>
                </div>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={importConfig.skipDuplicates}
                  onChange={(e) => setImportConfig(prev => ({ ...prev, skipDuplicates: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">Skip Duplicates</div>
                  <div className="text-xs text-gray-500">Skip duplicate records during import</div>
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
            onClick={handleImport}
            disabled={!selectedFile}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors',
              selectedFile
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            )}
          >
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </button>
        </div>
      </div>
    </div>
  )
}
