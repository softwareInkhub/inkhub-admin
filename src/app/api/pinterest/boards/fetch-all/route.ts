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

function transformBoard(item: any) {
  // Customize as needed for your board schema
  return item;
}

let isFetching = false;
let fetchProgress = 0;
let fetchItems: any[] = [];
let fetchError: string | null = null;

async function fetchAllBoardsFromDynamoDB() {
  isFetching = true;
  fetchProgress = 0;
  fetchItems = [];
  fetchError = null;
  let lastKey = undefined;
  let totalFetched = 0;
  try {
    do {
      const command: ScanCommand = new ScanCommand({
        TableName: process.env.PINTEREST_BOARDS_TABLE,
        Limit: PAGE_SIZE,
        ExclusiveStartKey: lastKey,
      });
      const response = await docClient.send(command);
      const items = (response.Items || []).map(transformBoard);
      fetchItems = fetchItems.concat(items);
      totalFetched += items.length;
      fetchProgress = Math.min(100, Math.round((totalFetched / 5000) * 100));
      lastKey = response.LastEvaluatedKey;
    } while (lastKey);
    fetchProgress = 100;
    isFetching = false;
  } catch (err: any) {
    fetchError = err.message || 'Unknown error';
    console.error('Boards fetch error:', err);
    isFetching = false;
  }
}

export async function GET() {
  if (!isFetching) {
    fetchAllBoardsFromDynamoDB();
  }
  return NextResponse.json({ 
    status: isFetching ? 'fetching' : 'complete', 
    items: fetchItems, 
    progress: fetchProgress,
    error: fetchError 
  });
} 