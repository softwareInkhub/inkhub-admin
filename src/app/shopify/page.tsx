import { redirect } from 'next/navigation';

export default function ShopifyIndexRedirect() {
  redirect('/shopify/orders');
  return null;
} 