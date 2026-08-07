import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  console.log('🔄 Cache API: /api/cache/shopify-products called');
  try {
    console.log('🔄 Cache API: Calling Lambda API...');
    const response = await axios.post(
      'https://8jo83n4y51.execute-api.us-east-1.amazonaws.com/default/fetchCachedTableData',
      {
        project: 'myproject',
        table: 'shopify-inkhub-get-products'
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    console.log('🔄 Cache API: Lambda response received:', response.data);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching Shopify products cache:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Shopify products cache' },
      { status: 500 }
    );
  }
} 