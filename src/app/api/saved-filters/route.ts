import { NextRequest } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'saved_filters';
const GSI_NAME = 'userId_section_tabkey_index';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = {
      ...body,
      id: body.id || crypto.randomUUID(),
    };
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }));
    return Response.json({ success: true, id: item.id });
  } catch (error) {
    console.error('Error saving filter:', error);
    return Response.json({ error: 'Failed to save filter' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const sectionTabKey = searchParams.get('sectionTabKey');

    if (!userId || !sectionTabKey) {
      return Response.json({ error: 'Missing userId or sectionTabKey' }, { status: 400 });
    }

    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI_NAME,
      KeyConditionExpression: 'userId = :userId AND #sectionTabKey = :sectionTabKey',
      ExpressionAttributeNames: {
        '#sectionTabKey': 'section#tabkey',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':sectionTabKey': sectionTabKey,
      },
    }));

    return Response.json({ filters: result.Items || [] });
  } catch (error) {
    console.error('Error fetching filters:', error);
    return Response.json({ error: 'Failed to fetch filters' }, { status: 500 });
  }
} 