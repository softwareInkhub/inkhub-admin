import axios from 'axios';

const API_BASE = 'http://localhost:5001/cache/data';
const STATS_API_BASE = 'http://localhost:5001/cache/stats';
const PROJECT = 'my-app';

// Fetch all chunk keys for a given table
export async function fetchOrderChunkKeys(table: string) {
  const res = await axios.get(API_BASE, {
    params: { project: PROJECT, table }
  });
  return res.data.keys || [];
}

// Fetch a single chunk by chunk number
export async function fetchOrderChunk(table: string, chunkNumber: number) {
  const res = await axios.get(API_BASE, {
    params: { project: PROJECT, table, key: `chunk:${chunkNumber}` }
  });
  // Support both 'items' and 'data' fields for chunk data
  return res.data.items || res.data.data || [];
}

// Robust: Fetch all chunk keys, then fetch each chunk's data, and combine
export async function fetchAllChunks(table: string) {
  // 1. Get all chunk keys
  const keys: string[] = await fetchOrderChunkKeys(table);
  if (!Array.isArray(keys) || keys.length === 0) return [];

  // 2. Extract chunk numbers from keys (support both formats)
  const chunkNumbers = keys
    .map((key: string) => {
      const match = key.match(/chunk:(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n: number | null): n is number => n !== null);

  // 3. Fetch all chunks in parallel
  const chunkPromises = chunkNumbers.map((chunkNumber: number) => fetchOrderChunk(table, chunkNumber));
  const chunkResults = await Promise.all(chunkPromises);

  // 4. Combine all items
  let allItems: any[] = [];
  for (const chunkData of chunkResults) {
    if (Array.isArray(chunkData)) {
      allItems = allItems.concat(chunkData);
    }
  }
  return allItems;
}

// Fetch cache statistics for a given table
export async function fetchCacheStats(table: string) {
  const res = await axios.get(STATS_API_BASE, {
    params: { project: PROJECT, table }
  });
  return res.data.stats || {};
} 