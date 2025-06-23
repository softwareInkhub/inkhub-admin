import { NextResponse } from 'next/server';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { redis } from '@/utils/redis';

export async function GET() {
  // API/server status (always up if this runs)
  const api = { status: 'ok' };

  // Uptime and memory
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage().rss / 1024 / 1024;

  // DynamoDB check
  let dynamodb = { status: 'ok' };
  try {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
    await client.send(new ListTablesCommand({ Limit: 1 }));
  } catch (e: any) {
    dynamodb = { status: 'error', error: e.message };
  }

  // Redis check
  let redisStatus = { status: 'ok' };
  try {
    if (redis && redis.ping) {
      const pong = await redis.ping();
      if (pong !== 'PONG') throw new Error('Unexpected Redis ping response');
    } else {
      throw new Error('Redis not configured');
    }
  } catch (e: any) {
    redisStatus = { status: 'error', error: e.message };
  }

  return NextResponse.json({
    api,
    dynamodb,
    redis: redisStatus,
    uptime,
    memoryUsage,
  });
} 