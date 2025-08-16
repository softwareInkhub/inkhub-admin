'use client'

import { useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { TabBar } from '@/components/tabbar'
import { useAppStore } from '@/lib/store'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { ensureDashboardTab } = useAppStore()

  useEffect(() => {
    // Ensure Dashboard tab is always present
    ensureDashboardTab()
  }, [ensureDashboardTab])

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />
        
        {/* Tab Bar */}
        <TabBar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-secondary-50 p-6 dark:bg-secondary-900">
          {children}
        </main>
      </div>
    </div>
  )
} 