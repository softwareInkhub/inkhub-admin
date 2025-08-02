'use client';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Palette, 
  Settings, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Home,
  BarChart3,
  Bell,
  MessageSquare,
  Sun,
  Moon
} from 'lucide-react';
import PinterestLogo from '../icons/PinterestLogo';
import ShopifyLogo from '../icons/ShopifyLogo';

interface SidebarProps {
  activeTab?: string;
  onNavClick?: (section: string) => void;
}

export default function Sidebar({ activeTab, onNavClick }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const mainNavItems = [
    { name: 'Dashboard', icon: <Home size={20} />, href: '/' },
    { name: 'Shopify', icon: <ShopifyLogo size={20} />, href: '/shopify' },
    { name: 'Pinterest', icon: <PinterestLogo size={20} />, href: '/pinterest' },
    { name: 'Design Library', icon: <Palette size={20} />, href: '/design-library' },
    { name: 'Settings', icon: <Settings size={20} />, href: '/settings' },
    { name: 'User Management', icon: <Users size={20} />, href: '/user-management' },
  ];

  const handleMainNavClick = (item: any) => {
    const section = item.name.toLowerCase().replace(' ', '-');
    console.log('Main sidebar item clicked:', item.name, 'section:', section);
    onNavClick?.(section);
    router.push(item.href);
  };

  const getActiveSidebarTab = () => {
    if (pathname === '/') return 'dashboard';
    if (pathname.startsWith('/shopify')) return 'shopify';
    if (pathname.startsWith('/pinterest')) return 'pinterest';
    if (pathname.startsWith('/design-library')) return 'design-library';
    if (pathname.startsWith('/settings')) return 'settings';
    if (pathname.startsWith('/user-management')) return 'user-management';
    return '';
  };

  const currentActiveTab = getActiveSidebarTab();

  return (
    <aside className={`sticky left-0 top-0 h-screen z-30 flex flex-col items-center sidebar-modern transition-all duration-300 ease-in-out ${
      isExpanded ? 'w-64' : 'w-16'
    } py-4`}>
      {/* Logo/Brand Section */}
      <div className="flex items-center justify-center w-full px-4 mb-8">
        {isExpanded ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">BRMH</span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <BarChart3 size={20} className="text-white" />
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 w-full px-2">
        <ul className="space-y-2">
          {mainNavItems.map((item) => {
            const isActive = currentActiveTab === item.name.toLowerCase().replace(' ', '-');
            
            return (
              <li key={item.name}>
                <button
                  onClick={() => handleMainNavClick(item)}
                  className={`w-full flex items-center px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {isExpanded && <span className="ml-3">{item.name}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="w-full px-2">
        {/* Theme Toggle */}
        <div className="flex items-center justify-center mb-4">
          <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Sun size={16} />
          </button>
        </div>

        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </aside>
  );
} 