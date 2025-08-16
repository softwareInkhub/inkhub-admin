# Products Page - Reusable Components

This directory contains a modular, reusable component structure for the Shopify Products page that matches the orders page functionality.

## 📁 Directory Structure

```
products/
├── components/
│   ├── ProductHeader.tsx          # Header with title, export, more actions, add product
│   ├── KPICard.tsx               # Individual KPI metric card with visual effects
│   ├── KPIGrid.tsx               # Grid layout for KPI cards
│   ├── ColumnHeader.tsx          # Table header with filtering capabilities
│   ├── ProductTable.tsx          # Complete table with headers and data rows
│   ├── Pagination.tsx            # Pagination controls
│   ├── SearchControls.tsx        # Search input, filters, view controls
│   └── index.ts                  # Component exports
├── types/
│   └── index.ts                  # Shared TypeScript interfaces
├── utils/
│   └── index.ts                  # Shared utility functions
├── page.tsx                      # Main page component
└── README.md                     # This file
```

## 🧩 Reusable Components

### 1. ProductHeader
- **Purpose**: Page header with title, export button, more actions dropdown, add product button
- **Props**: All handler functions for header actions
- **Features**: Gradient styling, hover effects, dropdown functionality
- **Actions**: Export, Import Products, Print Products, Settings, Add product

### 2. KPICard
- **Purpose**: Individual KPI metric display with visual effects
- **Props**: Label, metric data, gradient colors, icon
- **Features**: Animated backgrounds, hover effects, trend indicators (up/down/neutral)
- **Metrics**: Total Products, Active Products, Draft Products, Total Value, Average Price, Low Stock Items

### 3. KPIGrid
- **Purpose**: Grid layout for multiple KPI cards
- **Props**: KPI metrics object
- **Features**: Responsive grid, consistent spacing
- **Layout**: 6-column grid on large screens, responsive on smaller screens

### 4. ColumnHeader
- **Purpose**: Table column header with filtering capabilities
- **Props**: Title, column key, filter type, options, filter state
- **Features**: Multiple filter types (text, select, multi-select, date), dropdown positioning
- **Filter Types**: Text search, dropdown selection, multi-select, date picker

### 5. ProductTable
- **Purpose**: Complete data table with headers and rows
- **Props**: Products data, selection state, filter handlers
- **Features**: 
  - Checkbox selection (individual and bulk)
  - Row clicking for product preview
  - Status badges with colors
  - Product images with fallback icons
  - Action buttons (View, Edit, Delete)
  - Responsive design
  - Hover effects

### 6. Pagination
- **Purpose**: Pagination controls with page navigation
- **Props**: Current page, total pages, items per page
- **Features**: Smart page number display, items per page selector
- **Options**: 25, 50, 100, 250 items per page

### 7. SearchControls
- **Purpose**: Search input and control buttons
- **Props**: Search state, filter toggles, view mode
- **Features**: 
  - Advanced search builder
  - Filter toggles
  - View mode switching (Table, Grid, List)
  - Custom filter management
  - Additional controls dropdown

## 📊 Shared Types

### Product Interface
```typescript
interface Product {
  id: string
  title: string
  handle: string
  vendor: string
  productType: string
  price: number
  compareAtPrice?: number
  cost: number
  inventoryQuantity: number
  status: 'active' | 'draft' | 'archived'
  publishedAt?: string
  createdAt: string
  updatedAt: string
  tags: string[]
  images: string[]
  description?: string
  variants: ProductVariant[]
  collections: string[]
  selected?: boolean
  salesChannels?: number
  category?: string
}
```

### KPI Metric Interface
```typescript
interface KPIMetric {
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
}
```

### Search Condition Interface
```typescript
interface SearchCondition {
  field: string
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with'
  value: string
  connector: 'AND' | 'OR'
}
```

## 🔧 Shared Utilities

### Data Generation
- `generateProducts(count)`: Generate sample product data with realistic Shopify data
- `calculateKPIMetrics(products)`: Calculate KPI metrics from products

### UI Helpers
- `getStatusBadge(status, type)`: Get CSS classes for status badges
- `getUniqueValues(products, field)`: Get unique values for filter options
- `getUniqueTags(products)`: Get unique tags from products
- `filterProducts(products, activeFilter, searchQuery, columnFilters)`: Filter products based on criteria

### Data Processing
- Realistic product titles (tattoo-related products for INKHUB)
- Product images with fallback icons
- Variant generation
- Tag and collection assignment
- Price and inventory calculations

## 🚀 Usage Example

```typescript
import { 
  ProductHeader, 
  KPIGrid, 
  ProductTable, 
  Pagination, 
  SearchControls 
} from './components'
import { Product } from './types'
import { generateProducts, calculateKPIMetrics } from './utils'

// Generate sample data
const products = generateProducts(1000)
const kpiMetrics = calculateKPIMetrics(products)

// Use components
<ProductHeader 
  showHeaderDropdown={showHeaderDropdown}
  setShowHeaderDropdown={setShowHeaderDropdown}
  onExport={handleExport}
  onImport={handleImport}
  onPrint={handlePrint}
  onSettings={handleSettings}
  onCreateProduct={handleCreateProduct}
/>

<KPIGrid kpiMetrics={kpiMetrics} />

<ProductTable 
  currentProducts={currentProducts}
  selectedProducts={selectedProducts}
  onSelectProduct={handleSelectProduct}
  onSelectAll={handleSelectAll}
  onProductClick={handleProductClick}
  getStatusBadge={getStatusBadgeForProduct}
  activeColumnFilter={activeColumnFilter}
  columnFilters={columnFilters}
  onFilterClick={toggleColumnFilter}
  onColumnFilterChange={handleColumnFilterChange}
  getUniqueValues={getUniqueValuesForField}
  getUniqueTags={getUniqueTagsFromProducts}
/>

<Pagination 
  currentPage={currentPage}
  totalPages={totalPages}
  itemsPerPage={itemsPerPage}
  totalItems={filteredProducts.length}
  onPageChange={handlePageChange}
  onItemsPerPageChange={handleItemsPerPageChange}
/>
```

