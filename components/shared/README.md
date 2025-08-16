# INKHUB Admin - Shared Components Library

This directory contains all reusable components that can be used across different pages in the INKHUB Admin panel. The goal is to eliminate code duplication and provide a consistent user experience across all pages.

## 🏗️ Architecture

The shared components library is organized into several categories:

### Core Data Components
- **DataTable**: A flexible table component with sorting, filtering, and pagination
- **DataGrid**: A grid layout component for displaying items
- **DataCard**: A card component for displaying individual items

### Analytics Components
- **KPIGrid**: A grid of KPI cards showing metrics
- **KPICard**: Individual KPI card component
- **AnalyticsCard**: General analytics card component

### Search and Filter Components
- **SearchControls**: Main search interface with advanced filters
- **AdvancedSearchBuilder**: Builder for complex search conditions
- **FilterPanel**: Panel for managing filters
- **ColumnFilter**: Column-specific filtering

### Action Components
- **BulkActionsBar**: Bar for bulk actions when items are selected
- **ActionButtons**: Reusable action buttons
- **ExportModal**: Modal for exporting data
- **ImportModal**: Modal for importing data
- **BulkEditModal**: Modal for bulk editing
- **BulkDeleteModal**: Modal for bulk deletion

### Display Components
- **StatusBadge**: Badge for displaying status
- **ImageDisplay**: Component for displaying images with fallbacks
- **HighlightedText**: Text with search highlighting
- **Pagination**: Pagination component

### Layout Components
- **PageHeader**: Page header component
- **ViewToggle**: Toggle between different view modes
- **CardsPerRowDropdown**: Dropdown for selecting cards per row

### Page Template
- **PageTemplate**: Complete page template that combines all components

## 🎯 Usage

### Basic Usage with PageTemplate

```tsx
import { PageTemplate } from '@/components/shared'
import { Package } from 'lucide-react'

interface Product {
  id: string
  title: string
  price: number
  status: string
  createdAt: string
}

export default function ProductsPage() {
  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true }
  ]

  const kpiMetrics = {
    totalProducts: { value: 1250, change: 12.5, trend: 'up', label: 'Total Products' },
    activeProducts: { value: 980, change: 8.2, trend: 'up', label: 'Active Products' },
    totalValue: { value: 45000, change: -2.1, trend: 'down', label: 'Total Value' }
  }

  return (
    <PageTemplate
      title="Products"
      description="Manage your product catalog"
      icon={Package}
      data={products}
      columns={columns}
      kpiMetrics={kpiMetrics}
      onRowClick={(product) => console.log('Clicked:', product)}
      onBulkEdit={(updates) => console.log('Bulk edit:', updates)}
      onBulkDelete={() => console.log('Bulk delete')}
      onExport={(config) => console.log('Export:', config)}
      onImport={(file, config) => console.log('Import:', file, config)}
    />
  )
}
```

### Using Individual Components

```tsx
import { DataTable, SearchControls, KPIGrid } from '@/components/shared'
import { useDataTable } from '@/components/shared'

export default function CustomPage() {
  const {
    data,
    selectedItems,
    searchQuery,
    setSearchQuery,
    // ... other state and handlers
  } = useDataTable({
    initialData: products,
    itemsPerPage: 25
  })

  return (
    <div>
      <SearchControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        // ... other props
      />
      
      <DataTable
        data={data}
        columns={columns}
        selectedItems={selectedItems}
        // ... other props
      />
    </div>
  )
}
```

## 🔧 Configuration

### Table Columns

```tsx
const columns = [
  {
    key: 'title',
    label: 'Title',
    sortable: true,
    filterable: true,
    width: '200px',
    align: 'left',
    render: (value, row) => (
      <div className="font-medium">{value}</div>
    )
  }
]
```

### KPI Metrics

```tsx
const kpiMetrics = {
  totalItems: {
    value: 1250,
    change: 12.5,
    trend: 'up', // 'up' | 'down' | 'neutral'
    label: 'Total Items',
    icon: 'Package',
    color: 'bg-blue-100 text-blue-600'
  }
}
```

### Search Conditions

```tsx
const searchConditions = [
  {
    field: 'title',
    operator: 'contains', // 'contains' | 'equals' | 'starts_with' | 'ends_with'
    value: 'search term',
    connector: 'AND' // 'AND' | 'OR'
  }
]
```

## 🎨 Customization

### Custom Card Renderer

```tsx
<PageTemplate
  // ... other props
  renderCard={(item) => (
    <div className="custom-card">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  )}
/>
```

### Custom Grid Item Renderer

```tsx
<PageTemplate
  // ... other props
  renderGridItem={(item) => (
    <div className="custom-grid-item">
      <img src={item.image} alt={item.title} />
      <h3>{item.title}</h3>
    </div>
  )}
/>
```

## 🚀 Features

### ✅ Implemented Features
- [x] Responsive design
- [x] Search and filtering
- [x] Sorting
- [x] Pagination
- [x] Bulk actions
- [x] Export/Import
- [x] Multiple view modes (table, grid, card)
- [x] KPI metrics display
- [x] Advanced search builder
- [x] Column filtering
- [x] Full-screen mode
- [x] Keyboard navigation
- [x] Accessibility support

### 🔄 Planned Features
- [ ] Drag and drop reordering
- [ ] Inline editing
- [ ] Real-time updates
- [ ] Advanced analytics
- [ ] Custom themes
- [ ] Multi-language support

## 📝 Best Practices

1. **Use PageTemplate for new pages**: It provides all the common functionality out of the box
2. **Extend existing components**: Don't duplicate functionality, extend the shared components
3. **Follow the type system**: Use the provided TypeScript interfaces for type safety
4. **Consistent styling**: Use the provided Tailwind classes for consistent styling
5. **Accessibility**: All components include proper ARIA labels and keyboard navigation

## 🐛 Troubleshooting

### Common Issues

1. **Type errors**: Make sure your data extends the `BaseEntity` interface
2. **Styling issues**: Check that Tailwind CSS is properly configured
3. **Performance issues**: Use the `useDataTable` hook for large datasets
4. **Missing icons**: Install and import Lucide React icons

### Getting Help

1. Check the component documentation
2. Look at existing page implementations
3. Review the TypeScript interfaces
4. Check the console for errors

## 📚 API Reference

See the individual component files for detailed API documentation and examples.
