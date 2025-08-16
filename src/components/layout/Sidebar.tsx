'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpenIcon,
  HomeIcon,
  Cog6ToothIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { SiPinterest, SiShopify } from 'react-icons/si';

interface SidebarProps {
  onSectionSelect: (section: string) => void;
}

const navigation = [
  { name: 'Home', key: 'home', icon: HomeIcon },
  { name: 'Shopify', key: 'shopify', icon: SiShopify },
  { name: 'Pinterest', key: 'pinterest', icon: SiPinterest },
  { name: 'Design Library', key: 'design-library', icon: BookOpenIcon },
  { name: 'User Management', key: 'user-management', icon: UserGroupIcon },
];

const settingsNav = { name: 'Settings', key: 'settings', icon: Cog6ToothIcon };

export default function Sidebar({ onSectionSelect }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('');

  const handleIconClick = (section: string) => {
    setActiveSection(section);
    
    // Handle navigation based on section
    if (section === 'home') {
      // Navigate to home page
      router.push('/');
    } else {
      // For other sections, call the onSectionSelect callback
      onSectionSelect(section);
    }
  };

  return (
    <aside
      className="h-screen flex flex-col items-center py-6 bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 shadow-xl transition-all duration-300 w-20 justify-between border-r border-blue-200/50"
      style={{ minWidth: '5rem' }}
    >
      <div className="flex flex-col items-center w-full">
        {/* Company Logo: Enhanced with gradient */}
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 shadow-lg mb-8 mt-2 hover:shadow-xl transition-all duration-300">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 5C16 5 7 16 7 22C7 26.4183 11.0294 30 16 30C20.9706 30 25 26.4183 25 22C25 16 16 5 16 5Z"
              fill="white"
              stroke="white"
              strokeWidth="1"
            />
          </svg>
        </div>
        {/* Icon Navigation */}
        <nav className="flex flex-col gap-5 w-full items-center mt-2">
          {navigation.map((item, idx) => {
            const currentPath = pathname.split('/')[1];
            const isActive =
              activeSection === item.key ||
              (activeSection === '' &&
                (item.key === 'home'
                  ? pathname === '/'
                  : currentPath === item.key));
            return (
              <div key={item.key} className="relative group w-full flex justify-center">
                <button
                  onClick={() => handleIconClick(item.key)}
                  className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 border-2 ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 border-blue-400 text-white shadow-lg scale-110'
                      : 'bg-white/70 border-transparent text-gray-600 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 hover:text-blue-600 hover:shadow-md hover:scale-105'
                  }`}
                  aria-label={item.name}
                >
                  <item.icon className="h-6 w-6" />
                </button>
                {/* Enhanced Tooltip */}
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-4 whitespace-nowrap bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none z-10 shadow-2xl transition-all duration-300">
                  {item.name}
                </span>
              </div>
            );
          })}
          {/* Settings Icon directly below User Management */}
          <div className="relative group w-full flex justify-center mt-2">
          <button
            onClick={() => handleIconClick(settingsNav.key)}
              className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 border-2 ${
              activeSection === settingsNav.key ||
                pathname.startsWith('/settings')
                  ? 'bg-gradient-to-br from-orange-500 to-red-500 border-orange-400 text-white shadow-lg scale-110'
                  : 'bg-white/70 border-transparent text-gray-600 hover:bg-gradient-to-br hover:from-orange-100 hover:to-red-100 hover:text-orange-600 hover:shadow-md hover:scale-105'
            }`}
            aria-label={settingsNav.name}
          >
            <settingsNav.icon className="h-6 w-6" />
          </button>
            {/* Enhanced Tooltip */}
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-4 whitespace-nowrap bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 pointer-events-none z-10 shadow-2xl transition-all duration-300">
            {settingsNav.name}
          </span>
        </div>
        </nav>
      </div>
    </aside>
  );
} 