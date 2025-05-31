import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import Redis from 'ioredis';

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
  return 'An error occurred while fetching pins. Please try again later.';
}

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});
const docClient = DynamoDBDocumentClient.from(client);
const redis = new Redis({ host: 'localhost', port: 6379 });

const CACHE_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
const ALL_PINS_CACHE_KEY = 'pinterest_pins:all';
const CACHE_LOCK_KEY = 'pinterest_pins:lock';
const LOCK_TTL = 300; // 5 minutes in seconds
const PARTIAL_CACHE_KEY = 'pinterest_pins:partial';
const LAST_SCAN_POSITION_KEY = 'pinterest_pins:last_scan_position';

// Lock mechanism with retry and force release
async function acquireLock(retries = 3, delay = 1000): Promise<boolean> {
  // First check if there's a stale lock
  const lockValue = await redis.get(CACHE_LOCK_KEY);
  if (lockValue) {
    const lockTimestamp = parseInt(lockValue);
    if (Date.now() - lockTimestamp > LOCK_TTL * 1000) {
      console.log('[Debug] 🔒 Found stale lock, forcing release');
      await releaseLock();
    }
  }

  for (let i = 0; i < retries; i++) {
    const timestamp = Date.now().toString();
    const locked = await redis.set(CACHE_LOCK_KEY, timestamp, 'NX', 'EX', LOCK_TTL);
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

// Function to check if lock is stale
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

// Function to fetch all pins from DynamoDB (no lock logic here)
async function fetchAllPins() {
  console.log('[Debug] 🚀 Starting DynamoDB fetch for pins at:', new Date().toISOString());
  const startTime = Date.now();
  const allItems: any[] = [];
  let lastEvaluatedKey: any = undefined;
  let scanCount = 0;

  try {
    // Check if we have a last scan position
    const lastScanPosition = await redis.get(LAST_SCAN_POSITION_KEY);
    if (lastScanPosition) {
      console.log('[Debug] 🔄 Resuming from last scan position');
      lastEvaluatedKey = JSON.parse(lastScanPosition);
      // Get existing partial cache
      const partialData = await redis.get(PARTIAL_CACHE_KEY);
      if (partialData) {
        allItems.push(...JSON.parse(partialData));
        console.log(`[Debug] 📦 Loaded ${allItems.length} items from partial cache`);
      }
    }

    while (true) {
      // Check if lock is stale during long operations
      if (await isLockStale()) {
        console.log('[Debug] 🔒 Lock became stale during fetch, releasing...');
        await releaseLock();
        throw new Error('Lock became stale during fetch');
      }

      scanCount++;
      console.log(`[Debug] 📊 DynamoDB Scan #${scanCount} for pins starting...`);
      
      const command = new ScanCommand({
        TableName: process.env.PINTEREST_PINS_TABLE,
        Limit: 1000,
        ExclusiveStartKey: lastEvaluatedKey,
      });

      const response = await docClient.send(command);
      const items = response.Items || [];
      
      console.log(`[Debug] 📊 DynamoDB Scan #${scanCount} for pins complete. Items fetched: ${items.length}`);
      
      // Cache partial results as we go
      if (items.length > 0) {
        allItems.push(...items);
        await redis.set(PARTIAL_CACHE_KEY, JSON.stringify(allItems), 'EX', CACHE_TTL);
        console.log(`[Debug] 💾 Cached ${allItems.length} partial pins`);
      }

      lastEvaluatedKey = response.LastEvaluatedKey;
      if (!lastEvaluatedKey) {
        // Clear the last scan position when we're done
        await redis.del(LAST_SCAN_POSITION_KEY);
        break;
      }

      // Store the current scan position
      await redis.set(LAST_SCAN_POSITION_KEY, JSON.stringify(lastEvaluatedKey), 'EX', CACHE_TTL);
      console.log('[Debug] 📍 Saved scan position for resume');

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const endTime = Date.now();
    console.log(`[Debug] ✅ DynamoDB fetch for pins complete:
      - Total time: ${endTime - startTime}ms
      - Total items: ${allItems.length}
      - Number of scans: ${scanCount}
      - Timestamp: ${new Date().toISOString()}
    `);

    return allItems;
  } catch (error) {
    console.error('[Debug] ❌ Error during DynamoDB fetch:', error);
    throw error;
  }
}

// Function to get pins from cache or fetch from DB
async function getPinsFromCache() {
  console.log('[Debug] 🔍 Checking Valkey cache for pins at:', new Date().toISOString());
  const startTime = Date.now();
  
  try {
    // First check for complete cache
    const cachedData = await redis.get(ALL_PINS_CACHE_KEY);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      console.log(`[Debug] 🎯 Complete Cache HIT for pins:
        - Cache check time: ${Date.now() - startTime}ms
        - Items in cache: ${parsedData.length}
        - Timestamp: ${new Date().toISOString()}
      `);
      return parsedData;
    }

    // Then check for partial cache
    const partialData = await redis.get(PARTIAL_CACHE_KEY);
    if (partialData) {
      const parsedPartial = JSON.parse(partialData);
      console.log(`[Debug] 🎯 Partial Cache HIT for pins:
        - Cache check time: ${Date.now() - startTime}ms
        - Items in cache: ${parsedPartial.length}
        - Timestamp: ${new Date().toISOString()}
      `);

      // Check if we have a last scan position
      const lastScanPosition = await redis.get(LAST_SCAN_POSITION_KEY);
      if (lastScanPosition) {
        console.log('[Debug] 🔄 Found last scan position, attempting to trigger background fetch');
        // Try to acquire the lock before starting background fetch
        acquireLock().then(hasLock => {
          if (hasLock) {
            fetchAllPins()
              .then(async (pins) => {
                if (pins && pins.length && !(await redis.get(LAST_SCAN_POSITION_KEY))) {
                  await redis.set(ALL_PINS_CACHE_KEY, JSON.stringify(pins), 'EX', CACHE_TTL);
                }
              })
              .catch(error => {
                console.error('[Debug] ❌ Error in background fetch:', error);
              })
              .finally(() => releaseLock());
          } else {
            console.log('[Debug] 🔒 Could not acquire lock for background fetch, skipping');
          }
        });
      }

      return parsedPartial;
    }

    console.log(`[Debug] ❌ Cache MISS for pins:
      - Cache check time: ${Date.now() - startTime}ms
      - Timestamp: ${new Date().toISOString()}
    `);

    // Try to acquire lock before fetching
    const hasLock = await acquireLock();
    if (!hasLock) {
      console.log('[Debug] 🔒 Another process is fetching pins, returning empty array');
      return [];
    }

    try {
      console.log('[Debug] 🚀 Fetching pins from DynamoDB...');
      const pins = await fetchAllPins();
      
      console.log('[Debug] 💾 Caching complete pins in Valkey...');
      const cacheStartTime = Date.now();
      await redis.set(ALL_PINS_CACHE_KEY, JSON.stringify(pins), 'EX', CACHE_TTL);
      const cacheEndTime = Date.now();
      
      console.log(`[Debug] ✅ Cache population for pins complete:
        - Cache time: ${cacheEndTime - cacheStartTime}ms
        - Items cached: ${pins.length}
        - TTL: ${CACHE_TTL} seconds
        - Timestamp: ${new Date().toISOString()}
      `);
      
      return pins;
    } finally {
      await releaseLock();
    }
  } catch (error) {
    console.error('[Debug] ❌ Error in getPinsFromCache:', error);
    await releaseLock();
    throw error;
  }
}

// Background refresh function
async function refreshPinsInBackground() {
  const hasLock = await acquireLock();
  if (!hasLock) {
    console.log('[Debug] 🔒 Another process is refreshing pins, skipping');
    return;
  }

  try {
    console.log('[Debug] 🔄 Starting background refresh of pins...');
    const pins = await fetchAllPins();
    await redis.set(ALL_PINS_CACHE_KEY, JSON.stringify(pins), 'EX', CACHE_TTL);
    console.log('[Debug] ✅ Background refresh complete');
  } catch (error) {
    console.error('[Debug] ❌ Error during background refresh:', error);
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
    console.log('[Debug] 🔒 Another process is already fetching');
    return;
  }

  try {
    console.log('[Debug] 🚀 Force starting fetch from DynamoDB...');
    await fetchAllPins();
  } finally {
    await releaseLock();
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 500;
    const lastKey = searchParams.get('lastKey') ? JSON.parse(searchParams.get('lastKey')!) : undefined;
    const forceRefresh = searchParams.get('forceRefresh') === 'true';
    const forceStart = searchParams.get('forceStart') === 'true';

    console.log(`[Debug] 📥 Pins request received:
      - Limit: ${limit}
      - Force Refresh: ${forceRefresh}
      - Force Start: ${forceStart}
      - Last Key: ${lastKey ? 'Present' : 'None'}
      - Timestamp: ${new Date().toISOString()}
    `);

    if (forceRefresh) {
      console.log('[Debug] 🔄 Force refresh requested for pins, clearing cache...');
      await redis.del(ALL_PINS_CACHE_KEY);
      await redis.del(PARTIAL_CACHE_KEY);
      await redis.del(LAST_SCAN_POSITION_KEY);
      console.log('[Debug] ✅ Pins cache cleared');
    }

    if (forceStart) {
      console.log('[Debug] 🚀 Force start requested for pins...');
      await forceStartFetching();
    }

    // Get pins from cache or start fetching
    const allPins = await getPinsFromCache();

    // If we got empty array (cache miss and couldn't acquire lock),
    // trigger background refresh and return empty result
    if (allPins.length === 0) {
      refreshPinsInBackground().catch(console.error);
      return NextResponse.json({ items: [], lastEvaluatedKey: null, total: 0 });
    }

    // Handle pagination
    const startIndex = lastKey ? allPins.findIndex((p: any) => p.id === lastKey.id) + 1 : 0;
    const endIndex = startIndex + limit;
    const paginatedPins = allPins.slice(startIndex, endIndex);
    const hasMore = endIndex < allPins.length;

    console.log(`[Debug] 📤 Pins response prepared:
      - Total items: ${allPins.length}
      - Paginated items: ${paginatedPins.length}
      - Has more: ${hasMore}
      - Start index: ${startIndex}
      - End index: ${endIndex}
      - Timestamp: ${new Date().toISOString()}
    `);

    const result = {
      items: paginatedPins,
      lastEvaluatedKey: hasMore ? paginatedPins[paginatedPins.length - 1] : null,
      total: allPins.length
    };
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Debug] ❌ Error occurred while fetching pins:', error);
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
      console.log('[Debug] 🔄 Manually invalidating pins cache...');
      await redis.del(ALL_PINS_CACHE_KEY);
      console.log('[Debug] ✅ Pins cache invalidated successfully');
      return NextResponse.json({ message: 'Pins cache invalidated successfully' });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Debug] ❌ Error occurred while invalidating pins cache:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 