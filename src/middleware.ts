import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';
import { authConfig } from './auth.config';

// Construct the URL for Cognito's public keys (JWKS)
const jwksUri = `https://cognito-idp.${process.env.NEXT_PUBLIC_COGNITO_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID}/.well-known/jwks.json`;
const JWKS = jose.createRemoteJWKSet(new URL(jwksUri));

// The main middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Try to get the ID token from the cookies
  const token = request.cookies.get('id_token')?.value;

  // Find a matching role configuration for the current path
  const requiredRoles = Object.entries(authConfig.roles).find(([path]) =>
    pathname.startsWith(path)
  )?.[1];

  // If the page doesn't require any specific roles, let the request pass
  if (!requiredRoles) {
    return NextResponse.next();
  }

  // If the page is protected but there's no token, redirect to login
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = authConfig.pages.signIn;
    return NextResponse.redirect(url);
  }

  try {
    // Verify the token using the public keys from Cognito
    const { payload } = await jose.jwtVerify(token, JWKS);
    
    // Extract the user's role from the token payload
    const userRole = payload['custom:role'] as string;

    // If the user's role is not in the list of required roles, redirect to unauthorized page
    if (!userRole || !requiredRoles.includes(userRole)) {
      const url = request.nextUrl.clone();
      url.pathname = authConfig.pages.unauthorized;
      return NextResponse.redirect(url);
    }

    // If all checks pass, allow the user to proceed
    return NextResponse.next();

  } catch (error) {
    // If token verification fails (e.g., expired or invalid), redirect to login
    console.error('Token verification failed:', error);
    const url = request.nextUrl.clone();
    url.pathname = authConfig.pages.signIn;
    // Clear the invalid cookie
    const response = NextResponse.redirect(url);
    response.cookies.delete('id_token');
    return response;
  }
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