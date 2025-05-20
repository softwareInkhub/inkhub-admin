import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});
const docClient = DynamoDBDocumentClient.from(client);

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: process.env.SHOPIFY_ORDERS_TABLE,
    });
    const response = await docClient.send(command);
    const items = response.Items || [];
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching Shopify orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Shopify orders' },
      { status: 500 }
    );
  }
} 