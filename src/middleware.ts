import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';
import { authConfig } from './auth.config';

// Construct the URL for Cognito's public keys (JWKS)
const jwksUri = `https://cognito-idp.${process.env.NEXT_PUBLIC_COGNITO_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID}/.well-known/jwks.json`;
const JWKS = jose.createRemoteJWKSet(new URL(jwksUri));

// The main middleware function
export async function middleware(request: NextRequest) {
  // Remove all role-based protection logic
  // Optionally, keep authentication (token verification) if you still want to require login
  // Otherwise, just allow all requests to proceed
  return NextResponse.next();
}

// Use a 'matcher' to specify which paths this middleware should run on
export const config = {
  matcher: [
    // Add all paths you want to protect here
    '/user-management/:path*',
    '/shopify/:path*',
    '/pinterest/:path*',
    '/design-library/:path*',
    '/settings/:path*',
  ],
}; 