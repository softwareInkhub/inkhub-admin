import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  try {
    const response = await axios.post(
      'https://8jo83n4y51.execute-api.us-east-1.amazonaws.com/default/fetchCachedTableData',
      {
        project: 'myproject',
        table: 'pinterest_inkhub_get_pins'
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching Pinterest pins cache:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Pinterest pins cache' },
      { status: 500 }
    );
  }
} 