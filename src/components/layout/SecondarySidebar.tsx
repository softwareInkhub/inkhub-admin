'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTabContext } from "@/components/layout/TabContext";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const sidebarConfig = [
  {
    title: 'Shopify',
    key: 'shopify',
    items: [
      { name: 'Orders', href: '/shopify/orders' },
      { name: 'Products', href: '/shopify/products' },
    ],
  },
  {
    title: 'Pinterest',
    key: 'pinterest',
    items: [
      { name: 'Pins', href: '/pinterest/pins' },
      { name: 'Boards', href: '/pinterest/boards' },
    ],
  },
  {
    title: 'Design Library',
    key: 'design-library',
    items: [
      { name: 'Designs', href: '/design-library/designs' },
    ],
  },
  {
    title: 'Settings',
    key: 'settings',
    items: [
      { name: 'General', href: '/settings' },
      { name: 'Health Check', href: '/settings/health' },
    ],
  },
  {
    title: 'User Management',
    key: 'user-management',
    items: [
      { name: 'Register User', href: '/user-management/register' },
      { name: 'Existing User', href: '/user-management/existing' },
      { name: 'Access Control', href: '/user-management/access-control' },
    ],
  },
];

interface SecondarySidebarProps {
  section: string;
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function SecondarySidebar({ section }: SecondarySidebarProps) {
  const pathname = usePathname();
  const { openTab } = useTabContext();
  const [collapsed, setCollapsed] = useState(false);

  // Only show the selected section
  const filteredConfig = sidebarConfig.filter(s => s.key === section);
  const sectionData = filteredConfig[0];

  if (!sectionData) return null;

  return (
    <div className="relative h-full">
      {/* Collapse/Expand Button (docks over main sidebar when collapsed) */}
      <button
        className="absolute z-50 bg-white border border-gray-200 rounded-full shadow-lg p-1 hover:bg-gray-50 transition-colors"
        style={{
          top: '2rem',
          right: collapsed ? 'auto' : '-16px',
          left: collapsed ? '-18px' : 'auto',
        }}
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        type="button"
      >
        {collapsed ? (
          <ChevronRightIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>
      <aside
        className={`h-full flex flex-col transition-all duration-300 overflow-hidden ${
          collapsed
            ? 'w-0 min-w-0 border-none bg-transparent p-0'
            : 'w-64 border-r border-gray-200 bg-white'
        }`}
        style={{ position: 'relative' }}
      >
        {/* Sidebar Content */}
        {!collapsed && (
          <>
            {/* Section Title */}
            <div className="sticky top-0 z-10 bg-white pt-6 pb-2 px-6">
              <div className="text-xl font-bold text-gray-900 mb-2">{sectionData.title}</div>
              <div className="h-px bg-gray-200 mb-2" />
            </div>
            {/* Menu Items */}
            <nav className="flex flex-col gap-1 px-4 pt-2">
              {sectionData.items.map(item => {
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.name}
                    className={`text-left px-4 py-2 rounded-lg transition-colors font-medium text-base mb-1 ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => openTab({ key: item.href, label: item.name, path: item.href })}
                  >
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </>
        )}
      </aside>
    </div>
  );
} 