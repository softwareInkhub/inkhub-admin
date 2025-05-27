import fs from 'fs/promises';
import path from 'path';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const isServer = typeof window === 'undefined';
const baseUrl = isServer
  ? process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  : '';

export class DiskCache {
  private static instance: DiskCache;

  private constructor() {}

  public static getInstance(): DiskCache {
    if (!DiskCache.instance) {
      DiskCache.instance = new DiskCache();
    }
    return DiskCache.instance;
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const response = await fetch(`${baseUrl}/api/cache?key=${encodeURIComponent(key)}`);
      const result = await response.json();
      console.log('[Disk Cache] DEBUG: Read cache for', key, 'result:', result);
      const { data } = result;
      return data;
    } catch (error) {
      console.error(`Error reading cache for key ${key}:`, error);
      return null;
    }
  }

  public async set<T>(key: string, value: T, ttl: number = 5 * 60 * 1000): Promise<void> {
    try {
      console.log('[Disk Cache] DEBUG: Writing cache for', key, 'with TTL', ttl);
      const response = await fetch(`${baseUrl}/api/cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value, ttl }),
      });
      const result = await response.json();
      console.log('[Disk Cache] DEBUG: Write result for', key, ':', result);
    } catch (error) {
      console.error(`Error writing cache for key ${key}:`, error);
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      await fetch(`${baseUrl}/api/cache?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Error deleting cache for key ${key}:`, error);
    }
  }

  public async clear(): Promise<void> {
    try {
      await fetch(`${baseUrl}/api/cache/clear`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  public async getStats(): Promise<{ size: number; files: number }> {
    try {
      const response = await fetch(`${baseUrl}/api/cache/stats`);
      return await response.json();
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { size: 0, files: 0 };
    }
  }
}

export const diskCache = DiskCache.getInstance(); 