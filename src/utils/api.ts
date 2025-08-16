// Helper to get absolute URL for server-side fetches
function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${base}${path}`;
}

export async function fetchInitialOrders() {
  try {
    const response = await fetch(absoluteUrl('/api/orders'), {
      cache: 'no-store' // Ensure we get fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch initial orders');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching initial orders:', error);
    return { items: [], lastEvaluatedKey: null, total: 0 };
  }
} 