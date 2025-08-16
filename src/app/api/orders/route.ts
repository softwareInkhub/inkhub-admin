import { NextResponse, NextRequest } from 'next/server';

const PAGE_SIZE = 2000;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const key = `orders:page:${page}`;
    console.log(`[API] /api/orders called for page ${page}`);
    // Removed: const data = await redis.get(key);
    // Removed: if (data) {
    // Removed:   console.log(`[API] Found data in Redis for ${key}, length:`, data.length);
    // Removed:   try {
    // Removed:     const orders = JSON.parse(data);
    // Removed:     const hasMore = Array.isArray(orders) && orders.length === PAGE_SIZE;
    // Removed:     console.log(`[API] Parsed orders array, count:`, Array.isArray(orders) ? orders.length : 'not an array', `hasMore: ${hasMore}`);
    // Removed:     return NextResponse.json({ items: orders, page, hasMore });
    // Removed:   } catch (parseError) {
    // Removed:     console.error(`[API] JSON parse error for ${key}:`, parseError);
    // Removed:     return NextResponse.json({ error: 'Failed to parse orders data' }, { status: 500 });
    // Removed:   }
    // Removed: } else {
    // Removed:   console.warn(`[API] No data found in Redis for ${key}`);
    // Removed:   return NextResponse.json({ items: [], page, hasMore: false });
    // Removed: }
    // Placeholder for data fetching logic if Redis is removed
    console.warn(`[API] Redis is not available, fetching data directly. This is a placeholder.`);
    return NextResponse.json({ items: [], page, hasMore: false });
  } catch (error) {
    console.error('[API] Error in /api/orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
} 