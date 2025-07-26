import { NextResponse } from 'next/server';
import { redis } from '@/utils/redis';

// Cache keys for Pinterest pins
const PINTEREST_PINS_CACHE = {
  all: 'pinterest_pins:all',
  partial: 'pinterest_pins:partial',
  lock: 'pinterest_pins:lock',
  lastScanPosition: 'pinterest_pins:last_scan_position',
  ttl: 7 * 24 * 60 * 60, // 7 days
};

interface DynamoDBStreamRecord {
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE';
  dynamodb: {
    NewImage?: any;
    OldImage?: any;
    Keys: any;
  };
}

interface LambdaPayload {
  tableName: string;
  records: DynamoDBStreamRecord[];
  timestamp: string;
}

// Function to convert DynamoDB item format to regular JSON
function convertDynamoDBItem(dynamoItem: any): any {
  const converted: any = {};

  for (const [key, value] of Object.entries(dynamoItem)) {
    if (value && typeof value === 'object') {
      if ('S' in value) {
        converted[key] = value.S as string;
      } else if ('N' in value) {
        converted[key] = parseFloat(value.N as string);
      } else if ('BOOL' in value) {
        converted[key] = value.BOOL as boolean;
      } else if ('NULL' in value) {
        converted[key] = null;
      } else if ('L' in value) {
        converted[key] = (value.L as any[]).map((item: any) => convertDynamoDBItem(item));
      } else if ('M' in value) {
        converted[key] = convertDynamoDBItem(value.M as any);
      } else if ('SS' in value) {
        converted[key] = value.SS as string[];
      } else if ('NS' in value) {
        converted[key] = (value.NS as string[]).map((n: string) => parseFloat(n));
      }
    } else {
      converted[key] = value;
    }
  }

  return converted;
}

// Function to extract data from DynamoDB stream records
function extractDataFromRecords(records: DynamoDBStreamRecord[], eventType: string): any[] {
  const extractedData: any[] = [];

  for (const record of records) {
    let data: any = null;

    if (eventType === 'INSERT' || eventType === 'MODIFY') {
      // Use NewImage for INSERT/MODIFY events
      data = record.dynamodb.NewImage;
    } else if (eventType === 'REMOVE') {
      // Use OldImage for REMOVE events
      data = record.dynamodb.OldImage;
    }

    if (data) {
      // Convert DynamoDB format to regular JSON
      const convertedData = convertDynamoDBItem(data);
      extractedData.push(convertedData);
    }
  }

  return extractedData;
}

