'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
];

interface SecondarySidebarProps {
  section: string;
}

export default function SecondarySidebar({ section }: SecondarySidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [activeSections, setActiveSections] = useState<string[]>([]);
  const { openTab } = useTabContext();

  // Load activeSections from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('sidebarActiveSections');
    if (stored) {
      setActiveSections(JSON.parse(stored));
    }
  }, []);

  // Update activeSections if the user navigates to a new section
  useEffect(() => {
    const section = sidebarConfig.find(section =>
      section.items.some(item => pathname.startsWith(item.href))
    );
    if (section && !activeSections.includes(section.key)) {
      const updated = [...activeSections, section.key];
      setActiveSections(updated);
      localStorage.setItem('sidebarActiveSections', JSON.stringify(updated));
    }
  }, [pathname]);

  // Persist activeSections to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarActiveSections', JSON.stringify(activeSections));
  }, [activeSections]);

  // Only show sections that are in activeSections
  const shownSections = sidebarConfig.filter(section => activeSections.includes(section.key));
  if (shownSections.length === 0) return null;

  // The most recently clicked/added section is the last in the array
  const lastActiveKey = activeSections[activeSections.length - 1];

  // Remove a section from the sidebar
  const handleRemoveSection = (key: string) => {
    const updated = activeSections.filter(sectionKey => sectionKey !== key);
    setActiveSections(updated);
    localStorage.setItem('sidebarActiveSections', JSON.stringify(updated));
    // If no sections left, redirect to homepage
    if (updated.length === 0) {
      router.push('/');
    }
  };

  return (
    <div
      className={`relative h-screen border-r border-gray-200 bg-white transition-all duration-300 flex flex-col ${
        collapsed ? 'w-4' : 'w-64'
      }`}
    >
      {/* Toggle Button */}
      <button
        className="absolute -right-3 top-4 z-10 bg-white border border-gray-200 rounded-full shadow p-1 hover:bg-gray-50 transition-colors"
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
      <div className={`transition-all duration-300 flex-1 ${collapsed ? 'opacity-0 pointer-events-none select-none w-0 p-0' : 'opacity-100 w-full p-4'}`}>
        {!collapsed && shownSections.map(section => (
          <div key={section.key} className="mb-6 relative group">
            <div className="flex items-center justify-between mb-2">
              <h2 className={`text-base font-semibold capitalize ${lastActiveKey === section.key ? 'text-blue-600' : 'text-gray-700'}`}>{section.title}</h2>
            </div>
            <nav className="space-y-1">
              {section.items.map(item => {
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.name}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    tabIndex={collapsed ? -1 : 0}
                    aria-hidden={collapsed}
                    onClick={() => openTab({ key: item.href, label: item.name, path: item.href })}
                  >
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
} 