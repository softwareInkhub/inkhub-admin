'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTabContext } from "@/components/layout/TabContext";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

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
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function SecondarySidebar({ section, onCollapseChange }: SecondarySidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { openTab } = useTabContext();
  // Track expanded sections by key
  const [expandedSections, setExpandedSections] = useState<string[]>(sidebarConfig.map(s => s.key));

  // Notify parent when collapsed changes
  useEffect(() => {
    if (onCollapseChange) onCollapseChange(collapsed);
  }, [collapsed, onCollapseChange]);

  // Toggle section expand/collapse
  const handleSectionToggle = (key: string) => {
    setExpandedSections(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  return (
    <div
      className={`relative h-full border-r border-gray-200 bg-white transition-all duration-300 flex flex-col ${
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
        {!collapsed && sidebarConfig.map(section => {
          const isExpanded = expandedSections.includes(section.key);
          return (
            <div key={section.key} className="mb-6 relative group">
              <button
                className="flex items-center justify-between w-full mb-2 text-base font-semibold capitalize text-gray-700 hover:bg-gray-100 rounded px-2 py-1 transition-colors"
                onClick={() => handleSectionToggle(section.key)}
                aria-expanded={isExpanded}
                aria-controls={`section-items-${section.key}`}
                type="button"
              >
                <span>{section.title}</span>
                {isExpanded ? (
                  <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                )}
              </button>
              {isExpanded && (
                <nav className="space-y-1" id={`section-items-${section.key}`}> 
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 