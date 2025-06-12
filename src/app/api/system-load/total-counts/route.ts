import { NextResponse } from 'next/server';
import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, ScanCommandInput, ScanCommandOutput } from '@aws-sdk/lib-dynamodb';
import redis from '@/utils/redis';

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});
const docClient = DynamoDBDocumentClient.from(client);

const resources = [
  { key: 'orders', table: process.env.SHOPIFY_ORDERS_TABLE },
  { key: 'products', table: process.env.SHOPIFY_PRODUCTS_TABLE },
  { key: 'pins', table: process.env.PINTEREST_PINS_TABLE },
  { key: 'boards', table: process.env.PINTEREST_BOARDS_TABLE },
  { key: 'designs', table: process.env.DESIGN_TABLE },
];

const CACHE_TTL = 300; // 5 minutes

async function getTableCount(table: string): Promise<number> {
  // Try DescribeTable for fast, approximate count
  try {
    const describe = new DescribeTableCommand({ TableName: table });
    const resp = await client.send(describe);
    if (resp.Table && typeof resp.Table.ItemCount === 'number') {
      return resp.Table.ItemCount;
    }
  } catch (e) {
    // Fallback to scan if DescribeTable fails
  }
  // Fallback: full scan (slow, exact)
  let count = 0;
  let lastKey: ScanCommandInput["ExclusiveStartKey"] = undefined;
  do {
    const command: ScanCommandInput = {
      TableName: table,
      Select: 'COUNT',
      ExclusiveStartKey: lastKey,
    };
    const response: ScanCommandOutput = await docClient.send(new ScanCommand(command));
    count += response.Count || 0;
    lastKey = response.LastEvaluatedKey;
  } while (lastKey);
  return count;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const refresh = url.searchParams.get('refresh') === 'true';
  const result: Record<string, number | { error: string }> = {};
  for (const resource of resources) {
    try {
      if (!resource.table) {
        result[resource.key] = { error: 'No table configured' };
        continue;
      }
      const cacheKey = `table_count:${resource.key}`;
      let count: number | null = null;
      if (!refresh) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          count = parseInt(cached, 10);
        }
      }
      if (count === null || isNaN(count)) {
        count = await getTableCount(resource.table);
        await redis.set(cacheKey, String(count), 'EX', CACHE_TTL);
      }
      result[resource.key] = count;
    } catch (e: any) {
      result[resource.key] = { error: e.message || 'Error fetching count' };
    }
  }
  return NextResponse.json(result);
} 