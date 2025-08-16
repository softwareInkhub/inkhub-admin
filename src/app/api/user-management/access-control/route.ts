import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });

export async function POST(req: NextRequest) {
  try {
    const { email, permissions, role } = await req.json();
    if (!email || !permissions || !role) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const command = new PutItemCommand({
      TableName: 'UserPermissions',
      Item: {
        email: { S: email },
        permissions: { S: JSON.stringify(permissions) },
        role: { S: role },
        updatedAt: { S: new Date().toISOString() }
      }
    });
    await client.send(command);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error instanceof Error) ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 