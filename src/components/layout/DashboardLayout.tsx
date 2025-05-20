"use client";
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ShoppingBagIcon,
  PhotoIcon,
  BookOpenIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import SecondarySidebar from './SecondarySidebar';

interface NavItem {
  name: string;
  href: string;
  icon: typeof HomeIcon;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Shopify', href: '/shopify', icon: ShoppingBagIcon },
  { name: 'Pinterest', href: '/pinterest', icon: PhotoIcon },
  { name: 'BRHM', href: '/brhm', icon: BookOpenIcon },
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

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
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

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-20">
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

      {/* Secondary Sidebar for Shopify */}
      {showSecondarySidebar && section && (
        <div className="fixed inset-y-0 left-64 w-64 z-10">
          <SecondarySidebar section={section} />
        </div>
      )}

      {/* Main content */}
      <div className={showSecondarySidebar ? "pl-[32rem] w-full" : "pl-64 w-full"}>
        {/* Header */}
        {isMainSectionPage && (
          <header className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}
              </h1>
            </div>
          </header>
        )}
        {/* Page content */}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
} 