import { NextResponse } from 'next/server';
import { getPriorityList, setPriorityList } from '@/utils/cacheProgress';

export async function GET() {
  const priority = await getPriorityList();
  return NextResponse.json({ priority });
}

export async function POST(req: Request) {
  const { priority } = await req.json();
  if (!Array.isArray(priority)) {
    return NextResponse.json({ error: 'Invalid priority list' }, { status: 400 });
  }
  await setPriorityList(priority);
  return NextResponse.json({ success: true });
} 