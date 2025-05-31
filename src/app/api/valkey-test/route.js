import Redis from 'ioredis';

const redis = new Redis({ host: 'localhost', port: 6379 });

export async function GET() {
  // Set a value in Valkey
  await redis.set('test-key', 'hello from valkey!', 'EX', 60); // expires in 60s

  // Get the value back
  const value = await redis.get('test-key');

  return Response.json({ value });
} 