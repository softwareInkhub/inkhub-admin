import { NextResponse } from 'next/server';
import { redis } from '@/utils/redis';

const PAGE_SIZE = 2000;

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const key = `orders:page:${page}`;
    console.log(`[API] /api/orders called for page ${page}`);
    const data = await redis.get(key);
    if (data) {
      console.log(`[API] Found data in Redis for ${key}, length:`, data.length);
      try {
        const orders = JSON.parse(data);
        const hasMore = Array.isArray(orders) && orders.length === PAGE_SIZE;
        console.log(`[API] Parsed orders array, count:`, Array.isArray(orders) ? orders.length : 'not an array', `hasMore: ${hasMore}`);
        return NextResponse.json({ items: orders, page, hasMore });
      } catch (parseError) {
        console.error(`[API] JSON parse error for ${key}:`, parseError);
        return NextResponse.json({ error: 'Failed to parse orders data' }, { status: 500 });
      }
    } else {
      console.warn(`[API] No data found in Redis for ${key}`);
      return NextResponse.json({ items: [], page, hasMore: false });
    }
  } catch (error) {
    console.error('[API] Error in /api/orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
} 