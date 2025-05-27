import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { diskCache } from '@/utils/disk-cache';

// Helper function to create a user-friendly error message
function getErrorMessage(error: any): string {
  if (error.code === 'ENOTFOUND') {
    return 'Unable to connect to AWS DynamoDB. Please check your internet connection and AWS configuration.';
  }
  if (error.code === 'CredentialsProviderError') {
    return 'AWS credentials are missing or invalid. Please check your AWS configuration.';
  }
  if (error.code === 'ResourceNotFoundException') {
    return 'The specified DynamoDB table does not exist. Please check your table name configuration.';
  }
  if (error.code === 'AccessDeniedException') {
    return 'Access denied to DynamoDB. Please check your AWS permissions.';
  }
  return 'An error occurred while fetching orders. Please try again later.';
}

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});
const docClient = DynamoDBDocumentClient.from(client);

// Recursively flatten DynamoDB AttributeValue objects
function fromDynamo(item: any): any {
  if (item == null) return item;
  if (item.S !== undefined) return item.S;
  if (item.N !== undefined) return Number(item.N);
  if (item.BOOL !== undefined) return item.BOOL;
  if (item.NULL) return null;
  if (item.L) return item.L.map(fromDynamo);
  if (item.M) {
    const obj: any = {};
    for (const key in item.M) {
      obj[key] = fromDynamo(item.M[key]);
    }
    return obj;
  }
  return item;
}

function transformOrder(item: any) {
  // Try to find the actual order object
  const orderRaw = item.Item?.M || item.Item || item.M || item;
  const order = fromDynamo(orderRaw);

  return {
    id: order.id,
    name: order.name,
    order_number: order.order_number,
    created_at: order.created_at,
    updated_at: order.updated_at,
    processed_at: order.processed_at,
    closed_at: order.closed_at,
    cancelled_at: order.cancelled_at,
    financial_status: order.financial_status,
    fulfillment_status: order.fulfillment_status,
    total_price: order.total_price,
    subtotal_price: order.subtotal_price,
    total_tax: order.total_tax,
    total_discounts: order.total_discounts,
    currency: order.currency,
    customer: order.customer || null,
    shipping_address: order.shipping_address || null,
    billing_address: order.billing_address || null,
    line_items: order.line_items || [],
    fulfillments: order.fulfillments || [],
    tags: order.tags,
    note: order.note,
    email: order.email,
    phone: order.phone,
  };
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 100;
    const lastKey = searchParams.get('lastKey') ? JSON.parse(searchParams.get('lastKey')!) : undefined;
    const CACHE_KEY = `shopify_orders:${limit}:${lastKey ? JSON.stringify(lastKey) : ''}`;

    // Check disk cache first
    const cachedData = await diskCache.get(CACHE_KEY);
    if (cachedData) {
      console.log('[Disk Cache] Returning orders from disk cache');
      return NextResponse.json(cachedData);
    }

    const command = new ScanCommand({
      TableName: process.env.SHOPIFY_ORDERS_TABLE,
      Limit: limit,
      ExclusiveStartKey: lastKey,
    });
    const response = await docClient.send(command);
    const items = (response.Items || []).map(transformOrder);
    const result = { items, lastEvaluatedKey: response.LastEvaluatedKey || null };

    await diskCache.set(CACHE_KEY, result, CACHE_TTL);
    console.log('[Disk Cache] Returning orders from API and caching');
    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 