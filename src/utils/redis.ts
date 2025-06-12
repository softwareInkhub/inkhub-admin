import Redis from 'ioredis';

const globalForRedis = global as unknown as { redis?: InstanceType<typeof Redis> };

const redis =
  globalForRedis.redis ||
  new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

redis.on('error', (error: any) => {
  console.error('Redis connection error:', error);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

export default redis; 