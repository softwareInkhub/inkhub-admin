# Inkhub Admin - Shopify & Design Library Analytics

This project is a [Next.js](https://nextjs.org) admin dashboard for Inkhub, featuring advanced analytics for Shopify data and a full-featured Design Library. It is bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

### Design Library Section
- **CRUD Operations**: Create, Read, Update, and Delete designs stored in DynamoDB (`admin-design-image` table, configurable via env)
- **Image Support**: Upload and display design images from S3, with public read access
- **Table, Grid, and Card Views**: Switch between table, grid (image-only with modal details), and card layouts
- **Responsive Modals**: Click an image in grid view to open a details modal, with options to edit or delete
- **Edit Modal**: Separate, responsive edit modal with a two-column layout on desktop
- **Tag Filtering**: Filter designs by tags using a dropdown above the search bar
- **Search**: Search designs by any field
- **Redux Integration**: Centralized state management for design data
- **Modern, Responsive UI**: All views and modals are mobile-friendly and adapt to large screens

### AWS & DynamoDB Integration
- Uses AWS SDK v3 for DynamoDB access
- Table names are configurable via environment variables:
  - `SHOPIFY_ORDERS_TABLE`
  - `SHOPIFY_PRODUCTS_TABLE`
  - `DESIGN_TABLE` (for design library)
- Credentials and region are loaded from `.env.local` (see below)
- S3 bucket policy must allow public read for images

### Environment Setup
Create a `.env.local` file in the project root:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
SHOPIFY_ORDERS_TABLE=shopify_inkhub_get_orders
SHOPIFY_PRODUCTS_TABLE=shopify_inkhub_get_products
DESIGN_TABLE=admin-design-image
```
**Note:** `.env.local` is gitignored for security.

### Security Best Practices
- **Never commit secrets**: `.env.local` is in `.gitignore`.
- **Rotate AWS credentials** if they are ever exposed.
- **Use environment variables** for all sensitive config.
- **S3 Bucket Policy**: Ensure your S3 bucket allows public read for images if you want them to display in the app.

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
