import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { redis } from '@/utils/redis';
import { getPriorityList, setLastKey, getLastKey, clearProgress, setLiveProgress } from '@/utils/cacheProgress';

// --- Helper Functions (copy or adapt from each resource route) ---

function getErrorMessage(error: any, resource: string): string {
  if (error.code === 'ENOTFOUND') {
    return `Unable to connect to AWS DynamoDB for ${resource}.`;
  }
  if (error.code === 'CredentialsProviderError') {
    return `AWS credentials are missing or invalid for ${resource}.`;
  }
  if (error.code === 'ResourceNotFoundException') {
    return `The specified DynamoDB table for ${resource} does not exist.`;
  }
  if (error.code === 'AccessDeniedException') {
    return `Access denied to DynamoDB for ${resource}.`;
  }
  return `An error occurred while fetching ${resource}.`;
}

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});
const docClient = DynamoDBDocumentClient.from(client);

// --- Resource Config ---
const resources = [
  {
    key: 'orders',
    table: process.env.SHOPIFY_ORDERS_TABLE,
    cacheKey: 'shopify_orders:all',
    partialKey: 'shopify_orders:partial',
    lastScanKey: 'shopify_orders:last_scan_position',
    lockKey: 'shopify_orders:lock',
    ttl: 7 * 24 * 60 * 60,
    limit: 2000,
  },
  {
    key: 'products',
    table: process.env.SHOPIFY_PRODUCTS_TABLE,
    cacheKey: 'shopify_products:all',
    partialKey: 'shopify_products:partial',
    lastScanKey: 'shopify_products:last_scan_position',
    lockKey: 'shopify_products:lock',
    ttl: 7 * 24 * 60 * 60,
    limit: 100,
  },
  {
    key: 'pins',
    table: process.env.PINTEREST_PINS_TABLE,
    cacheKey: 'pinterest_pins:all',
    partialKey: 'pinterest_pins:partial',
    lastScanKey: 'pinterest_pins:last_scan_position',
    lockKey: 'pinterest_pins:lock',
    ttl: 7 * 24 * 60 * 60,
    limit: 1000,
  },
  {
    key: 'boards',
    table: process.env.PINTEREST_BOARDS_TABLE,
    cacheKey: 'pinterest_boards:all',
    partialKey: 'pinterest_boards:partial',
    lastScanKey: 'pinterest_boards:last_scan_position',
    lockKey: 'pinterest_boards:lock',
    ttl: 7 * 24 * 60 * 60,
    limit: 1000,
  },
  {
    key: 'designs',
    table: process.env.DESIGN_TABLE,
    cacheKey: 'design_library:all',
    partialKey: 'design_library:partial',
    lastScanKey: 'design_library:last_scan_position',
    lockKey: 'design_library:lock',
    ttl: 6 * 60 * 60,
    limit: 1000,
  },
];

