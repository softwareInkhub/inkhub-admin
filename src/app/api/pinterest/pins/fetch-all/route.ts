import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const PAGE_SIZE = 100;

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});
const docClient = DynamoDBDocumentClient.from(client);

function transformPin(item: any) {
  // Customize as needed for your pin schema
  return item;
}

let isFetching = false;
let fetchProgress = 0;
let fetchItems: any[] = [];
let fetchError: string | null = null;

async function fetchAllPinsFromDynamoDB() {
  isFetching = true;
  fetchProgress = 0;
  fetchItems = [];
  fetchError = null;
  let lastKey = undefined;
  let totalFetched = 0;
  try {
    do {
      const command = new ScanCommand({
        TableName: process.env.PINTEREST_PINS_TABLE,
        Limit: PAGE_SIZE,
        ExclusiveStartKey: lastKey,
      });
      const response = await docClient.send(command);
      const items = (response.Items || []).map(transformPin);
      fetchItems = fetchItems.concat(items);
      totalFetched += items.length;
      fetchProgress = Math.min(100, Math.round((totalFetched / 5000) * 100));
      lastKey = response.LastEvaluatedKey;
    } while (lastKey);
    fetchProgress = 100;
    isFetching = false;
  } catch (err: any) {
    fetchError = err.message || 'Unknown error';
    console.error('Pins fetch error:', err);
    isFetching = false;
  }
}

export async function GET() {
  if (!isFetching) {
    fetchAllPinsFromDynamoDB();
  }
  return NextResponse.json({ 
    status: isFetching ? 'fetching' : 'complete', 
    items: fetchItems, 
    progress: fetchProgress,
    error: fetchError 
  });
} 