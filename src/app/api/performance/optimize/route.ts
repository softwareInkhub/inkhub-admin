import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import Redis from 'ioredis';
import { performanceMonitor } from '@/utils/performance';

// Initialize clients
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

// Compression utility
function compressData(data: any): string {
  // Simple compression for JSON data
  return JSON.stringify(data).replace(/"([^"]+)":/g, '$1:');
}

function decompressData(compressed: string): any {
  // Simple decompression
  return JSON.parse(compressed.replace(/([a-zA-Z0-9_]+):/g, '"$1":'));
}

// Optimized data fetching with streaming
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const table = searchParams.get('table');
  const limit = parseInt(searchParams.get('limit') || '100');
  const useCache = searchParams.get('cache') !== 'false';
  const compress = searchParams.get('compress') !== 'false';

  if (!table) {
    return NextResponse.json({ error: 'Table parameter is required' }, { status: 400 });
  }

  const timer = performanceMonitor.startTimer(`fetch_${table}`);
  
  try {
    // Check cache first
    if (useCache) {
      const cacheKey = `optimized:${table}:${limit}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        const stopTimer = timer();
        console.log(`Cache hit for ${table}, fetched in ${stopTimer}ms`);
        
        const data = compress ? decompressData(cached) : JSON.parse(cached);
        return NextResponse.json({
          data,
          fromCache: true,
          compressed: compress,
          performance: { fetchTime: stopTimer }
        });
      }
    }

    // Fetch from DynamoDB with optimized scanning
    const command = new ScanCommand({
      TableName: table,
      Limit: limit,
      ReturnConsumedCapacity: 'TOTAL',
    });

    const response = await docClient.send(command);
    const items = response.Items || [];

    // Transform and optimize data
    const optimizedItems = items.map(item => {
      // Flatten nested structures and remove unnecessary fields
      const optimized = { ...item };
      
      // Remove large fields that aren't needed for display
      delete optimized.rawData;
      delete optimized.metadata;
      
      return optimized;
    });

    // Cache the result
    if (useCache) {
      const cacheKey = `optimized:${table}:${limit}`;
      const dataToCache = compress ? compressData(optimizedItems) : JSON.stringify(optimizedItems);
      await redis.setex(cacheKey, 300, dataToCache); // 5 minutes TTL
    }

    const stopTimer = timer();
    
    return NextResponse.json({
      data: optimizedItems,
      fromCache: false,
      compressed: compress,
      performance: { 
        fetchTime: stopTimer,
        itemCount: optimizedItems.length,
        consumedCapacity: response.ConsumedCapacity
      }
    });

  } catch (error) {
    console.error('Error in optimized fetch:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// Batch processing endpoint
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  
  if (action === 'batch-process') {
    const { tables, batchSize = 10 } = await req.json();
    
    const results = [];
    const timer = performanceMonitor.startTimer('batch_process');
    
    for (const table of tables) {
      try {
        const command = new ScanCommand({
          TableName: table,
          Limit: batchSize,
        });
        
        const response = await docClient.send(command);
        results.push({
          table,
          success: true,
          itemCount: response.Items?.length || 0
        });
      } catch (error) {
        results.push({
          table,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const stopTimer = timer();
    
    return NextResponse.json({
      results,
      performance: { totalTime: stopTimer, tableCount: tables.length }
    });
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

// Cache management endpoint
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pattern = searchParams.get('pattern') || '*';
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    
    return NextResponse.json({
      success: true,
      clearedKeys: keys.length,
      pattern
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 });
  }
} 