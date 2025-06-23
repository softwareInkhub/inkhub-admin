import { NextResponse } from 'next/server';
import { redis } from '@/utils/redis';

export async function POST() {
  await redis.set('systemload:paused', '1');
  return NextResponse.json({ paused: true });
}

export async function GET() {
  const paused = await redis.get('systemload:paused');
  return NextResponse.json({ paused: !!paused });
} 