import { NextResponse } from 'next/server';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});
const docClient = DynamoDBDocumentClient.from(client);

export async function GET() {
  try {
    // Test AWS credentials by listing tables
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    
    return NextResponse.json({
      status: 'success',
      message: 'AWS credentials are valid',
      tables: response.TableNames,
      region: process.env.AWS_REGION
    });
  } catch (error: any) {
    console.error('AWS Connection Test Error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      code: error.code,
      region: process.env.AWS_REGION
    }, { status: 500 });
  }
} 