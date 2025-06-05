import { Suspense } from 'react';
import OrdersClient from './OrdersClient';
import { fetchInitialOrders } from '@/utils/api';

export default async function ShopifyOrdersPage() {
  // Fetch initial data on the server
  const initialData = await fetchInitialOrders();

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