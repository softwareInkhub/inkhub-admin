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
  return 'An error occurred while fetching products. Please try again later.';
}

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});
const docClient = DynamoDBDocumentClient.from(client);

interface ShopifyProduct {
  id: string;
  title: string;
  body_html: string;
  handle: string;
  vendor: string;
  product_type: string;
  tags: string[];
  status: string;
  published_scope: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  image: any;
  images: any[];
  variants: any[];
  options: any[];
  template_suffix: string;
  admin_graphql_api_id: string;
}

function transformProduct(item: any) {
  const product = item.Item || {};
  return {
    id: product.id,
    title: product.title,
    body_html: product.body_html,
    handle: product.handle,
    vendor: product.vendor,
    product_type: product.product_type,
    tags: product.tags,
    status: product.status,
    published_scope: product.published_scope,
    published_at: product.published_at,
    created_at: product.created_at,
    updated_at: product.updated_at,
    image: product.image,
    images: product.images || [],
    variants: product.variants || [],
    options: product.options || [],
    template_suffix: product.template_suffix,
    admin_graphql_api_id: product.admin_graphql_api_id,
  };
}

const CACHE_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
const ALL_PRODUCTS_CACHE_KEY = 'shopify_products:all';
const CACHE_LOCK_KEY = 'shopify_products:lock';
const LOCK_TTL = 300; // 5 minutes in seconds
const PARTIAL_CACHE_KEY = 'shopify_products:partial';
const LAST_SCAN_POSITION_KEY = 'shopify_products:last_scan_position';

// Lock mechanism with retry and force release
async function acquireLock(retries = 3, delay = 1000): Promise<boolean> {
  const lockValue = await redis.get(CACHE_LOCK_KEY);
  if (lockValue) {
    const lockTimestamp = parseInt(lockValue);
    if (Date.now() - lockTimestamp > LOCK_TTL * 1000) {
      console.log('[Debug] 🔒 Found stale lock, forcing release');
      await releaseLock();
    } else {
      console.log('[Debug] 🔒 Lock is active, fetch already in progress');
      return false;
    }
  }
  for (let i = 0; i < retries; i++) {
    const timestamp = Date.now().toString();
    const locked = await redis.set(CACHE_LOCK_KEY, timestamp, 'EX', LOCK_TTL, 'NX');
    if (locked === 'OK') {
      console.log('[Debug] 🔒 Lock acquired successfully');
      return true;
    }
    console.log(`[Debug] 🔒 Lock acquisition attempt ${i + 1} failed, retrying...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  console.log('[Debug] 🔒 Failed to acquire lock after all retries');
  return false;
}

async function releaseLock(): Promise<void> {
  try {
    await redis.del(CACHE_LOCK_KEY);
    console.log('[Debug] 🔓 Lock released successfully');
  } catch (error) {
    console.error('[Debug] ❌ Error releasing lock:', error);
  }
}

async function isLockStale(): Promise<boolean> {
  try {
    const lockValue = await redis.get(CACHE_LOCK_KEY);
    if (!lockValue) return false;
    const lockTimestamp = parseInt(lockValue);
    return Date.now() - lockTimestamp > LOCK_TTL * 1000;
  } catch (error) {
    console.error('[Debug] ❌ Error checking lock status:', error);
    return false;
  }
}

// Function to fetch all products from DynamoDB (no lock logic here)
async function fetchAllProducts() {
  console.log('[Debug] 🚀 Starting DynamoDB fetch at:', new Date().toISOString());
  const startTime = Date.now();
  const allItems: any[] = [];
  let lastEvaluatedKey: any = undefined;
  let scanCount = 0;

  do {
    scanCount++;
    console.log(`[Debug] 📊 DynamoDB Scan #${scanCount} starting...`);
    const command = new ScanCommand({
      TableName: process.env.SHOPIFY_PRODUCTS_TABLE,
      Limit: 1000, // Maximum allowed by DynamoDB
      ExclusiveStartKey: lastEvaluatedKey,
    });
    const response = await docClient.send(command);
    allItems.push(...(response.Items || []));
    lastEvaluatedKey = response.LastEvaluatedKey;
    console.log(`[Debug] 📊 DynamoDB Scan #${scanCount} complete. Items fetched: ${response.Items?.length || 0}`);
  } while (lastEvaluatedKey);

  const endTime = Date.now();
  console.log(`[Debug] ✅ DynamoDB fetch complete:
    - Total time: ${endTime - startTime}ms
    - Total items: ${allItems.length}
    - Number of scans: ${scanCount}
    - Timestamp: ${new Date().toISOString()}
  `);

  return allItems.map(transformProduct);
}

// Function to get products from cache or fetch from DB
async function getProductsFromCache() {
  console.log('[Debug] 🔍 Checking Valkey cache at:', new Date().toISOString());
  const startTime = Date.now();
  try {
    const cachedData = await redis.get(ALL_PRODUCTS_CACHE_KEY);
    const endTime = Date.now();
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      console.log(`[Debug] 🎯 Cache HIT:
        - Cache check time: ${endTime - startTime}ms
        - Items in cache: ${parsedData.length}
        - Timestamp: ${new Date().toISOString()}
      `);
      return parsedData;
    }
    console.log(`[Debug] ❌ Cache MISS:
      - Cache check time: ${endTime - startTime}ms
      - Timestamp: ${new Date().toISOString()}
    `);
    // Try to acquire lock before fetching
    const hasLock = await acquireLock();
    if (!hasLock) {
      console.log('[Debug] 🔒 Another process is fetching products, returning empty array');
      return [];
    }
    try {
      console.log('[Debug] 🚀 Fetching from DynamoDB...');
      const products = await fetchAllProducts();
      console.log('[Debug] 💾 Caching products in Valkey...');
      const cacheStartTime = Date.now();
      await redis.set(ALL_PRODUCTS_CACHE_KEY, JSON.stringify(products), 'EX', CACHE_TTL);
      const cacheEndTime = Date.now();
      console.log(`[Debug] ✅ Cache population complete:
        - Cache time: ${cacheEndTime - cacheStartTime}ms
        - Items cached: ${products.length}
        - TTL: ${CACHE_TTL} seconds
        - Timestamp: ${new Date().toISOString()}
      `);
      return products;
    } finally {
      await releaseLock();
    }
  } catch (error) {
    console.error('[Debug] ❌ Error in getProductsFromCache:', error);
    await releaseLock();
    throw error;
  }
}

