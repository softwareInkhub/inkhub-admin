'use client'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PinHeaderProps {
  showHeaderDropdown: boolean
  setShowHeaderDropdown: (show: boolean) => void
  onExport: () => void
  onImport: () => void
  onPrint: () => void
  onSettings: () => void
  onCreatePin: () => void
}

export default function PinHeader({
  showHeaderDropdown,
  setShowHeaderDropdown,
  onExport,
  onImport,
  onPrint,
  onSettings,
  onCreatePin
}: PinHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-pink-600 rounded-full"></div>
          <h1 className="text-xl font-semibold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Pinterest Pins
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onExport}
            className="px-3 py-1.5 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200 hover:shadow-md text-sm group"
          >
            <span className="group-hover:scale-105 transition-transform duration-200">Export</span>
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowHeaderDropdown(!showHeaderDropdown)}
              className="px-3 py-1.5 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200 hover:shadow-md flex items-center space-x-1 text-sm group"
            >
              <span className="group-hover:scale-105 transition-transform duration-200">More actions</span>
              <ChevronDown className={cn(
                "h-3 w-3 group-hover:rotate-180 transition-transform duration-200",
                showHeaderDropdown ? "rotate-180" : ""
              )} />
            </button>
            
            {/* Header Dropdown */}
            {showHeaderDropdown && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 header-dropdown">
                <div className="p-2">
                  <div className="space-y-1">
                    <button
                      onClick={onImport}
                      className="w-full text-left px-2 py-1 text-xs rounded transition-colors text-gray-700 hover:bg-gray-100"
                    >
                      Import Pins
                    </button>
                    <button
                      onClick={onPrint}
                      className="w-full text-left px-2 py-1 text-xs rounded transition-colors text-gray-700 hover:bg-gray-100"
                    >
                      Print Pins
                    </button>
                    <button
                      onClick={onSettings}
                      className="w-full text-left px-2 py-1 text-xs rounded transition-colors text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={onCreatePin}
            className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-md hover:from-red-600 hover:to-pink-700 transition-all duration-200 hover:shadow-lg text-sm group transform hover:scale-105"
          >
            <span className="group-hover:scale-105 transition-transform duration-200">Create pin</span>
          </button>
        </div>
      </div>
    </div>
  )
}
