import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { redis } from '@/utils/redis';

// Helper function to create a user-friendly error message
function getErrorMessage(error: any): string {
  if (error.code === 'ENOTFOUND') {
    return 'Unable to connect to AWS DynamoDB. Please check your internet connection and AWS configuration.';
  }
  if (error.code === 'CredentialsProviderError') {
    return 'AWS credentials are missing or invalid. Please check your AWS configuration.';
  }
  if (error.code === 'ResourceNotFoundException') {
    return 'The specified DynamoDB table does not exist. Please check your table name configuration.';
  }
  if (error.code === 'AccessDeniedException') {
    return 'Access denied to DynamoDB. Please check your AWS permissions.';
  }
  return 'An error occurred while fetching orders. Please try again later.';
}

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});
const docClient = DynamoDBDocumentClient.from(client);

// Recursively flatten DynamoDB AttributeValue objects
function fromDynamo(item: any): any {
  if (item == null) return item;
  if (item.S !== undefined) return item.S;
  if (item.N !== undefined) return Number(item.N);
  if (item.BOOL !== undefined) return item.BOOL;
  if (item.NULL) return null;
  if (item.L) return item.L.map(fromDynamo);
  if (item.M) {
    const obj: any = {};
    for (const key in item.M) {
      obj[key] = fromDynamo(item.M[key]);
    }
    return obj;
  }
  return item;
}

interface ShopifyOrder {
  id: string;
  name: string;
  order_number: number;
  created_at: string;
  updated_at: string;
  processed_at: string;
  closed_at: string | null;
  cancelled_at: string | null;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  total_discounts: string;
  currency: string;
  customer: any;
  shipping_address: any;
  billing_address: any;
  line_items: any[];
  fulfillments: any[];
  tags: string[];
  note: string | null;
  email: string;
  phone: string | null;
}

function transformOrder(item: any): ShopifyOrder {
  // Try to find the actual order object
  const orderRaw = item.Item?.M || item.Item || item.M || item;
  const order = fromDynamo(orderRaw);

  return {
    id: order.id,
    name: order.name,
    order_number: order.order_number,
    created_at: order.created_at,
    updated_at: order.updated_at,
    processed_at: order.processed_at,
    closed_at: order.closed_at,
    cancelled_at: order.cancelled_at,
    financial_status: order.financial_status,
    fulfillment_status: order.fulfillment_status,
    total_price: order.total_price,
    subtotal_price: order.subtotal_price,
    total_tax: order.total_tax,
    total_discounts: order.total_discounts,
    currency: order.currency,
    customer: order.customer || null,
    shipping_address: order.shipping_address || null,
    billing_address: order.billing_address || null,
    line_items: order.line_items || [],
    fulfillments: order.fulfillments || [],
    tags: order.tags,
    note: order.note,
    email: order.email,
    phone: order.phone,
  };
}

const CACHE_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
const ALL_ORDERS_CACHE_KEY = 'shopify_orders:all';
const CACHE_LOCK_KEY = 'shopify_orders:lock';
const LOCK_TTL = 300; // 5 minutes in seconds
const PARTIAL_CACHE_KEY = 'shopify_orders:partial';
const LAST_SCAN_POSITION_KEY = 'shopify_orders:last_scan_position';

