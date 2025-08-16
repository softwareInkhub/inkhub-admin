# INKHUB Admin Panel

A high-performance, lightweight, and visually structured admin panel built with Next.js, React.js, and Tailwind CSS. Designed to handle large datasets (100K+ records) efficiently without any lag in loading image or textual data.

## 🚀 Features

### Core Features
- **High-Performance Data Handling**: Virtual scrolling for large datasets (100K+ records)
- **Responsive Design**: Mobile and tablet-friendly interface
- **Dark/Light Mode**: System preference support with theme toggle
- **Tab Management**: Pin/unpin tabs with session persistence
- **Collapsible Sidebar**: Space-efficient navigation
- **Role-Based Access Control (RBAC)**: Granular permissions system

### Navigation Structure
- **Dashboard**: Overview with statistics and system health
- **Apps**: 
  - Shopify (Orders, Products)
  - Pinterest (Dashboard, Pins, Boards)
- **Design Library**: Design management
- **Settings**: General, Health Check, Indexing
- **User Management**: Register, Users List, Access Control

### Performance Optimizations
- Virtual scrolling with TanStack Virtual
- Image optimization with Next.js Image
- Lazy loading for non-critical components
- SWC compiler for fast builds
- Efficient state management with Zustand

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **UI Library**: React.js 18
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand with persistence
- **Data Tables**: TanStack Table v8 with virtual scrolling
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: SWR for caching

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inkhub-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
inkhub-admin/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin layout group
│   │   ├── dashboard/            # Dashboard pages
│   │   ├── apps/                 # App integrations
│   │   │   ├── shopify/          # Shopify integration
│   │   │   └── pinterest/        # Pinterest integration
│   │   ├── design-library/       # Design management
│   │   ├── settings/             # System settings
│   │   └── user-management/      # User management
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/                   # Reusable components
│   ├── navbar.tsx               # Top navigation
│   ├── sidebar.tsx              # Sidebar navigation
│   ├── tabbar.tsx               # Tab management
│   ├── data-table.tsx           # High-performance table
│   └── ui/                      # UI components
├── lib/                         # Utilities and stores
│   ├── store.ts                 # Zustand store
│   └── utils.ts                 # Utility functions
├── public/                      # Static assets
└── styles/                      # Additional styles
```

## 🎨 Design System

### Color Palette
- **Primary**: Indigo/Blue shades for main actions
- **Secondary**: Slate/Neutral for backgrounds and text
- **Semantic Colors**: Green (success), Red (error), Yellow (warning)

### Typography
- **Font Sizes**: 12px, 14px, 16px, 20px
- **Font Weights**: Regular (400), Semibold (600)
- **Line Heights**: Optimized for readability

### Spacing
- **8-Point Grid**: All spacing divisible by 8 or 4
- **Consistent Gutters**: Maintained throughout the interface

## 🔐 Access Control

The admin panel includes a comprehensive RBAC system with:

### User Roles
- **Admin**: Full access to all features
- **Editor**: View, create, and edit (no delete)
- **Viewer**: Read-only access
- **Marketing**: Pinterest and design access
- **Operations**: Shopify order management

### Permission Matrix
- **Shopify Module**: Orders and Products (View/Create/Edit/Delete)
- **Pinterest Module**: Pins and Boards (View/Create/Edit/Delete)
- **Design Library**: Designs (View/Create/Edit/Delete)

## 📊 Performance Features

### Data Handling
- **Virtual Scrolling**: Efficient rendering of large datasets
- **Pagination**: Configurable page sizes (10-50 items)
- **Search & Filtering**: Real-time search with debouncing
- **Sorting**: Multi-column sorting with visual indicators

### Optimization Techniques
- **Image Optimization**: Next.js Image with WebP/AVIF support
- **Code Splitting**: Dynamic imports for non-critical components
- **Caching**: SWR for data caching and synchronization
- **Bundle Optimization**: Tree shaking and minification

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Variables
Create a `.env.local` file for environment-specific configuration:

```env
NEXT_PUBLIC_API_URL=your-api-url
NEXT_PUBLIC_APP_NAME=INKHUB Admin
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Consistent code formatting
- **Tailwind CSS**: Utility-first styling

## 📱 Responsive Design

The admin panel is fully responsive with:
- **Mobile**: Optimized for small screens
- **Tablet**: Enhanced layout for medium screens
- **Desktop**: Full-featured interface
- **Touch Support**: Optimized for touch interactions

## 🎯 Key Features

### Tab Management
- **Pin/Unpin**: Persist important tabs across sessions
- **Close Tabs**: Remove unnecessary tabs
- **Tab Navigation**: Quick switching between open pages

### Sidebar Navigation
- **Collapsible**: Save screen real estate
- **Expandable Sections**: Organized navigation hierarchy
- **Active States**: Visual feedback for current page

### Data Visualization
- **Statistics Cards**: Key metrics at a glance
- **Charts**: Visual data representation
- **Real-time Updates**: Live data synchronization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**INKHUB Admin Panel** - Built with ❤️ using Next.js, React, and Tailwind CSS 