# Inkhub Admin Caching System

A robust, multi-layered caching system that combines disk-based LRU caching with Valkey (Redis-compatible) caching for optimal performance and data consistency across all pages.

## 🏗️ Architecture

### 1. Cache Layers
- **Disk-based LRU Cache:** Fast, in-memory caching using `lru-cache` for client-side data
- **Valkey/Redis Cache:** Distributed, persistent caching for server-side data
- **Next.js Cache:** Built-in caching for API routes and static pages

### 2. Cache Implementation
```typescript
// Disk-based LRU Cache (src/utils/cache.ts)
class Cache {
  private cache: LRUCache<string, any>;
  private static instance: Cache;

  private constructor(options: CacheOptions = {}) {
    this.cache = new LRUCache({
      max: options.max || 500,
      ttl: options.ttl || 1000 * 60 * 5, // Default TTL: 5 minutes
    });
  }
  // ... methods for get, set, delete, clear
}

// Valkey/Redis Cache (src/utils/redis.ts)
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});
```

## 🔄 Data Fetching Flow

### 1. API Routes
Each major section (Shopify, Pinterest, Design Library) follows this pattern:

```typescript
async function getDataFromCache() {
  // 1. Check complete cache
  const cachedData = await redis.get(CACHE_KEY);
  if (cachedData) return JSON.parse(cachedData);

  // 2. Check partial cache
  const partialData = await redis.get(PARTIAL_CACHE_KEY);
  if (partialData) {
    // Trigger background refresh if needed
    triggerBackgroundRefresh();
    return JSON.parse(partialData);
  }

  // 3. Fetch from source
  const data = await fetchFromSource();
  await redis.set(CACHE_KEY, JSON.stringify(data), 'EX', CACHE_TTL);
  return data;
}
```

### 2. Cache Keys
- **Complete Cache:** `ALL_[RESOURCE]_CACHE_KEY`
- **Partial Cache:** `PARTIAL_CACHE_KEY`
- **Lock Key:** `CACHE_LOCK_KEY`
- **Scan Position:** `LAST_SCAN_POSITION_KEY`

### 3. Cache TTL
- Default TTL: 5 minutes
- Configurable per resource
- Automatic invalidation on mutations

## 🛡️ Concurrency Control

### 1. Lock Mechanism
```typescript
async function acquireLock() {
  return await redis.set(CACHE_LOCK_KEY, '1', 'NX', 'EX', 30);
}

async function releaseLock() {
  await redis.del(CACHE_LOCK_KEY);
}
```

### 2. Background Refresh
- Triggered when partial cache is available
- Uses lock to prevent multiple simultaneous fetches
- Updates complete cache when finished

## 📊 Cache Statistics

### 1. LRU Cache Stats
```typescript
{
  size: number;  // Current number of items
  max: number;   // Maximum capacity
}
```

### 2. Debug Logging
- Cache hits/misses
- Fetch times
- Item counts
- Timestamps

## 🔧 Configuration

### 1. Environment Variables
```env
REDIS_HOST=localhost
REDIS_PORT=6379
VALKEY_URL=redis://localhost:6379
```

### 2. Cache Options
```typescript
interface CacheOptions {
  max?: number;    // Maximum items
  ttl?: number;    // Time to live in ms
}
```

## 🎯 Implementation by Section

### 1. Shopify Section
- **Orders:** Cached with pagination support
- **Products:** Full inventory caching
- **Collections:** Hierarchical caching

### 2. Pinterest Section
- **Boards:** Complete board list caching
- **Pins:** Paginated pin caching
- **Analytics:** Aggregated data caching

### 3. Design Library
- **Designs:** Full design catalog caching
- **Images:** S3 URL caching
- **Metadata:** Design properties caching

## 🚀 Performance Optimizations

### 1. Cache Strategies
- **Complete Cache:** For small, frequently accessed datasets
- **Partial Cache:** For large datasets with background refresh
- **Pagination:** For large datasets with limit/offset

### 2. Background Operations
- **Background Refresh:** Updates cache without blocking
- **Lock Mechanism:** Prevents cache stampede
- **TTL Management:** Automatic cache invalidation

## 🐞 Troubleshooting

### 1. Common Issues
- **Cache Miss:** Check Redis connection and TTL
- **Lock Timeout:** Increase lock duration
- **Memory Issues:** Adjust max items and TTL

### 2. Debug Commands
```bash
# Check Redis connection
redis-cli ping

# Monitor cache operations
redis-cli monitor

# Check cache keys
redis-cli keys "*CACHE*"
```

## 📈 Monitoring

### 1. Cache Metrics
- Hit rate
- Miss rate
- Response time
- Memory usage

### 2. Health Checks
- Redis connection status
- Cache size
- Lock status
- Background job status

## 🔄 Cache Invalidation

### 1. Automatic
- TTL expiration
- Background refresh
- Lock timeout

### 2. Manual
- Force refresh endpoint
- Clear cache command
- Reset lock

## 🛠️ Development

### 1. Local Setup
```bash
# Start Valkey
docker compose up valkey

# Monitor logs
docker compose logs -f valkey
```

### 2. Testing
- Cache hit/miss scenarios
- Concurrency handling
- Background refresh
- Error recovery

## 📚 References

- [Valkey Documentation](https://valkey.io/)
- [Redis Commands](https://redis.io/commands)
- [LRU Cache](https://github.com/isaacs/node-lru-cache)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
