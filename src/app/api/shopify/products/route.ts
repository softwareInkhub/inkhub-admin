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
  return 'An error occurred while fetching products. Please try again later.';
}

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

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 100;
    const lastKey = searchParams.get('lastKey') ? JSON.parse(searchParams.get('lastKey')!) : undefined;
    const CACHE_KEY = `shopify_products:${limit}:${lastKey ? JSON.stringify(lastKey) : ''}`;

    // Check disk cache first
    const cachedData = await diskCache.get(CACHE_KEY);
    if (cachedData) {
      console.log('[Disk Cache] Returning products from disk cache');
      return NextResponse.json(cachedData);
    }

    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'AWS configuration is missing. Please check your environment variables.' },
        { status: 500 }
      );
    }

    if (!process.env.SHOPIFY_PRODUCTS_TABLE) {
      return NextResponse.json(
        { error: 'Shopify products table name is not configured. Please check your environment variables.' },
        { status: 500 }
      );
    }

    const command = new ScanCommand({
      TableName: process.env.SHOPIFY_PRODUCTS_TABLE,
      Limit: limit,
      ExclusiveStartKey: lastKey,
    });
    const response = await docClient.send(command);
    const items = (response.Items || []).map(transformProduct);
    const result = { items, lastEvaluatedKey: response.LastEvaluatedKey || null };

    await diskCache.set(CACHE_KEY, result, CACHE_TTL);
    console.log('[Disk Cache] Returning products from API and caching');
    return NextResponse.json(result);
  } catch (error: any) {
    if (error?.message?.includes('cache has expired')) {
      console.log('[Disk Cache] EXPIRED: Cache expired and deleted for key', CACHE_KEY);
    }
    console.error('Error fetching Shopify products:', error);
    const errorMessage = getErrorMessage(error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 