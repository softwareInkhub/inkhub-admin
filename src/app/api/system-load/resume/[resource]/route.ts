import { NextResponse } from 'next/server';
import redis from '@/utils/redis';

export async function POST(_req: Request, { params }: { params: { resource: string } }) {
  const { resource } = params;
  await redis.del(`systemload:paused:${resource}`);
  return NextResponse.json({ paused: false });
} 