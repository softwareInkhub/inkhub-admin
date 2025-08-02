'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const sidebarConfig = [
  {
    title: 'Shopify',
    key: 'shopify',
    items: [
      { name: 'Orders', href: '/shopify/orders', type: 'orders' },
      { name: 'Products', href: '/shopify/products', type: 'products' },
    ],
  },
  {
    title: 'Pinterest',
    key: 'pinterest',
    items: [
      { name: 'Dashboard', href: '/pinterest/dashboard', type: 'dashboard' },
      { name: 'Pins', href: '/pinterest/pins', type: 'pins' },
      { name: 'Boards', href: '/pinterest/boards', type: 'boards' },
    ],
  },
  {
    title: 'Design Library',
    key: 'design-library',
    items: [
      { name: 'Designs', href: '/design-library/designs', type: 'designs' },
    ],
  },
  {
    title: 'Settings',
    key: 'settings',
    items: [
      { name: 'General', href: '/settings', type: 'general' },
      { name: 'Health Check', href: '/settings/health', type: 'health' },
      { name: 'Indexing', href: '/settings/indexing', type: 'indexing' },
    ],
  },
  {
    title: 'User Management',
    key: 'user-management',
    items: [
      { name: 'Register User', href: '/user-management/register', type: 'register' },
      { name: 'Existing User', href: '/user-management/existing', type: 'existing' },
      { name: 'Access Control', href: '/user-management/access-control', type: 'access-control' },
    ],
  },
];

interface SecondarySidebarProps {
  section: string;
  onCollapseChange?: (collapsed: boolean) => void;
  onItemClick?: (href: string, title: string, type: string) => void;
}

export default function SecondarySidebar({ section, onCollapseChange, onItemClick }: SecondarySidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleCollapseToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  const handleItemClick = (item: any) => {
    console.log('Secondary sidebar item clicked:', item);
    
    // Call the parent handler if provided
    if (onItemClick) {
      onItemClick(item.href, item.name, item.type);
    } else {
      // Fallback to direct navigation
      router.push(item.href);
    }
  };

  // Only show the selected section
  const filteredConfig = sidebarConfig.filter(s => s.key === section);
  const sectionData = filteredConfig[0];

  if (!sectionData) return null;

  return (
    <div className="relative h-full">
      {/* Collapse/Expand Button */}
      <button
        onClick={handleCollapseToggle}
        className={`absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ${
          collapsed ? 'left-2' : 'right-2'
        }`}
        style={{
          top: '2rem',
          transform: 'translateX(0)',
        }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        type="button"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      <aside
        className={`h-full flex flex-col transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${
          collapsed
            ? 'w-0 min-w-0 opacity-0'
            : 'w-64 opacity-100'
        }`}
      >
        {/* Sidebar Content */}
        {!collapsed && (
          <>
            {/* Section Title */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 pt-6 pb-4 px-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {sectionData.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your {sectionData.title.toLowerCase()} settings
              </p>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              {sectionData.items.map(item => {
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium text-left ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current mr-3 opacity-60"></span>
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {sectionData.title} Section
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
} 