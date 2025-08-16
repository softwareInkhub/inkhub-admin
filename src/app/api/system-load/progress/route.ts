import { NextResponse } from 'next/server';
import { getAllLiveProgress } from '@/utils/cacheProgress';

const resources = ['orders', 'products', 'pins', 'boards', 'designs'];

export async function GET() {
  const progress = await getAllLiveProgress(resources);
  return NextResponse.json(progress);
} 