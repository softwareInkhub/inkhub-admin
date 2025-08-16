# Orders Page - Reusable Components

This directory contains a modular, reusable component structure for the Shopify Orders page.

## 📁 Directory Structure

```
orders/
├── components/
│   ├── OrderHeader.tsx          # Header with title, export, more actions, create order
│   ├── KPICard.tsx              # Individual KPI metric card with visual effects
│   ├── KPIGrid.tsx              # Grid layout for KPI cards
│   ├── ColumnHeader.tsx         # Table header with filtering capabilities
│   ├── OrderTable.tsx           # Complete table with headers and data rows
│   ├── Pagination.tsx           # Pagination controls
│   ├── SearchControls.tsx       # Search input, filters, view controls
│   └── index.ts                 # Component exports
├── types/
│   └── index.ts                 # Shared TypeScript interfaces
├── utils/
│   └── index.ts                 # Shared utility functions
├── page.tsx                     # Main page component (to be refactored)
└── README.md                    # This file
```

## 🧩 Reusable Components

### 1. OrderHeader
- **Purpose**: Page header with title, export button, more actions dropdown, create order button
- **Props**: All handler functions for header actions
- **Features**: Gradient styling, hover effects, dropdown functionality

### 2. KPICard
- **Purpose**: Individual KPI metric display with visual effects
- **Props**: Label, metric data, gradient colors, icon
- **Features**: Animated backgrounds, hover effects, trend indicators

### 3. KPIGrid
- **Purpose**: Grid layout for multiple KPI cards
- **Props**: KPI metrics object
- **Features**: Responsive grid, consistent spacing

### 4. ColumnHeader
- **Purpose**: Table column header with filtering capabilities
- **Props**: Title, column key, filter type, options, filter state
- **Features**: Multiple filter types (text, select, multi-select, date), dropdown positioning

### 5. OrderTable
- **Purpose**: Complete data table with headers and rows
- **Props**: Orders data, selection state, filter handlers
- **Features**: Checkbox selection, row clicking, status badges, responsive design

### 6. Pagination
- **Purpose**: Pagination controls with page navigation
- **Props**: Current page, total pages, items per page
- **Features**: Smart page number display, items per page selector

### 7. SearchControls
- **Purpose**: Search input and control buttons
- **Props**: Search state, filter toggles, view mode
- **Features**: Advanced search, filter toggles, view mode switching

## 📊 Shared Types

### Order Interface
```typescript
interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  phone?: string
  total: number
  status: 'paid' | 'unpaid' | 'refunded' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  fulfillmentStatus: 'unfulfilled' | 'fulfilled' | 'partial'
  financialStatus: 'paid' | 'pending' | 'refunded'
  items: any[]
  createdAt: string
  updatedAt: string
  // ... additional fields
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

## 🔧 Shared Utilities

### Data Generation
- `generateOrders(count)`: Generate sample order data
- `calculateKPIMetrics(orders)`: Calculate KPI metrics from orders

### UI Helpers
- `getStatusBadge(status, type)`: Get CSS classes for status badges
- `getUniqueValues(orders, field)`: Get unique values for filter options
- `getUniqueTags(orders)`: Get unique tags from orders
- `getPageNumbers(currentPage, totalPages)`: Generate pagination numbers

## 🚀 Usage Example

```typescript
import { 
  OrderHeader, 
  KPIGrid, 
  OrderTable, 
  Pagination, 
  SearchControls 
} from './components'
import { Order } from './types'
import { generateOrders, calculateKPIMetrics } from './utils'

// Generate sample data
const orders = generateOrders(1000)
const kpiMetrics = calculateKPIMetrics(orders)

// Use components
<OrderHeader 
  showHeaderDropdown={showHeaderDropdown}
  setShowHeaderDropdown={setShowHeaderDropdown}
  onExport={handleExport}
  // ... other props
/>

<KPIGrid kpiMetrics={kpiMetrics} />

<OrderTable 
  currentOrders={currentOrders}
  selectedOrders={selectedOrders}
  // ... other props
/>

<Pagination 
  currentPage={currentPage}
  totalPages={totalPages}
  // ... other props
/>
```

## ✨ Benefits

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be used in other parts of the application
3. **Maintainability**: Easy to update individual components
4. **Type Safety**: Shared TypeScript interfaces ensure consistency
5. **Performance**: Components can be optimized individually
6. **Testing**: Each component can be tested in isolation

## 🔄 Migration Status

- ✅ Components created
- ✅ Types defined
- ✅ Utilities extracted
- ⏳ Main page refactoring (in progress)
- ⏳ Component integration (pending)

## 📝 Next Steps

1. Refactor main `page.tsx` to use new components
2. Add component tests
3. Create storybook stories for components
4. Add component documentation
5. Implement error boundaries
6. Add loading states
