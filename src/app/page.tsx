'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import SecondarySidebar from '@/components/layout/SecondarySidebar';
import { usePathname } from 'next/navigation';
import {
  ShoppingBagIcon,
  PhotoIcon,
  BookOpenIcon,
  PhotoIcon as DesignIcon,
} from '@heroicons/react/24/outline';

const stats = [
  {
    name: 'Shopify Orders',
    value: '0',
    icon: ShoppingBagIcon,
    href: '/shopify',
  },
  {
    name: 'Pinterest Pins',
    value: '0',
    icon: PhotoIcon,
    href: '/pinterest',
  },
  {
    name: 'BRHM Books',
    value: '0',
    icon: BookOpenIcon,
    href: '/brhm',
  },
  {
    name: 'Design Library',
    value: '0',
    icon: DesignIcon,
    href: '/design-library',
  },
];

export default function Home() {
  const [isSecondarySidebarOpen, setIsSecondarySidebarOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const pathname = usePathname();

  const handleSectionSelect = (section: string) => {
    setSelectedSection(section);
    setIsSecondarySidebarOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onSectionSelect={handleSectionSelect} />
      {isSecondarySidebarOpen && selectedSection && (
        <SecondarySidebar section={selectedSection} />
      )}
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <a
                key={stat.name}
                href={stat.href}
                className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow hover:shadow-md transition-shadow"
              >
                <dt>
                  <div className="absolute rounded-md bg-primary-500 p-3">
                    <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
                </dt>
                <dd className="ml-16 flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </dd>
              </a>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <div className="mt-4 rounded-lg bg-white shadow">
              <div className="p-6">
                <p className="text-gray-500">No recent activity to display.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