// Function to update Pinterest pins cache with new/updated data
async function updatePinterestPinsCache(newData: any[], eventType: string) {
  console.log(`[Webhook] 🔄 Updating Pinterest pins cache with ${newData.length} items (${eventType})`);

  try {
    // Check if we have existing cache
    const existingCache = await redis.get(PINTEREST_PINS_CACHE.all);
    
    if (existingCache) {
      // Parse existing cache
      const existingPins = JSON.parse(existingCache);
      console.log(`[Webhook] 📦 Found existing cache with ${existingPins.length} pins`);

      let updatedPins = [...existingPins];

      // Handle different event types
      if (eventType === 'INSERT' || eventType === 'MODIFY') {
        // For INSERT/MODIFY, add or update pins
        for (const newPin of newData) {
          // Find if pin already exists (try multiple possible ID fields)
          const existingIndex = updatedPins.findIndex((pin: any) => 
            pin.id === newPin.id || 
            pin.pin_id === newPin.pin_id || 
            pin.uid === newPin.uid ||
            pin.pinId === newPin.pinId
          );

          if (existingIndex >= 0) {
            // Update existing pin
            updatedPins[existingIndex] = { ...updatedPins[existingIndex], ...newPin };
            console.log(`[Webhook] 🔄 Updated existing pin: ${newPin.id || newPin.pin_id || newPin.uid || newPin.pinId}`);
          } else {
            // Add new pin
            updatedPins.push(newPin);
            console.log(`[Webhook] ➕ Added new pin: ${newPin.id || newPin.pin_id || newPin.uid || newPin.pinId}`);
          }
        }
      } else if (eventType === 'REMOVE') {
        // For REMOVE, remove pins
        for (const removedPin of newData) {
          const existingIndex = updatedPins.findIndex((pin: any) => 
            pin.id === removedPin.id || 
            pin.pin_id === removedPin.pin_id || 
            pin.uid === removedPin.uid ||
            pin.pinId === removedPin.pinId
          );

          if (existingIndex >= 0) {
            updatedPins.splice(existingIndex, 1);
            console.log(`[Webhook] 🗑️ Removed pin: ${removedPin.id || removedPin.pin_id || removedPin.uid || removedPin.pinId}`);
          }
        }
      }

      // Update the cache with new data
      await redis.set(PINTEREST_PINS_CACHE.all, JSON.stringify(updatedPins), 'EX', PINTEREST_PINS_CACHE.ttl);
      console.log(`[Webhook] ✅ Updated Pinterest pins cache: ${existingPins.length} → ${updatedPins.length} pins`);

      // Also clear partial cache to ensure consistency
      await redis.del(PINTEREST_PINS_CACHE.partial);
      await redis.del(PINTEREST_PINS_CACHE.lastScanPosition);
      console.log(`[Webhook] 🧹 Cleared partial cache for Pinterest pins`);

    } else {
      // No existing cache, just store the new data
      console.log(`[Webhook] 📦 No existing cache found for Pinterest pins, storing new data`);
      await redis.set(PINTEREST_PINS_CACHE.all, JSON.stringify(newData), 'EX', PINTEREST_PINS_CACHE.ttl);
      console.log(`[Webhook] ✅ Created new Pinterest pins cache with ${newData.length} pins`);
    }

  } catch (error) {
    console.error(`[Webhook] ❌ Error updating Pinterest pins cache:`, error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const payload: LambdaPayload = await request.json();
    
    console.log(`[Webhook] 📥 Received DynamoDB stream update for table: ${payload.tableName}`);
    console.log(`[Webhook] 📊 Records count: ${payload.records.length}`);
    console.log(`[Webhook] ⏰ Timestamp: ${payload.timestamp}`);

    // Only handle pinterest_inkhub_get_pins table for now
    if (payload.tableName !== 'pinterest_inkhub_get_pins') {
      console.log(`[Webhook] ⏭️ Skipping table: ${payload.tableName} (only handling pinterest_inkhub_get_pins)`);
      return NextResponse.json({ 
        success: true, 
        message: `Skipped table: ${payload.tableName}`,
        reason: 'Only pinterest_inkhub_get_pins is supported currently'
      });
    }

    // Group records by event type
    const recordsByEvent: { [key: string]: DynamoDBStreamRecord[] } = {};
    
    for (const record of payload.records) {
      const eventType = record.eventName;
      if (!recordsByEvent[eventType]) {
        recordsByEvent[eventType] = [];
      }
      recordsByEvent[eventType].push(record);
    }

    // Process each event type
    for (const [eventType, records] of Object.entries(recordsByEvent)) {
      console.log(`[Webhook] 🔄 Processing ${eventType} events: ${records.length} records`);
      
      // Extract data from records
      const extractedData = extractDataFromRecords(records, eventType);
      
      if (extractedData.length > 0) {
        // Update cache with the new data
        await updatePinterestPinsCache(extractedData, eventType);
      }
    }

    console.log(`[Webhook] ✅ Successfully processed DynamoDB stream update for Pinterest pins`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Pinterest pins cache updated successfully`,
      processedRecords: payload.records.length,
      tableName: payload.tableName,
      timestamp: payload.timestamp
    });

  } catch (error) {
    console.error('[Webhook] ❌ Error processing DynamoDB stream update:', error);
    
    return NextResponse.json({ 
      error: 'Failed to process DynamoDB stream update',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'DynamoDB Streams webhook endpoint is running',
    supportedTables: ['pinterest_inkhub_get_pins'],
    timestamp: new Date().toISOString()
  });
} 