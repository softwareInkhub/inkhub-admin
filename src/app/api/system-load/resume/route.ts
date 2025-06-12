import { NextResponse } from 'next/server';
import redis from '@/utils/redis';

export async function POST() {
  await redis.del('systemload:paused');
  return NextResponse.json({ paused: false });
} 