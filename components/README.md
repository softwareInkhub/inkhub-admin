# Admin Panel Reusable Components

This directory contains a comprehensive set of reusable components designed to provide consistency and maintainability across the admin panel.

## 📁 Component Structure

```
components/
├── ui/                    # Reusable UI components
│   ├── PageHeader.tsx    # Page headers with icons and actions
│   ├── StatsCard.tsx     # Statistics cards with trends
│   ├── SearchFilter.tsx  # Search and filter controls
│   ├── ActionButtons.tsx # Action button groups
│   ├── StatusBadge.tsx   # Status indicators
│   ├── DataGrid.tsx      # Grid layout for data
│   ├── Pagination.tsx    # Pagination controls
│   ├── Modal.tsx         # Modal dialogs
│   └── index.ts          # Component exports
├── layout/               # Layout components
│   └── AdminLayout.tsx   # Main admin layout wrapper
├── common/               # Specialized components
├── sidebar.tsx           # Navigation sidebar
├── navbar.tsx            # Top navigation bar
├── tabbar.tsx            # Tab management
└── data-table.tsx        # Data table component
```

## 🎯 Usage Examples

### 1. PageHeader Component

```tsx
import { PageHeader } from '@/components/ui';
import { Palette } from 'lucide-react';

export default function DesignLibraryPage() {
  return (
    <PageHeader
      title="Design Library"
      description="Manage and organize your design assets"
      icon={Palette}
    >
      <button className="btn-primary">Create Design</button>
    </PageHeader>
  );
}
```

### 2. StatsCard Component

```tsx
import { StatsCard } from '@/components/ui';
import { Users, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard
        title="Total Users"
        value="1,234"
        description="Active users this month"
        icon={Users}
        trend={{ value: 12, isPositive: true }}
      />
      <StatsCard
        title="Revenue"
        value="$45,678"
        description="Total revenue this quarter"
        icon={TrendingUp}
        trend={{ value: 8, isPositive: true }}
      />
    </div>
  );
}
```

### 3. SearchFilter Component

```tsx
import { SearchFilter } from '@/components/ui';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');

  const filters = {
    status: {
      label: 'Status',
      value: status,
      options: [
        { label: 'All', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      onChange: setStatus,
    },
    category: {
      label: 'Category',
      value: category,
      options: [
        { label: 'All', value: 'all' },
        { label: 'Electronics', value: 'electronics' },
        { label: 'Clothing', value: 'clothing' },
      ],
      onChange: setCategory,
    },
  };

  const handleClearAll = () => {
    setSearch('');
    setStatus('all');
    setCategory('all');
  };

  return (
    <SearchFilter
      searchValue={search}
      onSearchChange={setSearch}
      filters={filters}
      onClearAll={handleClearAll}
      placeholder="Search products..."
    />
  );
}
```

### 4. ActionButtons Component

```tsx
import { ActionButtons } from '@/components/ui';
import { Plus, Download, Trash } from 'lucide-react';

export default function ProductsPage() {
  const buttons = [
    {
      icon: Plus,
      label: 'Add Product',
      onClick: () => console.log('Add product'),
      variant: 'primary' as const,
    },
    {
      icon: Download,
      label: 'Export',
      onClick: () => console.log('Export'),
      variant: 'secondary' as const,
    },
    {
      icon: Trash,
      label: 'Delete Selected',
      onClick: () => console.log('Delete'),
      variant: 'danger' as const,
      disabled: selectedItems.length === 0,
    },
  ];

  return <ActionButtons buttons={buttons} />;
}
```

### 5. StatusBadge Component

```tsx
import { StatusBadge, CompletedBadge, PendingBadge } from '@/components/ui';

export default function OrdersPage() {
  return (
    <div>
      {/* Auto-detected variant */}
      <StatusBadge status="completed" />
      
      {/* Explicit variant */}
      <StatusBadge status="pending" variant="warning" />
      
      {/* Predefined badges */}
      <CompletedBadge />
      <PendingBadge />
    </div>
  );
}
```

### 6. DataGrid Component

