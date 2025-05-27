# Inkhub Admin - Shopify, Pinterest, Design Library Analytics

This project is a [Next.js](https://nextjs.org) admin dashboard for Inkhub, featuring advanced analytics, universal navigation, and a full-featured Design Library. It is bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features Implemented

### Universal Navigation & Layout
- **Universal Tab System**: Persistent, global tab bar for all major sections (Shopify, Pinterest, Design Library, etc.), with open/close/switch and state saved in localStorage.
- **Universal Analytics Bar**: Reusable analytics controls (filter, group, aggregate) that adapt to the current section/tab, fully wired to DataView for live analytics.
- **Universal Operation Bar**: Reusable operation/action bar below analytics, with context-aware actions (Download, Upload, etc.) and access to filtered/grouped data.
- **Secondary Sidebar**: Context-sensitive, collapsible sidebar for section navigation, with support for removing sections and redirecting when the last is closed.

### DataView Component
- **Highly Customizable**: Table, grid, and card views, with easy-to-modify layout, effects, and spacing via props.
- **Responsive**: All views and modals are mobile-friendly and adapt to large screens.
- **Tag Filtering & Search**: Filter by tags and search by any field.
- **Edit/Delete Modals**: Responsive modals for editing and deleting items, with clean UX.
- **Paginated View**: Supports paginated data loading with a Next button for all major sections.

### Shopify Section
- **Tabbed Interface**: Orders, Products, and Collections, managed by the universal tab system.
- **Analytics Bar**: Dynamic controls for filtering, grouping, and aggregation, adapting to the active tab.
- **Orders Analytics**: Filter by status, group by status/customer/date, aggregate by count/sum/average.
- **Products Analytics**: Filter by status, group by type/vendor, aggregate by count/sum inventory.
- **Collections Analytics**: (Implementation pending)
- **Redux Integration**: Centralized state management for Shopify data.
- **Modern UI**: Responsive, scrollable DataView with search, sorting, and multiple view types.
- **Disk Cache & Pagination**: Orders and Products use disk-based caching and paginated API with a Next button for efficient data loading.

### Pinterest Section
- **Boards & Pins**: DataView for boards and pins, with analytics and operations.
- **Analytics Bar**: Filter/group/aggregate pins and boards.
- **Redux Integration**: Centralized state management for Pinterest data.
- **Disk Cache & Pagination**: Boards and Pins use disk-based caching and paginated API with a Next button for efficient data loading.

### Design Library Section
- **CRUD Operations**: Create, Read, Update, and Delete designs stored in DynamoDB.
- **Image Support**: Upload and display design images from S3, with public read access.
- **Table, Grid, and Card Views**: Switch between layouts, with modals for details and editing.
- **Tag Filtering & Search**: Filter by tags and search by any field.
- **Redux Integration**: Centralized state management for design data.
- **Disk Cache & Pagination**: Design Library uses disk-based caching and paginated API with a Next button for efficient data loading.

### AWS & DynamoDB Integration
- Uses AWS SDK v3 for DynamoDB access.
- Table names are configurable via environment variables:
  - `SHOPIFY_ORDERS_TABLE`
  - `SHOPIFY_PRODUCTS_TABLE`
  - `DESIGN_TABLE` (for design library)
- Credentials and region are loaded from `.env.local` (see below).
- S3 bucket policy must allow public read for images.

### Powerful Disk Caching System (NEW)
- **Disk-Based Cache**: All major API routes (orders, products, pins, boards, designs) use a disk-based cache for fast, persistent, and scalable data access.
- **How It Works:**
  - Each API request checks the disk cache before querying DynamoDB.
  - If cached data is found and not expired, it is returned immediately (no DynamoDB call).
  - If not found or expired, data is fetched from DynamoDB, stored in the disk cache, and returned.
- **Cache Key Structure:**
  - Cache keys are based on the resource, page size (`limit`), and pagination key (`lastKey`).
  - Example: `shopify_orders:100:{"id":"12345"}` for the second page of orders with a limit of 100.
- **TTL (Time-to-Live):**
  - Default TTL is **5 minutes** (300,000 ms) for all cache entries.
  - Configurable per resource or globally in the cache utility.
- **Cache Invalidation:**
  - On any mutation (create/update/delete), the relevant cache keys are invalidated (deleted) to ensure fresh data on the next fetch.
  - The cache utility provides methods for `.get(key)`, `.set(key, value, ttl)`, `.delete(key)`, and `.clear()`.
- **Pagination Support:**
  - Each page of data is cached separately using its own cache key (based on `limit` and `lastKey`).
  - The frontend uses a Next button to load more data, which triggers a paginated API call and checks the cache for that page.
- **Why Disk Cache?**
  - Survives server restarts and scales better than in-memory cache for large datasets.
  - Reduces DynamoDB read costs and latency for repeated queries.
  - Enables efficient, persistent caching for paginated data.

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
