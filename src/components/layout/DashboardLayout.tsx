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
} from '@heroicons/react/24/outline';
import SecondarySidebar from './SecondarySidebar';
import { useTabContext } from "@/components/layout/TabContext";

interface NavItem {
  name: string;
  href: string;
  icon: typeof HomeIcon;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
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
  if (pathname.startsWith('/brhm')) return 'brhm';
  if (pathname.startsWith('/design-library')) return 'design library';
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
  'design library': [
    { name: 'Designs', href: '/design-library/designs' },
  ],
  brhm: [
    { name: 'Dashboard', href: '/brhm/dashboard' },
  ],
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const section = getSectionFromPath(pathname);
  const showSecondarySidebar =
    section === 'shopify' ||
    section === 'pinterest' ||
    section === 'brhm' ||
    section === 'design library';

  // Only show header for main section pages (not subpages)
  const isMainSectionPage =
    pathname === '/' ||
    pathname === '/shopify' ||
    pathname === '/pinterest' ||
    pathname === '/brhm' ||
    pathname === '/design-library' ||
    pathname === '/settings';

  // Responsive sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [secondarySidebarOpen, setSecondarySidebarOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);

  const { openTabs, activeTab, setActiveTab, closeTab } = useTabContext();

  // Close secondary sidebar after navigation
  useEffect(() => {
    setSecondarySidebarOpen(false);
    setSidebarOpen(false);
    setMobileSubmenu(null);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Hamburger for Main Sidebar */}
      <button
        className="fixed top-4 left-4 z-40 md:hidden bg-white border border-gray-200 rounded-lg p-2 shadow"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
        type="button"
      >
        <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      {/* Desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:w-64 md:bg-white md:shadow-lg md:z-20 md:flex md:flex-col">
        <div className="flex h-16 items-center justify-center border-b">
          <h1 className="text-xl font-bold text-primary-600">Inkhub Admin</h1>
        </div>
        <nav className="mt-5 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 flex-shrink-0 ${
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black bg-opacity-30 md:hidden" onClick={() => { setSidebarOpen(false); setMobileSubmenu(null); }} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 flex flex-col md:hidden animate-slide-in">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <h1 className="text-xl font-bold text-primary-600">Inkhub Admin</h1>
              <button onClick={() => { setSidebarOpen(false); setMobileSubmenu(null); }} aria-label="Close sidebar" className="p-2 rounded hover:bg-gray-100">
                <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Main menu or submenu */}
            {!mobileSubmenu ? (
              <nav className="mt-5 px-2">
                {navigation.map((item) => {
                  const sectionKey = getSectionFromPath(item.href);
                  const hasSecondary = !!(sectionKey && secondaryNavMap[sectionKey]);
                  const isActive = pathname === item.href;
                  return (
                    <button
                      key={item.name}
                      className={`w-full text-left group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-primary-100 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => {
                        if (hasSecondary && sectionKey) {
                          setMobileSubmenu(sectionKey);
                        } else {
                          router.push(item.href);
                          setSidebarOpen(false);
                        }
                      }}
                    >
                      <item.icon
                        className={`mr-3 h-6 w-6 flex-shrink-0 ${
                          isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </button>
                  );
                })}
              </nav>
            ) : (
              <>
                <div className="flex items-center gap-2 px-2 py-2 border-b">
                  <button
                    className="p-2 rounded hover:bg-gray-100"
                    onClick={() => setMobileSubmenu(null)}
                    aria-label="Back to main menu"
                  >
                    <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="font-bold text-base capitalize">{mobileSubmenu}</span>
                </div>
                <nav className="mt-2 px-2">
                  {(secondaryNavMap[mobileSubmenu] || []).map((item: { name: string; href: string }) => (
                    <button
                      key={item.name}
                      className={`w-full text-left group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        pathname === item.href
                          ? 'bg-primary-100 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => {
                        router.push(item.href);
                        setSidebarOpen(false);
                        setMobileSubmenu(null);
                      }}
                    >
                      {item.name}
                    </button>
                  ))}
                </nav>
              </>
            )}
          </div>
        </>
      )}

      {/* Secondary Sidebar for Shopify, Pinterest, etc. */}
      {/* Desktop */}
      {showSecondarySidebar && section && (
        <div className="hidden md:fixed md:inset-y-0 md:left-64 md:w-64 md:z-10 md:flex">
          <SecondarySidebar section={section} />
        </div>
      )}
      {/* Mobile Secondary Sidebar Overlay (still available via header button if needed) */}
      {showSecondarySidebar && section && secondarySidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black bg-opacity-30 md:hidden" onClick={() => setSecondarySidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 flex flex-col md:hidden animate-slide-in">
            <SecondarySidebar section={section} />
            <button onClick={() => setSecondarySidebarOpen(false)} aria-label="Close sidebar" className="absolute top-4 right-4 p-2 rounded hover:bg-gray-100">
              <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </>
      )}

      {/* Main content */}
      <div className={
        showSecondarySidebar
          ? 'w-full md:pl-[32rem]'
          : 'w-full md:pl-64'
      }>
        {/* Header */}
        <div className="flex items-center gap-2 md:hidden p-2 bg-white border-b sticky top-0 z-30">
          <button
            className="p-2 rounded hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open main navigation"
          >
            <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {showSecondarySidebar && (
            <button
              className="p-2 rounded hover:bg-gray-100"
              onClick={() => setSecondarySidebarOpen(true)}
              aria-label="Open section navigation"
            >
              <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <span className="font-bold text-lg">{navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}</span>
        </div>
        {isMainSectionPage && (
          <header className="bg-white shadow hidden md:block">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}
              </h1>
            </div>
          </header>
        )}
        {/* Global Tab Bar */}
        <div className="flex-none flex space-x-2 border-b bg-white px-4 pt-4">
          {openTabs.map(tab => (
            <div
              key={tab.key}
              className={`flex items-center px-4 py-2 rounded-t-md border-t border-l border-r border-b-0 cursor-pointer mr-2 bg-gray-50 ${
                activeTab === tab.key ? "border-primary-600 bg-white" : "border-gray-200"
              }`}
              style={{ marginBottom: "-1px" }}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="mr-2">{tab.label}</span>
              <button
                className="ml-1 text-gray-400 hover:text-red-500"
                onClick={e => {
                  e.stopPropagation();
                  closeTab(tab.key);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        {/* Page content */}
        <main className="mx-auto max-w-7xl px-2 sm:px-4 py-4 sm:py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
} 