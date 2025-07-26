import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data } = await axios.post(
      'https://bjq07tyd0a.execute-api.us-east-1.amazonaws.com/default/dynamodb-to-valkey-cache',
      body,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to trigger cache' },
      { status: 500 }
    );
  }
} 