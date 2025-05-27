import LRUCache from 'lru-cache';

interface CacheOptions {
  max?: number;
  ttl?: number; // We'll map this to ttl
}

class Cache {
  private cache: LRUCache<string, any>;
  private static instance: Cache;

  private constructor(options: CacheOptions = {}) {
    this.cache = new LRUCache({
      max: options.max || 500,
      ttl: options.ttl || 1000 * 60 * 5, // Default TTL: 5 minutes
    });
  }

  public static getInstance(options?: CacheOptions): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache(options);
    }
    return Cache.instance;
  }

  public get<T>(key: string): T | undefined {
    try {
      const value = this.cache.get(key) as T;
      this.logStats('[LRU] Cache get');
      return value;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return undefined;
    }
  }

  public set<T>(key: string, value: T, ttl?: number): void {
    try {
      this.cache.set(key, value, ttl ? { ttl: ttl } : undefined);
      this.logStats('[LRU] Cache set');
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  public delete(key: string): void {
    try {
      this.cache.del(key);
      this.logStats('[LRU] Cache delete');
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  public clear(): void {
    try {
      this.cache.reset();
      this.logStats('[LRU] Cache clear');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  public getStats(): { size: number; max: number } {
    return {
      size: this.cache.size,
      max: this.cache.max,
    };
  }

  public logStats(context: string = '[LRU] Cache stats'): void {
    const stats = this.getStats();
    console.log(`${context} | Size: ${stats.size} / ${stats.max}`);
  }
}

export const cache = Cache.getInstance(); 