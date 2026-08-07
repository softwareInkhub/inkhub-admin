export const authConfig = {
  // Cognito configuration
  cognito: {
    region: process.env.NEXT_PUBLIC_COGNITO_REGION,
    userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    clientId: process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID,
  },
  
  // JWT verification settings
  jwt: {
    issuer: `https://cognito-idp.${process.env.NEXT_PUBLIC_COGNITO_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID}`,
    audience: process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID,
  },
  
  // Protected routes that require authentication
  protectedRoutes: [
    '/user-management',
    '/shopify',
    '/pinterest', 
    '/design-library',
    '/settings',
  ],
  
  // Public routes that don't require authentication
  publicRoutes: [
    '/login',
    '/unauthorized',
    '/api/auth',
  ],
}; 