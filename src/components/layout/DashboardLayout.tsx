"use client";
import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HomeIcon,
  ShoppingBagIcon,
  PhotoIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  CubeIcon,
  TagIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import SecondarySidebar from './SecondarySidebar';
import { useTabContext } from "@/components/layout/TabContext";
import Sidebar from './Sidebar';
import Cookies from 'js-cookie';

interface NavItem {
  name: string;
  href: string;
  icon: typeof HomeIcon;
}

const navigation: NavItem[] = [
  { name: 'Shopify', href: '/shopify', icon: ShoppingBagIcon },
  { name: 'Pinterest', href: '/pinterest', icon: PhotoIcon },
  { name: 'Design Library', href: '/design-library', icon: PhotoIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

function getSectionFromPath(pathname: string) {
  if (pathname.startsWith('/shopify')) return 'shopify';
  if (pathname.startsWith('/pinterest')) return 'pinterest';
  if (pathname.startsWith('/design-library')) return 'design-library';
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/user-management')) return 'user-management';
  return null;
}

const secondaryNavMap: Record<string, { name: string; href: string }[]> = {
  shopify: [
    { name: 'Orders', href: '/shopify/orders' },
    { name: 'Products', href: '/shopify/products' },
    { name: 'Collections', href: '/shopify/collections' },
  ],
  pinterest: [
    { name: 'Pins', href: '/pinterest/pins' },
    { name: 'Boards', href: '/pinterest/boards' },
  ],
  'design-library': [
    { name: 'Designs', href: '/design-library/designs' },
  ],
  settings: [
    { name: 'General', href: '/settings' },
  ],
  'user-management': [
    { name: 'Register User', href: '/user-management/register' },
    { name: 'Existing User', href: '/user-management/existing' },
  ],
};

// Map the activeTab to the correct analytics key for UniversalAnalyticsBar
function getAnalyticsTabKey(section: string, activeTab: string): string {
  if (!activeTab) return '';
  const tab = activeTab.toLowerCase();
  if (section === 'shopify') {
    if (tab.includes('orders')) return 'orders';
    if (tab.includes('products')) return 'products';
    if (tab.includes('collections')) return 'collections';
  }
  if (section === 'pinterest') {
    if (tab.includes('pins')) return 'pins';
    if (tab.includes('boards')) return 'boards';
  }
  if (section === 'design-library') {
    if (tab.includes('designs')) return 'designs';
  }
  if (section === 'user-management') {
    if (tab.includes('register')) return 'register-user';
    if (tab.includes('existing')) return 'existing-user';
  }
  return '';
}

function getTabIcon(tab) {
  const label = tab.label.toLowerCase();
  if (label.includes('order')) return CubeIcon;
  if (label.includes('product')) return TagIcon;
  if (label.includes('pin')) return PhotoIcon;
  if (label.includes('board')) return BookOpenIcon;
  if (label.includes('design')) return BookOpenIcon;
  if (label.includes('general') || label.includes('setting')) return Cog6ToothIcon;
  if (label.includes('user')) return UserGroupIcon;
  return CubeIcon;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  // Determine section from path
  const defaultSection = getSectionFromPath(pathname) || 'shopify';
  const [selectedSection, setSelectedSection] = useState<string>(defaultSection);

  // Tab context
  const { openTabs, activeTab, setActiveTab, closeTab } = useTabContext();

  useEffect(() => {
    // Update selected section when path changes
    setSelectedSection(getSectionFromPath(pathname) || 'shopify');
  }, [pathname]);

  const handleLogout = () => {
    // Clear all localStorage and sessionStorage for a full cleanup
    localStorage.clear();
    sessionStorage.clear();

    // Remove the session cookie
    Cookies.remove('id_token');
    
    // Redirect to the login page to start a new session
    router.push('/login');
  };

  return (
    <div className="min-h-screen h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="w-full border-b bg-white shadow sticky top-0 z-50 px-6 flex items-center justify-between h-12">
        {/* This div is for spacing, to keep the title centered */}
        <div className="w-1/3"></div>
        <div className="w-1/3 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-black">INKHUB</h1>
        </div>
        <div className="w-1/3 flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-x-2 p-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <ArrowRightOnRectangleIcon
              className="h-6 w-6 text-gray-500"
              aria-hidden="true"
            />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Main Sidebar */}
        <Sidebar onSectionSelect={setSelectedSection} />
        {/* Child Sidebar */}
        <SecondarySidebar section={selectedSection} />
        {/* Main Content */}
        <main className="flex-1 overflow-auto flex flex-col">
          {/* Tab Bar */}
          {openTabs.length > 0 && (
            <>
              <div className="flex items-center bg-white px-4 pt-2 pb-0 space-x-1 sticky top-0 z-30 border-b border-gray-200">
                {openTabs.map(tab => {
                  const isActive = activeTab === tab.key;
                  const Icon = getTabIcon(tab);
                  return (
                    <div
                      key={tab.key}
                      className={`flex items-center px-4 py-2 rounded-t-lg border-b-2 cursor-pointer mr-1 transition-colors text-sm font-medium ${
                        isActive
                          ? 'bg-white border-b-blue-500 text-black font-bold shadow-sm'
                          : 'bg-gray-50 border-b-transparent text-gray-500 hover:bg-gray-100'
                      }`}
                      style={{ marginBottom: "-1px" }}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {/* Icon (dynamic) */}
                      <Icon className={`h-5 w-5 mr-2 ${isActive ? 'text-purple-500' : 'text-gray-300'}`} />
                      <span>{tab.label}</span>
                      <button
                        className="ml-2 text-gray-400 hover:text-red-500 text-lg"
                        onClick={e => {
                          e.stopPropagation();
                          closeTab(tab.key);
                        }}
                        title="Close tab"
                      >
                        &times;
                      </button>
                    </div>
                  );
                })}
              </div>
              {/* Divider below tab bar */}
              <div className="w-full h-px bg-gray-200 mb-2" />
            </>
          )}
          {/* Page content */}
          <div className="flex-1 min-h-0 flex flex-col p-0 m-0 overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 