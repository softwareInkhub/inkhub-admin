'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

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

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen">
      <div className="p-4">
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