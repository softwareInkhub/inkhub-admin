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
      className="h-screen flex flex-col items-center py-4 bg-[#f8fafc] shadow-lg transition-all duration-300 w-20 justify-between"
      style={{ minWidth: '5rem', borderRight: '1px solid #e5e7eb' }}
    >
      <div className="flex flex-col items-center w-full">
        {/* Company Logo: White Drop on Black Background (smaller) */}
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black shadow mb-8 mt-2">
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 5C16 5 7 16 7 22C7 26.4183 11.0294 30 16 30C20.9706 30 25 26.4183 25 22C25 16 16 5 16 5Z"
              fill="white"
              stroke="white"
              strokeWidth="1"
            />
          </svg>
        </div>
        {/* Icon Navigation */}
        <nav className="flex flex-col gap-4 w-full items-center mt-2">
          {navigation.map((item) => {
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
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors border-2 ${
                    isActive
                      ? 'bg-white border-blue-500 text-blue-600 shadow-md'
                      : 'bg-transparent border-transparent text-gray-400 hover:bg-blue-50 hover:text-blue-500'
                  }`}
                  aria-label={item.name}
                >
                  <item.icon className="h-6 w-6" />
                </button>
                {/* Tooltip */}
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none z-10 shadow-lg">
                  {item.name}
                </span>
              </div>
            );
          })}
        </nav>
      </div>
      {/* Settings Icon at the bottom */}
      <div className="flex flex-col items-center w-full mb-8">
        <div className="relative group w-full flex justify-center">
          <button
            onClick={() => handleIconClick(settingsNav.key)}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors border-2 ${
              activeSection === settingsNav.key ||
              (activeSection === '' && pathname.startsWith('/settings'))
                ? 'bg-white border-blue-500 text-blue-600 shadow-md'
                : 'bg-transparent border-transparent text-gray-400 hover:bg-blue-50 hover:text-blue-500'
            }`}
            aria-label={settingsNav.name}
          >
            <settingsNav.icon className="h-6 w-6" />
          </button>
          {/* Tooltip */}
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none z-10 shadow-lg">
            {settingsNav.name}
          </span>
        </div>
      </div>
    </aside>
  );
} 