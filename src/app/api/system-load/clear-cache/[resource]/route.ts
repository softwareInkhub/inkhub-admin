// Forcing a re-read of this file to clear the build cache.
import { NextResponse } from 'next/server';
import { redis } from '@/utils/redis';

export async function POST(
  request: Request,
  { params }: { params: { resource: string } }
) {
  const resource = params.resource;
  if (!resource) {
    return NextResponse.json({ error: 'Invalid resource specified' }, { status: 400 });
  }

  try {
    const getKeysByPattern = async (pattern: string): Promise<string[]> => {
      const allKeys: string[] = [];
      let cursor = '0';
      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 250);
        cursor = nextCursor;
        allKeys.push(...keys);
      } while (cursor !== '0');
      return allKeys;
    };

    // Define patterns based on the actual keys in Redis
    const keyPatterns = [
      `${resource}:page:*`,                  // e.g., orders:page:*
      `shopify_${resource}:chunk:*`,         // e.g., shopify_orders:chunk:*
      `pinterest_${resource}:chunk:*`,       // e.g., pinterest_pins:chunk:*
      `systemload:progress:${resource}`,     // e.g., systemload:progress:orders
      `systemload:progress:${resource}:live`,
      `systemload:paused:${resource}`,
      `table_count:${resource}`,
      // Keys for the more complex caching strategies
      `shopify_${resource}:all`,
      `shopify_${resource}:partial`,
      `shopify_${resource}:lock`,
      `shopify_${resource}:last_scan_position`,
      `pinterest_${resource}:all`,
      `pinterest_${resource}:partial`,
      `pinterest_${resource}:lock`,
      `pinterest_${resource}:last_scan_position`,
      `design_library:all` // Special case for design library
    ];
    
    // For "designs", since it's a single word resource key
    if (resource === 'designs') {
        keyPatterns.push(`design_library:partial`, `design_library:lock`, `design_library:last_scan_position`);
    }


    let keysToDelete: string[] = [];
    for (const pattern of keyPatterns) {
      const foundKeys = await getKeysByPattern(pattern);
      keysToDelete.push(...foundKeys);
    }

    // Add single keys that don't need a pattern
     keysToDelete.push(
      `systemload:progress:${resource}`,
      `systemload:progress:${resource}:live`,
      `systemload:paused:${resource}`,
      `table_count:${resource}`
    );


    const uniqueKeysToDelete = [...new Set(keysToDelete)];

    if (uniqueKeysToDelete.length > 0) {
      await redis.del(uniqueKeysToDelete);
    }

    return NextResponse.json({
      message: `Cache for ${resource} cleared successfully.`,
      clearedKeysCount: uniqueKeysToDelete.length,
      clearedKeys: uniqueKeysToDelete,
    });

  } catch (error) {
    console.error(`Error clearing cache for ${resource}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to clear cache for ${resource}`, details: errorMessage }, { status: 500 });
  }
} 