async function fetchResourceBatched(resource: any) {
  let status = 'Fetching...';
  let progress = 0;
  let totalCount = 0;
  let error = null;
  let lastEvaluatedKey = await getLastKey(resource.key);
  let page = 1;
  try {
    // Try full cache
    const cached = await redis.get(resource.cacheKey);
    if (cached) {
      const cachedItems = JSON.parse(cached);
      status = 'Complete';
      progress = 100;
      await setLiveProgress(resource.key, { status, progress, count: cachedItems.length, page, error });
      return { status, progress, items: cachedItems, error };
    }
    // Try partial cache
    const partial = await redis.get(resource.partialKey);
    if (partial) {
      const partialItems = JSON.parse(partial);
      status = 'Fetching...';
      progress = Math.min(99, Math.floor((partialItems.length / 1000) * 100));
      await setLiveProgress(resource.key, { status, progress, count: partialItems.length, page, error });
    }
    // Batched fetching with resume
    let done = false;
    let chunkBuffer: any[] = [];
    let chunkPage = 1;
    while (!done) {
      // Check for per-resource pause flag before each batch
      const isPaused = await redis.get(`systemload:paused:${resource.key}`);
      if (isPaused) {
        status = 'Paused';
        await setLiveProgress(resource.key, {
          status,
          progress: Math.min(99, Math.floor((totalCount / 1000) * 100)),
          count: totalCount,
          page,
          error: null,
        });
        break;
      }
      const command = new ScanCommand({
        TableName: resource.table,
        Limit: resource.limit,
        ExclusiveStartKey: lastEvaluatedKey || undefined,
      });
      const response = await docClient.send(command);
      if (response.Items) {
        // Log batch fetch details
        console.log(`[SystemLoad] Resource: ${resource.key}, Page: ${page}, Batch size: ${response.Items.length}, LastEvaluatedKey: ${JSON.stringify(lastEvaluatedKey)}`);
        chunkBuffer = chunkBuffer.concat(response.Items);
        totalCount += response.Items.length;
        while (chunkBuffer.length >= resource.limit) {
          const chunk = chunkBuffer.slice(0, resource.limit);
          const chunkKey = `${resource.key}:page:${chunkPage}`;
          await redis.set(chunkKey, JSON.stringify(chunk), 'EX', resource.ttl);
          console.log(`[SystemLoad] Buffered chunk: Stored ${chunk.length} items in Redis at key: ${chunkKey}`);
          chunkBuffer = chunkBuffer.slice(resource.limit);
          chunkPage++;
        }
        // Optionally, update partial progress count in Redis (store just the count or skip this for memory efficiency)
        await setLiveProgress(resource.key, {
          status: 'Fetching...',
          progress: Math.min(99, Math.floor((totalCount / 1000) * 100)),
          count: totalCount,
          page,
          error: null,
        });
        console.log(`[SystemLoad] Running total items: ${totalCount}`);
      }
      lastEvaluatedKey = response.LastEvaluatedKey;
      if (lastEvaluatedKey) {
        console.log(`[SystemLoad] Next LastEvaluatedKey: ${JSON.stringify(lastEvaluatedKey)}`);
      }
      await setLastKey(resource.key, lastEvaluatedKey);
      // --- Live progress update ---
      // Already updated above after each batch
      page++;
      if (!lastEvaluatedKey) {
        done = true;
        // Write any remaining orders in the buffer as the final chunk
        if (chunkBuffer.length > 0) {
          const chunkKey = `${resource.key}:page:${chunkPage}`;
          await redis.set(chunkKey, JSON.stringify(chunkBuffer), 'EX', resource.ttl);
          console.log(`[SystemLoad] Final buffered chunk: Stored ${chunkBuffer.length} items in Redis at key: ${chunkKey}`);
        }
        // Optionally, you can store just the total count or a summary, but do not store all items in memory
        status = 'Complete';
        progress = 100;
        await setLiveProgress(resource.key, { status, progress, count: totalCount, page, error });
      } else {
        progress = Math.min(99, Math.floor((totalCount / 1000) * 100));
      }
    }
  } catch (e: any) {
    error = getErrorMessage(e, resource.key);
    status = 'Error';
    progress = 0;
    totalCount = 0;
    await setLiveProgress(resource.key, { status, progress, count: 0, page, error });
  }
  return { status, progress, count: totalCount, error };
}

export async function GET(req: Request) {
  // Check for refresh param
  const url = new URL(req.url);
  const refresh = url.searchParams.get('refresh') === 'true';

  if (refresh) {
    // Clear all cache and progress for all resources
    for (const resource of resources) {
      await redis.del(resource.cacheKey);
      await redis.del(resource.partialKey);
      await clearProgress(resource.key);
      // Optionally, clear all batch/page keys
      let page = 1;
      while (await redis.get(`${resource.key}:page:${page}`)) {
        await redis.del(`${resource.key}:page:${page}`);
        page++;
      }
    }
  }

  // Get user-set priority or default order
  let priority: string[] = await getPriorityList();
  if (!priority.length) priority = resources.map((r: any) => r.key);
  // Sort resources by priority
  const sortedResources: any[] = priority.map((key: string) => resources.find((r: any) => r.key === key)).filter(Boolean);
  const results: any[] = [];
  for (const resource of sortedResources) {
    if (!resource) continue;
    const result = await fetchResourceBatched(resource);
    results.push(result);
  }
  const response: any = {};
  sortedResources.forEach((r: any, i: number) => {
    if (r) response[r.key] = results[i];
  });
  return NextResponse.json(response);
} 