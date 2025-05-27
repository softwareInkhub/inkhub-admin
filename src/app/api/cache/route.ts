import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

const CACHE_DIR = path.join(process.cwd(), '.cache');
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating cache directory:', error);
  }
}

// Get cache file path
function getCacheFilePath(key: string): string {
  const safeKey = key.replace(/[^a-zA-Z0-9]/g, '_');
  return path.join(CACHE_DIR, `${safeKey}.cache`);
}

// Compress data
async function compress(data: any): Promise<Buffer> {
  const jsonString = JSON.stringify(data);
  return await gzipAsync(jsonString);
}

// Decompress data
async function decompress(buffer: Buffer): Promise<any> {
  const decompressed = await gunzipAsync(buffer);
  return JSON.parse(decompressed.toString());
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ error: 'Cache key is required' }, { status: 400 });
    }

    await ensureCacheDir();
    const filePath = getCacheFilePath(key);

    try {
      const buffer = await fs.readFile(filePath);
      const entry = await decompress(buffer);

      // Debug log for cache entry
      const now = Date.now();
      const expired = now - entry.timestamp > entry.ttl;
      console.log('[Disk Cache API] Read', filePath, 'timestamp:', entry.timestamp, 'ttl:', entry.ttl, 'now:', now, 'expired:', expired);

      // Check if cache has expired
      if (expired) {
        await fs.unlink(filePath).catch(() => {});
        return NextResponse.json({ data: null });
      }

      return NextResponse.json({ data: entry.data });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return NextResponse.json({ data: null });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error reading cache:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('[Disk Cache API] POST called');
    const { key, value, ttl = 5 * 60 * 1000 } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Cache key and value are required' }, { status: 400 });
    }

    await ensureCacheDir();
    const entry = {
      data: value,
      timestamp: Date.now(),
      ttl
    };

    const compressed = await compress(entry);
    const filePath = getCacheFilePath(key);

    // For large data, use chunked storage
    if (compressed.length > CHUNK_SIZE) {
      const chunksDir = path.join(CACHE_DIR, `${key}-chunks`);
      await fs.mkdir(chunksDir, { recursive: true });

      const chunks = Math.ceil(compressed.length / CHUNK_SIZE);
      for (let i = 0; i < chunks; i++) {
        const chunk = compressed.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        await fs.writeFile(path.join(chunksDir, `chunk-${i}`), chunk);
      }

      // Write metadata
      await fs.writeFile(filePath, JSON.stringify({
        chunks,
        chunksDir,
        totalSize: compressed.length,
        timestamp: Date.now(),
        ttl
      }));
    } else {
      await fs.writeFile(filePath, compressed);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error writing cache:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ error: 'Cache key is required' }, { status: 400 });
    }

    const filePath = getCacheFilePath(key);
    await fs.unlink(filePath).catch(() => {});

    // Clean up chunks if they exist
    const chunksDir = path.join(CACHE_DIR, `${key}-chunks`);
    await fs.rm(chunksDir, { recursive: true, force: true }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cache:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 