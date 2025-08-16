'use client'

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'

export default function NewTabPage() {
  const { addTab, tabs } = useAppStore()
  const hasAddedTab = useRef(false)

  useEffect(() => {
    // Only add the tab once
    if (!hasAddedTab.current) {
      addTab({
        title: 'New Tab',
        path: '/new-tab',
        pinned: false,
        closable: true,
      })
      hasAddedTab.current = true
    }
  }, []) // Remove addTab from dependencies

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100">
          New Tab
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          This is a new tab page for testing the tab functionality.
        </p>
      </div>

      {/* Content */}
      <div className="card">
        <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Tab Management Features
        </h2>
        <div className="space-y-3 text-sm text-secondary-600 dark:text-secondary-400">
          <p>✅ <strong>Clickable Tabs:</strong> All tabs navigate to their respective routes</p>
          <p>✅ <strong>Add Tab Button:</strong> "+" button creates new tabs</p>
          <p>✅ <strong>Close Tabs:</strong> Close button on hover (except Dashboard)</p>
          <p>✅ <strong>Pin/Unpin:</strong> Pin tabs to keep them open (except Dashboard)</p>
          <p>✅ <strong>Dashboard Rules:</strong> Always first, cannot be closed or pinned</p>
          <p>✅ <strong>Overflow Handling:</strong> Horizontal scrolling for many tabs</p>
          <p>✅ <strong>Context Menu:</strong> Right-click for additional options</p>
          <p>✅ <strong>Search:</strong> Ctrl+F to search tabs</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Current Tabs ({tabs.length})
        </h2>
        <div className="space-y-2">
          {tabs.map((tab) => (
            <div key={tab.id} className="flex items-center space-x-2 text-sm">
              <span className={`px-2 py-1 rounded ${tab.pinned ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                {tab.pinned ? '📌' : '📄'}
              </span>
              <span className="font-medium">{tab.title}</span>
              <span className="text-gray-500">({tab.path})</span>
              {!tab.closable && <span className="text-red-500">🔒</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
