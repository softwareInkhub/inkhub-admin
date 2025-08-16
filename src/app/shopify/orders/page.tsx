import { Suspense } from 'react';
import OrdersClient from './OrdersClient';

export default async function ShopifyOrdersPage() {
  // Fetch initial data from the new cache API route
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/cache/shopify-orders`, { cache: 'no-store' });
  const initialData = await res.json();

  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    }>
      <OrdersClient initialData={initialData} />
    </Suspense>
  );
} 