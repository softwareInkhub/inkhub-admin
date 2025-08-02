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
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000 // 5 second timeout
      }
    );
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching design library cache:', error);
    // Return empty data instead of error to prevent build failures
    return NextResponse.json(
      { items: [], total: 0, message: 'Cache service unavailable' },
      { status: 200 }
    );
  }
} 