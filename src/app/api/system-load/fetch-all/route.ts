import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import redis from '@/utils/redis';

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
    limit: 100,
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

async function fetchResource(resource: any) {
  let status = 'Fetching...';
  let progress = 0;
  let items: any[] = [];
  let error = null;
  try {
    // Try full cache
    const cached = await redis.get(resource.cacheKey);
    if (cached) {
      items = JSON.parse(cached);
      status = 'Complete';
      progress = 100;
      return { status, progress, items, error };
    }
    // Try partial cache
    const partial = await redis.get(resource.partialKey);
    if (partial) {
      items = JSON.parse(partial);
      status = 'Fetching...';
      // Estimate progress by number of items (not perfect)
      progress = Math.min(99, Math.floor((items.length / 1000) * 100));
    }
    // If not complete, fetch from DynamoDB
    const command = new ScanCommand({
      TableName: resource.table,
      Limit: resource.limit,
    });
    const response = await docClient.send(command);
    if (response.Items) {
      items = response.Items;
      await redis.set(resource.cacheKey, JSON.stringify(items), 'EX', resource.ttl);
      status = 'Complete';
      progress = 100;
    }
  } catch (e: any) {
    error = getErrorMessage(e, resource.key);
    status = 'Error';
    progress = 0;
    items = [];
  }
  return { status, progress, items, error };
}

export async function GET() {
  const results = await Promise.all(resources.map(fetchResource));
  const response: any = {};
  resources.forEach((r, i) => {
    response[r.key] = results[i];
  });
  return NextResponse.json(response);
} 