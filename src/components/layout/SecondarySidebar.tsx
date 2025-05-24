'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SecondarySidebarProps {
  section: string;
}

const subNavigation = {
  shopify: [
    { name: 'Orders', href: '/shopify/orders' },
    { name: 'Products', href: '/shopify/products' },
    { name: 'Collections', href: '/shopify/collections' },
  ],
  pinterest: [
    { name: 'Pins', href: '/pinterest/pins' },
    { name: 'Boards', href: '/pinterest/boards' },
  ],
  'design library': [
    { name: 'Designs', href: '/design-library/designs' },
  ],
  brhm: [
    { name: 'Dashboard', href: '/brhm/dashboard' },
  ],
};

export default function SecondarySidebar({ section }: SecondarySidebarProps) {
  const pathname = usePathname();
  const items = subNavigation[section as keyof typeof subNavigation] || [];
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`relative h-screen border-r border-gray-200 bg-white transition-all duration-300 flex flex-col ${
        collapsed ? 'w-12' : 'w-64'
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
      <div className={`p-4 transition-opacity duration-200 ${collapsed ? 'opacity-0 pointer-events-none select-none' : 'opacity-100'}`}>
        <h2 className="text-lg font-semibold mb-4 capitalize">{section}</h2>
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                tabIndex={collapsed ? -1 : 0}
                aria-hidden={collapsed}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 