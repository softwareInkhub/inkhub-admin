import { NextResponse } from 'next/server';
import { CognitoIdentityProviderClient, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';

export async function GET() {
  const client = new CognitoIdentityProviderClient({ region: process.env.NEXT_PUBLIC_COGNITO_REGION });
  const command = new ListUsersCommand({
    UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    Limit: 60,
  });
  try {
    const response = await client.send(command);
    const users = (response.Users || []).map(u => ({
      username: u.Username,
      email: u.Attributes?.find(attr => attr.Name === 'email')?.Value || '',
      role: u.Attributes?.find(attr => attr.Name === 'custom:role')?.Value || '',
    }));
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
} 