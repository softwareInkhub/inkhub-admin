import axios from 'axios';

const API_BASE = 'http://localhost:5001/cache/data';
const STATS_API_BASE = 'http://localhost:5001/cache/stats';
const PROJECT = 'my-app';

// DynamoDB marshalled format types
interface DynamoDBMarshalledValue {
  S?: string;
  N?: string;
  BOOL?: boolean;
  L?: DynamoDBMarshalledValue[];
  M?: Record<string, DynamoDBMarshalledValue>;
}

// Helper function to safely unmarshall DynamoDB items on the frontend
export function safeUnmarshallItem(item: any): any {
  if (!item || typeof item !== 'object') return item;
  
  // Check if item is in DynamoDB marshalled format
  const hasMarshalledFormat = Object.values(item).some((value: any) => 
    typeof value === 'object' && value !== null && 
    ((value as DynamoDBMarshalledValue).S !== undefined || 
     (value as DynamoDBMarshalledValue).N !== undefined || 
     (value as DynamoDBMarshalledValue).BOOL !== undefined)
  );
  
  if (hasMarshalledFormat) {
    console.log('🔄 Unmarshalling DynamoDB item on frontend');
    // Simple unmarshalling for common types
    const unmarshalled: any = {};
    for (const [key, value] of Object.entries(item)) {
      if (typeof value === 'object' && value !== null) {
        const marshalledValue = value as DynamoDBMarshalledValue;
        if (marshalledValue.S !== undefined) {
          unmarshalled[key] = marshalledValue.S;
        } else if (marshalledValue.N !== undefined) {
          unmarshalled[key] = parseFloat(marshalledValue.N);
        } else if (marshalledValue.BOOL !== undefined) {
          unmarshalled[key] = marshalledValue.BOOL;
        } else if (marshalledValue.L !== undefined) {
          unmarshalled[key] = marshalledValue.L.map((item: any) => safeUnmarshallItem(item));
        } else if (marshalledValue.M !== undefined) {
          unmarshalled[key] = safeUnmarshallItem(marshalledValue.M);
        } else {
          unmarshalled[key] = value;
        }
      } else {
        unmarshalled[key] = value;
      }
    }
    return unmarshalled;
  }
  
  return item;
}

// Helper function to unmarshall an array of items
export function safeUnmarshallItems(items: any[]): any[] {
  if (!Array.isArray(items)) return items;
  return items.map(item => safeUnmarshallItem(item));
}

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
  const rawData = res.data.items || res.data.data || [];
  // Unmarshall the data to handle any DynamoDB marshalled format
  return safeUnmarshallItems(rawData);
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