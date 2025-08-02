# Vercel Environment Variables Required

## AWS Configuration
- `AWS_REGION` - AWS region (e.g., us-east-1)
- `AWS_ACCESS_KEY_ID` - AWS access key for DynamoDB access
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for DynamoDB access

## AWS Cognito Authentication
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID` - Cognito User Pool ID
- `NEXT_PUBLIC_COGNITO_APP_CLIENT_ID` - Cognito App Client ID  
- `NEXT_PUBLIC_COGNITO_REGION` - AWS region for Cognito

## DynamoDB Tables
- `DESIGN_TABLE` - DynamoDB table for design library
- `SHOPIFY_ORDERS_TABLE` - DynamoDB table for Shopify orders
- `SHOPIFY_PRODUCTS_TABLE` - DynamoDB table for Shopify products
- `PINTEREST_PINS_TABLE` - DynamoDB table for Pinterest pins
- `PINTEREST_BOARDS_TABLE` - DynamoDB table for Pinterest boards

## Redis Cache (Optional)
- `REDIS_HOST` - Redis server host
- `REDIS_PORT` - Redis server port (default: 6379)
- `REDIS_PASSWORD` - Redis password (if required)

## External Services
- `NEXT_PUBLIC_BASE_URL` - Base URL for the application (optional, defaults to localhost:3000)

## Notes
- All `NEXT_PUBLIC_*` variables are exposed to the client
- AWS credentials should have minimal required permissions
- Ensure all DynamoDB tables exist in the specified AWS region
- The external cache API at `8jo83n4y51.execute-api.us-east-1.amazonaws.com` must be accessible 