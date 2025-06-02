'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ShoppingBagIcon,
  PencilSquareIcon,
  PhotoIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  onSectionSelect: (section: string) => void;
}

// const navigation = [
//   { name: 'Shopify', href: '/shopify', icon: ShoppingBagIcon },
//   { name: 'Pinterest', href: '/pinterest', icon: PhotoIcon },
//   { name: 'Design Library', href: '/design-library', icon: BookOpenIcon },
// ];

export default function Sidebar({ onSectionSelect }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`bg-white h-screen shadow-lg transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
        {/*
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onSectionSelect(item.name.toLowerCase())}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-6 w-6" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
        */}
      </div>
    </div>
  );
} 