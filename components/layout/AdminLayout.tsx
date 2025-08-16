'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { Sidebar } from '../sidebar';
import { Navbar } from '../navbar';
import { TabBar } from '../tabbar';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  className?: string;
}

export function AdminLayout({
  children,
  title,
  description,
  showHeader = true,
  className,
}: AdminLayoutProps) {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const hasAddedTab = useRef(false);

  useEffect(() => {
    // Add tab for the current page if title is provided
    if (title && !hasAddedTab.current) {
      const path = window.location.pathname;
      useAppStore.getState().addTab({
        title,
        path,
        pinned: false,
        closable: true,
      });
      hasAddedTab.current = true;
    }
  }, [title]);

  return (
    <div className="flex h-screen bg-secondary-50 dark:bg-secondary-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Tab Bar */}
        <TabBar />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className={className}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => toggleSidebar()}
        />
      )}
    </div>
  );
}

// Page wrapper component for consistent page structure
interface AdminPageProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  className?: string;
}

export function AdminPage({
  children,
  title,
  description,
  showHeader = true,
  className,
}: AdminPageProps) {
  return (
    <div className="p-6 w-full min-h-screen bg-gray-50 animate-fade-in">
      {showHeader && title && (
        <div className="mb-6 animate-slide-up">
          <h1 className="text-2xl font-bold gradient-text mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-secondary-600 dark:text-secondary-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className={className}>
        {children}
      </div>
    </div>
  );
}
