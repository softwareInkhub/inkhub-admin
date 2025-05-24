import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

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
    const command = new ScanCommand({
      TableName: process.env.DESIGN_TABLE,
    });
    const response = await docClient.send(command);
    console.log('DynamoDB response:', response); // Debug log
    // Return items as-is (already flat)
    return NextResponse.json(response.Items || []);
  } catch (error) {
    console.error('Error fetching designs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch designs', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const command = new PutCommand({
      TableName: process.env.DESIGN_TABLE,
      Item: data,
    });
    await docClient.send(command);
    return NextResponse.json({ message: 'Design created successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: 'Failed to create design', details: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { uid, ...fields } = data;
    if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    const updateExpression = 'set ' + Object.keys(fields).map((k) => `#${k} = :${k}`).join(', ');
    const expressionAttributeNames = Object.keys(fields).reduce((acc, k) => ({ ...acc, [`#${k}`]: k }), {});
    const expressionAttributeValues = Object.keys(fields).reduce((acc, k) => ({ ...acc, [`:${k}`]: fields[k] }), {});
    const command = new UpdateCommand({
      TableName: process.env.DESIGN_TABLE,
      Key: { uid },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });
    const result = await docClient.send(command);
    return NextResponse.json(result.Attributes);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: 'Failed to update design', details: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { uid } = await request.json();
    if (!uid) return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    const command = new DeleteCommand({
      TableName: process.env.DESIGN_TABLE,
      Key: { uid },
    });
    await docClient.send(command);
    return NextResponse.json({ message: 'Design deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: 'Failed to delete design', details: errorMessage }, { status: 500 });
  }
} 