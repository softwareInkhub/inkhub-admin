import { redis } from '../src/utils/redis';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const CHUNK_SIZE = 2000;
const CACHE_TTL = 7 * 24 * 60 * 60; // 7 days
const SHOPIFY_ORDERS_TABLE = process.env.SHOPIFY_ORDERS_TABLE!;

async function fetchAllOrders(): Promise<any[]> {
  const client = new DynamoDBClient({ region: process.env.AWS_REGION });
  const docClient = DynamoDBDocumentClient.from(client);
  let lastEvaluatedKey: any = undefined;
  const allOrders: any[] = [];
  do {
    const command = new ScanCommand({
      TableName: SHOPIFY_ORDERS_TABLE,
      Limit: 1000,
      ExclusiveStartKey: lastEvaluatedKey,
    });
    const response = await docClient.send(command);
    allOrders.push(...(response.Items || []));
    lastEvaluatedKey = response.LastEvaluatedKey;
    console.log(`Fetched ${allOrders.length} orders so far...`);
  } while (lastEvaluatedKey);
  return allOrders;
}

async function warmOrdersCache() {
  console.log('Starting cache warming for Shopify orders...');
  const allOrders = await fetchAllOrders();
  console.log(`Fetched total ${allOrders.length} orders from DynamoDB.`);
  let chunkCount = 0;
  for (let i = 0; i < allOrders.length; i += CHUNK_SIZE) {
    const chunk = allOrders.slice(i, i + CHUNK_SIZE);
    const chunkKey = `shopify_orders:chunk:${i / CHUNK_SIZE}`;
    const exists = await redis.exists(chunkKey);
    if (!exists) {
      await redis.set(chunkKey, JSON.stringify(chunk), 'EX', CACHE_TTL);
      console.log(`Stored chunk ${chunkKey} with ${chunk.length} orders.`);
    } else {
      console.log(`Chunk ${chunkKey} already exists, skipping.`);
    }
    chunkCount++;
  }
  console.log(`Cache warming complete. Total chunks: ${chunkCount}`);
}

warmOrdersCache().then(() => process.exit(0)).catch(err => {
  console.error('Error warming cache:', err);
  process.exit(1);
}); 