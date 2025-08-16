import { NextResponse } from 'next/server';

export async function GET() {
  // Uptime (in seconds)
  const uptime = process.uptime();

  // Memory usage (in MB)
  const memoryUsage = process.memoryUsage().rss / 1024 / 1024;

  // Cache stats (if you have a cache utility)
  let cacheHitRate: number | null = null;
  try {
    // Removed: if (redis && redis.info) {
    // Removed: const info = await redis.info();
    // Removed: const hits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || '0', 10);
    // Removed: const misses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || '0', 10);
    // Removed: cacheHitRate = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : null;
  } catch {}

  // Simulate API latency (or use real monitoring)
  const apiLatency = Math.floor(Math.random() * 100) + 50; // ms

  return NextResponse.json({
    uptime,
    memoryUsage,
    cacheHitRate,
    apiLatency,
  });
} 