// Lock mechanism with retry and force release
async function acquireLock(retries = 3, delay = 1000): Promise<boolean> {
  // First check if there's a stale lock
  const lockValue = await redis.get(CACHE_LOCK_KEY);
  if (lockValue) {
    const lockTimestamp = parseInt(lockValue);
    if (Date.now() - lockTimestamp > LOCK_TTL * 1000) {
      console.log('[Debug] Found stale lock, forcing release');
      await releaseLock();
    } else {
      console.log('[Debug] Lock is active, fetch already in progress');
      return false;
    }
  }

  for (let i = 0; i < retries; i++) {
    const timestamp = Date.now().toString();
    const locked = await redis.set(CACHE_LOCK_KEY, timestamp, 'EX', LOCK_TTL, 'NX');
    if (locked === 'OK') {
      console.log('[Debug] Lock acquired successfully');
      return true;
    }
    console.log('[Debug] Lock acquisition attempt', i + 1, 'failed, retrying...');
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  console.log('[Debug] Failed to acquire lock after all retries');
  return false;
}

async function releaseLock(): Promise<void> {
  try {
    await redis.del(CACHE_LOCK_KEY);
    console.log('[Debug] Lock released successfully');
  } catch (error) {
    console.error('[Debug] Error releasing lock:', error);
  }
}

// Function to check if lock is stale
async function isLockStale(): Promise<boolean> {
  try {
    const lockValue = await redis.get(CACHE_LOCK_KEY);
    if (!lockValue) return false;
    
    const lockTimestamp = parseInt(lockValue);
    return Date.now() - lockTimestamp > LOCK_TTL * 1000;
  } catch (error) {
    console.error('[Debug] Error checking lock status:', error);
    return false;
  }
}

// Function to fetch all orders from DynamoDB (no lock logic here)
async function fetchAllOrders() {
  console.log('[Debug] Starting DynamoDB fetch for orders at: ' + new Date().toISOString());
  const startTime = Date.now();
  const allItems: any[] = [];
  let lastEvaluatedKey: any = undefined;
  let scanCount = 0;

  try {
    // Check if we have a last scan position
    const lastScanPosition = await redis.get(LAST_SCAN_POSITION_KEY);
    if (lastScanPosition) {
      console.log('[Debug] Resuming from last scan position');
      lastEvaluatedKey = JSON.parse(lastScanPosition);
      // Get existing partial cache
      const partialData = await redis.get(PARTIAL_CACHE_KEY);
      if (partialData) {
        allItems.push(...JSON.parse(partialData));
        console.log('[Debug] Loaded ' + allItems.length + ' items from partial cache');
      }
    }

    while (true) {
      // Check if lock is stale during long operations
      if (await isLockStale()) {
        console.log('[Debug] Lock became stale during fetch, releasing...');
        await releaseLock();
        throw new Error('Lock became stale during fetch');
      }

      scanCount++;
      console.log('[Debug] DynamoDB Scan #' + scanCount + ' for orders starting...');
      
      const command = new ScanCommand({
        TableName: process.env.SHOPIFY_ORDERS_TABLE,
        Limit: 100, // Reduced from 1000 to 100 for better performance
        ExclusiveStartKey: lastEvaluatedKey,
      });

      const response = await docClient.send(command);
      console.log('DynamoDB response.Items:', response.Items);
      const items = response.Items || [];
      
      console.log('[Debug] DynamoDB Scan #' + scanCount + ' for orders complete. Items fetched: ' + (response.Items?.length || 0));
      
      // Cache partial results as we go
      if (items.length > 0) {
        allItems.push(...items);
        // Only cache every 500 items to reduce Redis operations
        if (allItems.length % 500 === 0) {
          await redis.set(PARTIAL_CACHE_KEY, JSON.stringify(allItems), 'EX', CACHE_TTL);
          console.log('[Debug] Cached ' + allItems.length + ' partial orders');
        }
      }

      lastEvaluatedKey = response.LastEvaluatedKey;
      if (!lastEvaluatedKey) {
        // Clear the last scan position when we're done
        await redis.del(LAST_SCAN_POSITION_KEY);
        // Cache the final result
        await redis.set(ALL_ORDERS_CACHE_KEY, JSON.stringify(allItems), 'EX', CACHE_TTL);
        break;
      }

      // Store the current scan position
      await redis.set(LAST_SCAN_POSITION_KEY, JSON.stringify(lastEvaluatedKey), 'EX', CACHE_TTL);
      console.log('[Debug] Saved scan position for resume');

      // Add a small delay between scans to prevent throttling
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const endTime = Date.now();
    console.log('[Debug] DynamoDB fetch complete:\n' + 
      '- Total items: ' + allItems.length + '\n' +
      '- Time taken: ' + (endTime - startTime) + 'ms\n' +
      '- Scans performed: ' + scanCount);

    return allItems;
  } catch (error) {
    console.error('[Debug] Error during DynamoDB fetch:', error);
    throw error;
  }
}

// Function to get orders from cache or fetch from DB
async function getOrdersFromCache() {
  console.log('[Debug] Checking Valkey cache for orders at: ' + new Date().toISOString());
  const startTime = Date.now();
  
  try {
    // First check for complete cache
    const cachedData = await redis.get(ALL_ORDERS_CACHE_KEY);
    if (cachedData) {
      console.log('[Debug] Cache HIT:\n' +
        '- Total items: ' + cachedData.length + '\n' +
        '- Time taken: ' + (Date.now() - startTime) + 'ms');
      return JSON.parse(cachedData);
    }

    // Then check for partial cache
    const partialData = await redis.get(PARTIAL_CACHE_KEY);
    if (partialData) {
      const parsedPartial = JSON.parse(partialData);
      console.log('[Debug] Partial Cache HIT for orders: ' +
        '- Cache check time: ' + (Date.now() - startTime) + 'ms\n' +
        '- Items in cache: ' + parsedPartial.length + '\n' +
        '- Timestamp: ' + new Date().toISOString()
      );

      // Check if we have a last scan position
      const lastScanPosition = await redis.get(LAST_SCAN_POSITION_KEY);
      if (lastScanPosition) {
        console.log('[Debug] Found last scan position, attempting to trigger background fetch');
        // Try to acquire the lock before starting background fetch
        acquireLock().then(hasLock => {
          if (hasLock) {
            fetchAllOrders()
              .then(async (orders) => {
                // Optionally cache the complete result if finished
                if (orders && orders.length && !(await redis.get(LAST_SCAN_POSITION_KEY))) {
                  await redis.set(ALL_ORDERS_CACHE_KEY, JSON.stringify(orders), 'EX', CACHE_TTL);
                }
              })
              .catch(error => {
                console.error('[Debug] Error in background fetch:', error);
              })
              .finally(() => releaseLock());
          } else {
            console.log('[Debug] Lock could not acquire lock for background fetch, skipping');
          }
        });
      }

      return parsedPartial;
    }

    console.log('[Debug] Cache MISS:\n' +
      '- Time taken: ' + (Date.now() - startTime) + 'ms');

    // Try to acquire lock before fetching
    const hasLock = await acquireLock();
    if (!hasLock) {
      console.log('[Debug] Another process is fetching orders, returning empty array');
      return [];
    }

    try {
      console.log('[Debug] Fetching orders from DynamoDB...');
      const orders = await fetchAllOrders();
      
      console.log('[Debug] Cache population complete:\n' +
        '- Total items: ' + orders.length + '\n' +
        '- Time taken: ' + (Date.now() - startTime) + 'ms');
      
      return orders;
    } finally {
      await releaseLock();
    }
  } catch (error) {
    console.error('[Debug] Error in getOrdersFromCache:', error);
    await releaseLock();
    throw error;
  }
}

// Background refresh function
async function refreshOrdersInBackground() {
  const hasLock = await acquireLock();
  if (!hasLock) {
    console.log('[Debug] Another process is refreshing orders, skipping');
    return;
  }

  try {
    console.log('[Debug] Starting background refresh of orders...');
    const orders = await fetchAllOrders();
    await redis.set(ALL_ORDERS_CACHE_KEY, JSON.stringify(orders), 'EX', CACHE_TTL);
    console.log('[Debug] Background refresh complete');
  } catch (error) {
    console.error('[Debug] Error during background refresh:', error);
  } finally {
    await releaseLock();
  }
}

// Add a function to check if fetching is in progress
async function isFetchingInProgress(): Promise<boolean> {
  const lockValue = await redis.get(CACHE_LOCK_KEY);
  return !!lockValue;
}

// Add a function to force start fetching
async function forceStartFetching(): Promise<void> {
  const hasLock = await acquireLock();
  if (!hasLock) {
    console.log('[Debug] Another process is already fetching');
    return;
  }

  try {
    console.log('[Debug] Force starting fetch from DynamoDB...');
    await fetchAllOrders();
  } finally {
    await releaseLock();
  }
}

export async function GET(req: Request) {
  // Debug: log all headers and query params
  const { searchParams } = new URL(req.url);
  const headers = {};
  req.headers?.forEach?.((value, key) => { headers[key] = value; });
  console.log('[Debug] Incoming GET /api/shopify/orders');
  console.log('[Debug] Query Params:', Object.fromEntries(searchParams.entries()));
  console.log('[Debug] Headers:', headers);
  const requestStart = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 50;
    const lastKey = searchParams.get('lastKey') ? JSON.parse(searchParams.get('lastKey')) : undefined;
    const cacheKey = `shopify_orders:chunk:${lastKey ? Buffer.from(JSON.stringify(lastKey)).toString('base64') : 'start'}:limit:${limit}`;

    // Request metadata
    console.log(`[Debug] --- Incoming GET /api/shopify/orders ---`);
    console.log(`[Debug] Time: ${new Date().toISOString()}`);
    console.log(`[Debug] URL: ${req.url}`);
    console.log(`[Debug] Method: ${req.method}`);
    if ('headers' in req) {
      // @ts-ignore
      console.log(`[Debug] Headers:`, req.headers);
    }
    // IP is not always available in Next.js API routes, but you can log x-forwarded-for if present
    // @ts-ignore
    const ip = req.headers?.get?.('x-forwarded-for') || 'unknown';
    console.log(`[Debug] Client IP: ${ip}`);
    console.log(`[Debug] Params: limit=${limit}, lastKey=${lastKey ? JSON.stringify(lastKey) : 'start'}`);
    console.log(`[Debug] Cache key: ${cacheKey}`);

    // 1. Always try to get all orders from Redis
    const allOrdersRaw = await redis.get(ALL_ORDERS_CACHE_KEY);
    if (allOrdersRaw) {
      const allOrders = JSON.parse(allOrdersRaw);
      let startIndex = 0;
      if (lastKey) {
        startIndex = allOrders.findIndex(order => order.id === lastKey.id) + 1;
      }
      const endIndex = startIndex + limit;
      const paginatedOrders = allOrders.slice(startIndex, endIndex).map(o => o.Item || o);
      const hasMore = endIndex < allOrders.length;
      return NextResponse.json({
        items: paginatedOrders,
        lastEvaluatedKey: hasMore ? paginatedOrders[paginatedOrders.length - 1] : null,
        total: allOrders.length
      });
    }

    // 2. Try cache
    const cacheStart = Date.now();
    const cached = await redis.get(cacheKey);
    const cacheDuration = Date.now() - cacheStart;
    if (cached) {
      console.log(`[Debug] Cache HIT for key: ${cacheKey} (checked in ${cacheDuration}ms, size: ${cached.length} bytes)`);
      console.log(`[Debug] --- Request complete (served from cache) in ${Date.now() - requestStart}ms ---`);
      return NextResponse.json(JSON.parse(cached));
    } else {
      console.log(`[Debug] Cache MISS for key: ${cacheKey} (checked in ${cacheDuration}ms)`);
    }

    // 3. Fetch from DynamoDB
    const dynamoStart = Date.now();
    console.log(`[Debug] Fetching chunk from DynamoDB: limit=${limit}, lastKey=${lastKey ? JSON.stringify(lastKey) : 'start'}`);
    const command = new ScanCommand({
      TableName: process.env.SHOPIFY_ORDERS_TABLE,
      Limit: limit,
      ExclusiveStartKey: lastKey,
    });
    const response = await docClient.send(command);
    const dynamoDuration = Date.now() - dynamoStart;

    // 4. Transform and cache this chunk
    const items = (response.Items || []).map(transformOrder);
    const result = {
      items,
      lastEvaluatedKey: response.LastEvaluatedKey || null,
      total: undefined // (Optional: You can count total separately if needed)
    };
    const resultString = JSON.stringify(result);
    const cacheWriteStart = Date.now();
    await redis.set(cacheKey, resultString, 'EX', 60 * 60 * 24 * 7); // 7 days TTL
    const cacheWriteDuration = Date.now() - cacheWriteStart;

    // Detailed DynamoDB and cache info
    console.log(`[Debug] DynamoDB response:`);
    console.log(`  - Items fetched: ${items.length}`);
    console.log(`  - lastEvaluatedKey: ${result.lastEvaluatedKey ? JSON.stringify(result.lastEvaluatedKey) : 'null'}`);
    console.log(`  - Raw response size: ${JSON.stringify(response).length} bytes`);
    console.log(`[Debug] Cached chunk for key: ${cacheKey} (size: ${resultString.length} bytes, TTL: 7 days, write took ${cacheWriteDuration}ms)`);

    // 5. Return
    console.log(`[Debug] Returning chunk: items=${items.length}, lastEvaluatedKey=${result.lastEvaluatedKey ? JSON.stringify(result.lastEvaluatedKey) : 'null'}`);
    console.log(`[Debug] --- Request complete (DynamoDB+cache) in ${Date.now() - requestStart}ms ---`);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Debug] Error in GET /api/shopify/orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// Add a POST endpoint to invalidate cache
export async function POST(req: Request) {
  try {
    const { action } = await req.json();
    
    if (action === 'invalidate') {
      console.log('[Debug] Manually invalidating orders cache...');
      await redis.del(ALL_ORDERS_CACHE_KEY);
      console.log('[Debug] Orders cache invalidated successfully');
      return NextResponse.json({ message: 'Orders cache invalidated successfully' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Debug] Error occurred while invalidating orders cache:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 