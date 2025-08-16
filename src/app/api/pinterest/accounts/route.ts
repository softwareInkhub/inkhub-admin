import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export async function POST(req: NextRequest) {
  const { email, accountName, tag } = await req.json();

  if (!email || !accountName) {
    return NextResponse.json({ error: 'Missing email or accountName' }, { status: 400 });
  }

  try {
    await ddbDocClient.send(
      new PutCommand({
        TableName: 'PinterestAccounts',
        Item: { email, accountName, createdAt: Date.now(), ...(tag ? { tag } : {}) },
      })
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await ddbDocClient.send(
      new ScanCommand({ TableName: 'PinterestAccounts' })
    );
    return NextResponse.json({ accounts: data.Items || [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { email, active } = await req.json();

  if (!email || typeof active !== 'boolean') {
    return NextResponse.json({ error: 'Missing or invalid email/active' }, { status: 400 });
  }

  try {
    await ddbDocClient.send(
      new UpdateCommand({
        TableName: 'PinterestAccounts',
        Key: { email },
        UpdateExpression: 'SET #a = :a',
        ExpressionAttributeNames: { '#a': 'active' },
        ExpressionAttributeValues: { ':a': active },
      })
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }
  try {
    await ddbDocClient.send(
      new DeleteCommand({
        TableName: 'PinterestAccounts',
        Key: { email },
      })
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 