// Background refresh function
async function refreshProductsInBackground() {
  const hasLock = await acquireLock();
  if (!hasLock) {
    console.log('[Debug] 🔒 Another process is refreshing products, skipping');
    return;
  }
  try {
    console.log('[Debug] 🔄 Starting background refresh of products...');
    const products = await fetchAllProducts();
    await redis.set(ALL_PRODUCTS_CACHE_KEY, JSON.stringify(products), 'EX', CACHE_TTL);
    console.log('[Debug] ✅ Background refresh complete');
  } catch (error) {
    console.error('[Debug] ❌ Error during background refresh:', error);
  } finally {
    await releaseLock();
  }
}

// Add a function to force start fetching
async function forceStartFetching(): Promise<void> {
  const hasLock = await acquireLock();
  if (!hasLock) {
    console.log('[Debug] 🔒 Another process is already fetching');
    return;
  }
  try {
    console.log('[Debug] 🚀 Force starting fetch from DynamoDB...');
    await fetchAllProducts();
  } finally {
    await releaseLock();
  }
}

export async function GET(req: Request) {
  console.log('⚠️ Direct API: /api/shopify/products called (this should NOT be called)');
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 500;
    const lastKey = searchParams.get('lastKey') ? JSON.parse(searchParams.get('lastKey')!) : undefined;
    const forceRefresh = searchParams.get('forceRefresh') === 'true';
    const forceStart = searchParams.get('forceStart') === 'true';

    console.log(`[Debug] 📥 Request received:
      - Limit: ${limit}
      - Force Refresh: ${forceRefresh}
      - Force Start: ${forceStart}
      - Last Key: ${lastKey ? 'Present' : 'None'}
      - Timestamp: ${new Date().toISOString()}
    `);

    if (forceRefresh) {
      console.log('[Debug] 🔄 Force refresh requested, clearing cache...');
      await redis.del(ALL_PRODUCTS_CACHE_KEY);
      console.log('[Debug] ✅ Cache cleared');
    }
    if (forceStart) {
      console.log('[Debug] 🚀 Force start requested for products...');
      await forceStartFetching();
    }
    // Get all products from cache or DB
    let products = await getProductsFromCache();
    // Ensure products are always flat
    if (products && products.length && products[0]?.Item) {
      products = products.map(transformProduct);
    }
    // If we got empty array (cache miss and couldn't acquire lock),
    // trigger background refresh and return empty result
    if (products.length === 0) {
      refreshProductsInBackground().catch(console.error);
      return NextResponse.json({ items: [], lastEvaluatedKey: null, total: 0 });
    }
    // Handle pagination
    const startIndex = lastKey ? products.findIndex((p: ShopifyProduct) => p.id === lastKey.id) + 1 : 0;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);
    const hasMore = endIndex < products.length;
    console.log(`[Debug] 📤 Response prepared:
      - Total items: ${products.length}
      - Paginated items: ${paginatedProducts.length}
      - Has more: ${hasMore}
      - Start index: ${startIndex}
      - End index: ${endIndex}
      - Timestamp: ${new Date().toISOString()}
    `);
    const result = {
      items: paginatedProducts,
      lastEvaluatedKey: hasMore ? paginatedProducts[paginatedProducts.length - 1] : null,
      total: products.length
    };
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Debug] ❌ Error occurred:', error);
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
      await redis.del(ALL_PRODUCTS_CACHE_KEY);
      return NextResponse.json({ message: 'Cache invalidated successfully' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}