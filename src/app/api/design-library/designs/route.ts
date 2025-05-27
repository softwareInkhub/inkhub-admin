import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit')) || 50;
  const lastKey = searchParams.get('lastKey') ? JSON.parse(searchParams.get('lastKey')!) : undefined;
  const CACHE_KEY = `design_library_designs:${limit}:${lastKey ? JSON.stringify(lastKey) : ''}`;

  try {
    // Disk cache check
    const cachedData = await diskCache.get(CACHE_KEY);
    if (cachedData) {
      console.log('[Disk Cache] Returning designs from disk cache');
      return NextResponse.json(cachedData);
    }

    // DynamoDB scan with pagination
    const command = new ScanCommand({
      TableName: process.env.DESIGN_TABLE,
      Limit: limit,
      ExclusiveStartKey: lastKey,
    });
    const response = await docClient.send(command);
    const items = response.Items || [];
    const result = { items, lastEvaluatedKey: response.LastEvaluatedKey || null };

    // Store in disk cache
    await diskCache.set(CACHE_KEY, result, CACHE_TTL);
    console.log('[Disk Cache] Returning designs from API and caching');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching designs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch designs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const command = new PutCommand({
      TableName: process.env.DESIGN_TABLE,
      Item: data,
    });
    await docClient.send(command);
    
    // Invalidate cache after successful creation
    cache.delete(CACHE_KEY);
    
    return NextResponse.json({ message: 'Design created successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: 'Failed to create design', details: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { uid, ...fields } = data;
    if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    
    const updateExpression = 'set ' + Object.keys(fields).map((k) => `#${k} = :${k}`).join(', ');
    const expressionAttributeNames = Object.keys(fields).reduce((acc, k) => ({ ...acc, [`#${k}`]: k }), {});
    const expressionAttributeValues = Object.keys(fields).reduce((acc, k) => ({ ...acc, [`:${k}`]: fields[k] }), {});
    
    const command = new UpdateCommand({
      TableName: process.env.DESIGN_TABLE,
      Key: { uid },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });
    const result = await docClient.send(command);
    
    // Invalidate cache after successful update
    cache.delete(CACHE_KEY);
    
    return NextResponse.json(result.Attributes);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: 'Failed to update design', details: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { uid } = await request.json();
    if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    
    const command = new DeleteCommand({
      TableName: process.env.DESIGN_TABLE,
      Key: { uid },
    });
    await docClient.send(command);
    
    // Invalidate cache after successful deletion
    cache.delete(CACHE_KEY);
    
    return NextResponse.json({ message: 'Design deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: 'Failed to delete design', details: errorMessage }, { status: 500 });
  }
} 