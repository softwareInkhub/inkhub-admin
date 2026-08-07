import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  try {
    const response = await axios.post(
      'https://8jo83n4y51.execute-api.us-east-1.amazonaws.com/default/fetchCachedTableData',
      {
        project: 'myproject',
        table: 'admin-design-image'
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching design library cache:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch design library cache' },
      { status: 500 }
    );
  }
} 