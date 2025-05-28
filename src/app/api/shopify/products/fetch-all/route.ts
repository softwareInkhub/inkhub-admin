import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import fs from 'fs/promises';
import path from 'path';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

const CACHE_KEY = 'shopify_products_all';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const PAGE_SIZE = 100;
const CACHE_DIR = path.join(process.cwd(), '.cache');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});
const docClient = DynamoDBDocumentClient.from(client);

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

function getCacheFilePath(key: string): string {
  const safeKey = key.replace(/[^a-zA-Z0-9]/g, '_');
  return path.join(CACHE_DIR, `${safeKey}.cache`);
}

async function readCache(key: string) {
  try {
    const filePath = getCacheFilePath(key);
    const buffer = await fs.readFile(filePath);
    const entry = JSON.parse((await gunzipAsync(buffer)).toString());
    if (Date.now() - entry.timestamp > entry.ttl) {
      await fs.unlink(filePath).catch(() => {});
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

async function writeCache(key: string, value: any, ttl: number) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const entry = { data: value, timestamp: Date.now(), ttl };
  const compressed = await gzipAsync(JSON.stringify(entry));
  await fs.writeFile(getCacheFilePath(key), compressed);
}

let isFetching = false;
let fetchProgress = 0;
let fetchItems: any[] = [];
let fetchError: string | null = null;

async function fetchAllProductsFromDynamoDB() {
  isFetching = true;
  fetchProgress = 0;
  fetchItems = [];
  fetchError = null;
  let lastKey = undefined;
  let totalFetched = 0;
  try {
    do {
      const command = new ScanCommand({
        TableName: process.env.SHOPIFY_PRODUCTS_TABLE,
        Limit: PAGE_SIZE,
        ExclusiveStartKey: lastKey,
      });
      const response = await docClient.send(command);
      const items = (response.Items || []).map(transformProduct);
      fetchItems = fetchItems.concat(items);
      totalFetched += items.length;
      fetchProgress = Math.round((totalFetched / 5000) * 100); // 5000 as rough max
      await writeCache(CACHE_KEY, { items: fetchItems, status: 'fetching', progress: fetchProgress }, CACHE_TTL);
      lastKey = response.LastEvaluatedKey;
    } while (lastKey);
    fetchProgress = 100;
    await writeCache(CACHE_KEY, { items: fetchItems, status: 'complete', progress: 100 }, CACHE_TTL);
    isFetching = false;
  } catch (err: any) {
    fetchError = err.message || 'Unknown error';
    isFetching = false;
  }
}

export async function GET() {
  // Check cache
  const cached = await readCache(CACHE_KEY);
  if (cached && cached.status === 'complete') {
    return NextResponse.json({ status: 'complete', items: cached.items, progress: 100 });
  }
  if (cached && cached.status === 'fetching') {
    return NextResponse.json({ status: 'fetching', items: cached.items, progress: cached.progress });
  }
  // If not fetching, start background fetch
  if (!isFetching) {
    fetchAllProductsFromDynamoDB(); // Don't await, run in background
  }
  return NextResponse.json({ status: 'fetching', items: cached?.items || [], progress: cached?.progress || 0 });
} 