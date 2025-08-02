import { Suspense } from 'react';
import OrdersClient from './OrdersClient';

export default async function ShopifyOrdersPage() {
  console.log('ShopifyOrdersPage: Starting to render');
  
  // Try to fetch data, but don't fail if it doesn't work
  let initialData = { items: [], lastEvaluatedKey: null, total: 0 };
  
  try {
    console.log('ShopifyOrdersPage: Attempting to fetch data');
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/cache/shopify-orders`, { cache: 'no-store' });
    console.log('ShopifyOrdersPage: API response status:', res.status);
    
    if (res.ok) {
      initialData = await res.json();
      console.log('ShopifyOrdersPage: Data fetched successfully, items count:', initialData.items?.length || 0);
    } else {
      console.error('ShopifyOrdersPage: API response not ok:', res.status, res.statusText);
    }
  } catch (error) {
    console.error('ShopifyOrdersPage: Failed to fetch initial data:', error);
  }

  console.log('ShopifyOrdersPage: Rendering with initialData:', initialData);

  return (
    <div className="h-full">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      }>
        <OrdersClient initialData={initialData} />
      </Suspense>
    </div>
  );
} 