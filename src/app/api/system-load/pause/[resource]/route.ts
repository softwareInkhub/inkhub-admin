import { NextResponse } from 'next/server';

export async function POST(_req: Request, { params }: { params: { resource: string } }) {
  const { resource } = params;
  // Removed: await redis.set(`systemload:paused:${resource}`, '1');
  return NextResponse.json({ paused: true });
}

export async function GET(_req: Request, { params }: { params: { resource: string } }) {
  const { resource } = params;
  // Removed: const paused = await redis.get(`systemload:paused:${resource}`);
  return NextResponse.json({ paused: false });
} 