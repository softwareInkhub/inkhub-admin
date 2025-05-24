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

function transformProduct(item: any) {
  // Extract the actual product data from the Item field
  const product = item.Item || {};
  
  return {
    id: product.id,
    title: product.title,
    body_html: product.body_html,
    handle: product.handle,
    vendor: product.vendor,
    product_type: product.product_type,
    tags: product.tags,
    status: product.status,
    published_scope: product.published_scope,
    published_at: product.published_at,
    created_at: product.created_at,
    updated_at: product.updated_at,
    image: product.image, // main image object
    images: product.images || [], // array of image objects
    variants: product.variants || [], // array of variant objects
    options: product.options || [], // array of option objects
    template_suffix: product.template_suffix,
    admin_graphql_api_id: product.admin_graphql_api_id,
  };
}

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: process.env.SHOPIFY_PRODUCTS_TABLE,
    });
    const response = await docClient.send(command);
    if (response.Items && response.Items.length > 0) {
      console.log('First product item:', JSON.stringify(response.Items[0], null, 2));
    }
    const items = (response.Items || []).map(transformProduct);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Shopify products' },
      { status: 500 }
    );
  }
} 