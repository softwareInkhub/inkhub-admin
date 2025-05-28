import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { diskCache } from '@/utils/disk-cache';

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});
const docClient = DynamoDBDocumentClient.from(client);
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 100;
    const lastKey = searchParams.get('lastKey') ? JSON.parse(searchParams.get('lastKey')!) : undefined;
    const CACHE_KEY = `pinterest_boards:${limit}:${lastKey ? JSON.stringify(lastKey) : ''}`;

    // Check disk cache first
    const cachedData = await diskCache.get(CACHE_KEY);
    if (cachedData) {
      console.log('[Disk Cache] Returning Pinterest boards from disk cache');
      return NextResponse.json(cachedData);
    }

    const command = new ScanCommand({
      TableName: process.env.PINTEREST_BOARDS_TABLE,
      Limit: limit,
      ExclusiveStartKey: lastKey,
    });
    const response = await docClient.send(command);
    const items = response.Items || [];
    const result = { items, lastEvaluatedKey: response.LastEvaluatedKey || null };
    
    await diskCache.set(CACHE_KEY, result, CACHE_TTL);
    console.log('[Disk Cache] Returning Pinterest boards from API and caching');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching Pinterest boards:', error);
    return NextResponse.json({ error: 'Failed to fetch Pinterest boards' }, { status: 500 });
  }
} 