## ✨ Features

### 1. Header Section
- **Title**: "Products" with gradient styling
- **Action Buttons**: Export, More actions dropdown, Add product
- **More Actions**: Import Products, Print Products, Settings
- **Visual Effects**: Gradient backgrounds, hover animations, scale effects

### 2. KPI Metrics Dashboard
- **6 Key Metrics**: Total Products, Active Products, Draft Products, Total Value, Average Price, Low Stock Items
- **Visual Design**: Color-coded cards with gradients and icons
- **Data Display**: Values, change percentages, trend indicators (up/down/neutral)
- **Responsive Grid**: 2-6 columns based on screen size

### 3. Advanced Filtering System
- **Filter Types**: 
  - Default filters (All, Active, Draft, Archived)
  - Custom filters (High-value products, Low stock products, etc.)
  - Column-specific filters (text, select, multi-select, date)
  - Advanced search builder with multiple conditions

- **Filter Features**:
  - Hide/show default filters
  - Add custom filter conditions
  - Multi-condition search (AND/OR logic)
  - Real-time filter application
  - Filter state persistence

### 4. Search & Controls
- **Basic Search**: Text input with placeholder
- **Advanced Search**: Multi-condition builder
- **View Modes**: Table, Grid, List views
- **Additional Controls**: Filter toggle, view options, bulk actions

### 5. Data Table (Main View)
- **Columns**: 
  - Checkbox (selection)
  - Product (with image, title, and description)
  - Status (Active/Draft/Archived with colors)
  - Inventory (with stock level indicators)
  - Price (with compare-at-price)
  - Type, Vendor, Category
  - Tags (with overflow handling)
  - Created/Updated dates
  - Actions (View, Edit, Delete)

- **Features**:
  - Row selection (individual and bulk)
  - Row clicking for product preview
  - Status badges with colors
  - Product images with fallback icons
  - Hover effects
  - Responsive design

### 6. Pagination System
- **Smart Pagination**: Page numbers with ellipsis
- **Items Per Page**: 25, 50, 100, 250 options
- **Navigation**: Previous/Next buttons
- **Info Display**: "Showing X to Y of Z products"

### 7. Modal System
- **Preview Modal**: Product details view with image and information
- **Export Modal**: Format selection (CSV, Excel, PDF)
- **Import Modal**: File upload interface
- **Print Modal**: Print options (List, Cards)

## 🎨 Design & UX Features

### Visual Design
- **Color Scheme**: Professional gray/blue/green palette
- **Gradients**: Subtle gradient backgrounds and text
- **Animations**: Hover effects, scale transforms, transitions
- **Icons**: Lucide React icons throughout
- **Typography**: Consistent font weights and sizes

### Interactive Elements
- **Hover States**: All clickable elements have hover effects
- **Focus States**: Proper focus indicators for accessibility
- **Loading States**: Skeleton loading for data
- **Error Handling**: Error states and retry mechanisms

### Responsive Design
- **Mobile**: Adaptive layouts for small screens
- **Tablet**: Optimized for medium screens
- **Desktop**: Full-featured interface
- **Breakpoints**: Tailwind CSS responsive classes

## ⚡ Performance Features

### Data Management
- **Sample Data**: 1,000 generated products with realistic data
- **Filtering**: Client-side filtering with memoization
- **Pagination**: Efficient data slicing
- **Search**: Debounced search functionality

### State Management
- **Local State**: React useState for component state
- **Global State**: Zustand store integration
- **Persistence**: Filter state saved to localStorage
- **Optimization**: useMemo and useCallback for performance

## 🔄 Integration Points

### Store Integration
- **Tab Management**: Integrated with app store
- **Navigation**: Proper routing and navigation
- **State Sharing**: Global state management

### API Integration
- **Data Fetching**: Ready for API integration
- **Error Handling**: Comprehensive error states
- **Loading States**: Proper loading indicators

## ✨ Benefits

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be used in other parts of the application
3. **Maintainability**: Easy to update individual components
4. **Type Safety**: Shared TypeScript interfaces ensure consistency
5. **Performance**: Components can be optimized individually
6. **Testing**: Each component can be tested in isolation
7. **Image Display**: Products show images with proper fallbacks
8. **Realistic Data**: Sample data matches real-world product scenarios

## 📝 Next Steps

1. Add Grid and List view components
2. Add component tests
3. Create storybook stories for components
4. Add component documentation
5. Implement error boundaries
6. Add loading states
7. Add bulk operations functionality
8. Implement real API integration

## 🔗 Related Files

- **Orders Page**: Similar structure and functionality
- **Shared Components**: Common UI components
- **Store**: Global state management
- **Utils**: Shared utility functions
