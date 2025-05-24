import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { cache } from '@/utils/cache';

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});
const docClient = DynamoDBDocumentClient.from(client);
const CACHE_KEY = 'pinterest_boards';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    // Check cache first
    const cachedData = cache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // If not in cache, fetch from DynamoDB
    const command = new ScanCommand({
      TableName: process.env.PINTEREST_BOARDS_TABLE,
    });

    const response = await docClient.send(command);
    const items = response.Items || [];

    // Store in cache
    cache.set(CACHE_KEY, items, CACHE_TTL);
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching Pinterest boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Pinterest boards' },
      { status: 500 }
    );
  }
} 