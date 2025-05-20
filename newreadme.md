# Inkhub Admin - Shopify Analytics

This project is a [Next.js](https://nextjs.org) admin dashboard for Inkhub, featuring advanced analytics for Shopify data. It is bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features Implemented

### Shopify Section
- **Tabbed Interface**: Orders, Products, and Collections, with tab management (open, close, switch).
- **Analytics Bar**: Dynamic controls for filtering, grouping, and aggregation, adapting to the active tab.
- **Orders Analytics**:
  - Filter by status (paid, pending, refunded, etc.)
  - Group by status, customer, or date
  - Aggregate by count, sum, or average
  - Data fetched from DynamoDB (`shopify_inkhub_get_orders` table, configurable via env)
- **Products Analytics**:
  - Filter by status (active, draft)
  - Group by type or vendor
  - Aggregate by count or sum inventory
  - Data fetched from DynamoDB (`shopify_inkhub_get_products` table, configurable via env)
- **Collections Analytics**: (Implementation pending)
- **Redux Integration**: Centralized state management for Shopify data
- **Lodash**: Used for grouping and aggregation logic
- **Modern UI**: Responsive, scrollable DataView with search, sorting, and multiple view types (table, grid, card)

### AWS & DynamoDB Integration
- Uses AWS SDK v3 for DynamoDB access
- Table names are configurable via environment variables:
  - `SHOPIFY_ORDERS_TABLE`
  - `SHOPIFY_PRODUCTS_TABLE`
- Credentials and region are loaded from `.env.local` (see below)

### Environment Setup
Create a `.env.local` file in the project root:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
SHOPIFY_ORDERS_TABLE=shopify_inkhub_get_orders
SHOPIFY_PRODUCTS_TABLE=shopify_inkhub_get_products
```
**Note:** `.env.local` is gitignored for security.

### Security Best Practices
- **Never commit secrets**: `.env.local` is in `.gitignore`.
- **Rotate AWS credentials** if they are ever exposed.
- **Use environment variables** for all sensitive config.

## Getting Started

Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Deploy on Vercel
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