```tsx
import { DataGrid, GridItem } from '@/components/ui';

export default function DesignsPage() {
  const renderDesign = (design: Design) => (
    <GridItem key={design.id}>
      <img src={design.image} alt={design.name} className="w-full h-32 object-cover rounded" />
      <h3 className="font-semibold mt-2">{design.name}</h3>
      <p className="text-sm text-secondary-600">{design.description}</p>
      <StatusBadge status={design.status} className="mt-2" />
    </GridItem>
  );

  return (
    <DataGrid
      data={designs}
      renderItem={renderDesign}
      columns={4}
      gap="md"
      emptyMessage="No designs found"
    />
  );
}
```

### 7. Pagination Component

```tsx
import { Pagination } from '@/components/ui';

export default function ProductsPage() {
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
    />
  );
}
```

### 8. Modal Component

```tsx
import { Modal, ConfirmationModal } from '@/components/ui';

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>Open Modal</button>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Product"
        size="lg"
      >
        <form>
          {/* Form content */}
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => console.log('Confirmed')}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        variant="danger"
      />
    </>
  );
}
```

### 9. AdminLayout Component

```tsx
import { AdminLayout, AdminPage } from '@/components/layout';

export default function DashboardPage() {
  return (
    <AdminLayout>
      <AdminPage
        title="Dashboard"
        description="Overview of your admin panel"
      >
        {/* Page content */}
      </AdminPage>
    </AdminLayout>
  );
}
```

## 🎨 Visual Effects

All components include the following visual enhancements:

- **Animations**: `animate-fade-in`, `animate-slide-up`, `animate-slide-in-left`
- **Hover Effects**: `hover-lift` for interactive elements
- **Gradient Text**: `gradient-text` for headings
- **Glassmorphism**: `glass`, `backdrop-blur-sm` for modern effects
- **Shadows**: `shadow-soft`, `shadow-glow` for depth
- **Transitions**: Smooth state changes with `transition-all`

## 🔧 Customization

### Theme Colors
Components use semantic color classes that can be customized in `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: { /* primary colors */ },
      secondary: { /* secondary colors */ },
    }
  }
}
```

### Component Variants
Most components support multiple variants:

- **StatusBadge**: `default`, `success`, `warning`, `danger`, `info`
- **ActionButton**: `primary`, `secondary`, `danger`, `success`
- **Modal**: `sm`, `md`, `lg`, `xl`, `full`

## 📱 Responsive Design

All components are built with responsive design in mind:

- **Grid Components**: Automatically adjust columns based on screen size
- **Search Filters**: Stack vertically on mobile
- **Action Buttons**: Wrap and stack on smaller screens
- **Modals**: Full-width on mobile with proper padding

## ♿ Accessibility

Components include accessibility features:

- **Keyboard Navigation**: Tab order and focus management
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Contrast**: High contrast ratios for text
- **Focus Indicators**: Visible focus rings for keyboard users

## 🚀 Performance

- **Virtual Scrolling**: DataGrid supports virtual scrolling for large datasets
- **Lazy Loading**: Components load only when needed
- **Memoization**: Expensive operations are memoized
- **Bundle Splitting**: Components are tree-shakeable

## 🔄 State Management

Components integrate with the global Zustand store:

```tsx
import { useAppStore } from '@/lib/store';

// Access global state
const { sidebarOpen, setSidebarOpen } = useAppStore();
```

## 📝 Best Practices

1. **Consistent Naming**: Use semantic component names
2. **Props Interface**: Always define TypeScript interfaces
3. **Default Values**: Provide sensible defaults for optional props
4. **Error Handling**: Include proper error states
5. **Loading States**: Show loading indicators for async operations
6. **Empty States**: Handle empty data gracefully

## 🧪 Testing

Components are designed to be easily testable:

- **Props Testing**: All props are typed and documented
- **Event Handling**: Clear event handler interfaces
- **State Management**: Predictable state updates
- **Accessibility**: Built-in accessibility features

This component library provides a solid foundation for building consistent, maintainable, and user-friendly admin interfaces.
