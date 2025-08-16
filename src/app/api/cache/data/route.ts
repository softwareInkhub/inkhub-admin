import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const project = searchParams.get('project') || 'my-app';
    const table = searchParams.get('table');
    const key = searchParams.get('key');

    if (!table) {
      return NextResponse.json(
        { error: 'Table parameter is required' },
        { status: 400 }
      );
    }

    // Proxy to backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    const params = new URLSearchParams();
    params.append('project', project);
    params.append('table', table);
    if (key) params.append('key', key);

    const response = await fetch(`${backendUrl}/cache/data?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching cache data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch cache data' },
      { status: 500 }
    );
  }
} 