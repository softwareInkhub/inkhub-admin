import { redis } from '@/utils/redis';

export async function GET() {
  // Set a value in Valkey
  await redis.set('test-key', 'hello from valkey!', 'EX', 60); // expires in 60s

  // Get the value back
  const value = await redis.get('test-key');

  return Response.json({ value });
} 