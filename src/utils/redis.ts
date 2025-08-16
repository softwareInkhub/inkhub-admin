import Redis from 'ioredis';

// You can configure the connection string as needed
const redis = new Redis(process.env.VALKEY_URL || 'redis://localhost:6379');

export { redis }; 