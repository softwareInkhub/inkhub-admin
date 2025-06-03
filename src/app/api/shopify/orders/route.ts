import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import redis from '@/utils/redis';

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
        Limit: 1000,
        ExclusiveStartKey: lastEvaluatedKey,
      });

      const response = await docClient.send(command);
      const items = response.Items || [];
      
      console.log('[Debug] DynamoDB Scan #' + scanCount + ' for orders complete. Items fetched: ' + (response.Items?.length || 0));
      
      // Cache partial results as we go
      if (items.length > 0) {
        allItems.push(...items);
        await redis.set(PARTIAL_CACHE_KEY, JSON.stringify(allItems), 'EX', CACHE_TTL);
        console.log('[Debug] Cached ' + allItems.length + ' partial orders');
      }

      lastEvaluatedKey = response.LastEvaluatedKey;
      if (!lastEvaluatedKey) {
        // Clear the last scan position when we're done
        await redis.del(LAST_SCAN_POSITION_KEY);
        break;
      }

      // Store the current scan position
      await redis.set(LAST_SCAN_POSITION_KEY, JSON.stringify(lastEvaluatedKey), 'EX', CACHE_TTL);
      console.log('[Debug] Saved scan position for resume');

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
    
    // First, get the total count
    const countCommand = new ScanCommand({
      TableName: process.env.SHOPIFY_ORDERS_TABLE,
      Select: 'COUNT',
    });
    const countResponse = await docClient.send(countCommand);
    const totalCount = countResponse.Count || 0;
    
    // Cache the count
    await redis.set('shopify_orders:count', totalCount.toString(), 'EX', 3600); // 1 hour TTL
    console.log('[Debug] Total count updated:', totalCount);

    // Then fetch and cache the orders
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
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 50;
    const lastKey = searchParams.get('lastKey') ? JSON.parse(searchParams.get('lastKey')!) : undefined;
    const forceRefresh = searchParams.get('forceRefresh') === 'true';
    const forceStart = searchParams.get('forceStart') === 'true';

    console.log('[Debug] Request received:\n' +
      '- Method: ' + req.method + '\n' +
      '- URL: ' + req.url);

    if (forceRefresh) {
      console.log('[Debug] Force refresh requested for orders, clearing cache...');
      await redis.del(ALL_ORDERS_CACHE_KEY);
      await redis.del(PARTIAL_CACHE_KEY);
      await redis.del(LAST_SCAN_POSITION_KEY);
      await redis.del('shopify_orders:count');
      console.log('[Debug] Orders cache cleared');
    }

    if (forceStart) {
      console.log('[Debug] Force start requested for orders...');
      await forceStartFetching();
    }

    // Get the total count
    let totalCount = 0;
    const cachedCount = await redis.get('shopify_orders:count');
    
    if (cachedCount) {
      totalCount = parseInt(cachedCount);
    } else {
      // If no cached count, perform a count operation
      const hasLock = await acquireLock();
      if (hasLock) {
        try {
          console.log('[Debug] Performing count operation on DynamoDB...');
          const countCommand = new ScanCommand({
            TableName: process.env.SHOPIFY_ORDERS_TABLE,
            Select: 'COUNT',
          });
          const countResponse = await docClient.send(countCommand);
          totalCount = countResponse.Count || 0;
          
          // Cache the count with a shorter TTL than the data
          await redis.set('shopify_orders:count', totalCount.toString(), 'EX', 3600); // 1 hour TTL
          console.log('[Debug] Total count cached:', totalCount);
        } catch (error) {
          console.error('[Debug] Error getting total count:', error);
        } finally {
          await releaseLock();
        }
      }
    }

    // Fetch the requested page of orders
    const command = new ScanCommand({
      TableName: process.env.SHOPIFY_ORDERS_TABLE,
      Limit: limit,
      ExclusiveStartKey: lastKey,
    });

    const response = await docClient.send(command);
    const items = response.Items || [];
    const transformedItems = items.map(transformOrder);

    // If this is the first page and we don't have a cached count,
    // trigger a background count operation
    if (!lastKey && !cachedCount) {
      refreshOrdersInBackground().catch(console.error);
    }

    console.log('[Debug] Response prepared:\n' +
      '- Items: ' + transformedItems.length + '\n' +
      '- Has more: ' + !!response.LastEvaluatedKey + '\n' +
      '- Total: ' + totalCount);

    const result = {
      items: transformedItems,
      lastEvaluatedKey: response.LastEvaluatedKey || null,
      total: totalCount
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Debug] Error occurred while fetching orders:', error);
    const errorMessage = getErrorMessage(error);
    return NextResponse.json(
      { error: errorMessage },
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