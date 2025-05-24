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

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: process.env.SHOPIFY_ORDERS_TABLE,
    });
    const response = await docClient.send(command);
    if (response.Items && response.Items.length > 0) {
      console.log('First order item:', JSON.stringify(response.Items[0], null, 2));
    }
    const items = (response.Items || []).map(transformOrder);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching Shopify orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Shopify orders' },
      { status: 500 }
    );
  }
} 