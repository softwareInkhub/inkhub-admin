'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchProducts } from '@/store/slices/shopifySlice';
import DataView from '@/components/common/DataView';
import { ProductsAnalyticsOptions } from '../ShopifyAnalyticsBar';
import lodashGroupBy from 'lodash/groupBy';
import UniversalAnalyticsBar from '@/components/common/UniversalAnalyticsBar';
import UniversalOperationBar from '@/components/common/UniversalOperationBar';
import DecoupledHeader from '@/components/common/DecoupledHeader';
import ImageCell from '@/components/common/ImageCell';
import GridView from '@/components/common/GridView';
import FilterBar from '@/components/common/FilterBar';
import ViewsBar from '@/components/common/ViewsBar';

// Reusable image cell component
function ProductImageCell({ src, alt, viewType }: { src: string; alt: string; viewType?: string }) {
  const size = viewType === 'card' ? 64 : 28;
  const radius = viewType === 'card' ? 8 : 4;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{ width: size, height: size, objectFit: 'cover', borderRadius: radius }}
        />
      ) : (
        <span>No Image</span>
      )}
    </div>
  );
}

export default function ShopifyProducts() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error, productsLastEvaluatedKey, totalProducts } = useSelector((state: RootState) => state.shopify);

  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count' });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'image', 'id', 'title', 'vendor', 'product_type', 'status', 'tags', 'created_at', 'updated_at'
  ]);

  // Multi-filter states
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [vendor, setVendor] = useState('All');
  // Smart filter states
  const [smartField, setSmartField] = useState('title');
  const [smartValue, setSmartValue] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsInitialLoad(true);
      await dispatch(fetchProducts({ limit: 100 }));
      setIsInitialLoad(false);
    };
    fetchData();
  }, [dispatch]);

  const handleNextPage = async () => {
    if (!productsLastEvaluatedKey || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await dispatch(fetchProducts({ limit: 100, lastKey: productsLastEvaluatedKey }));
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Auto-load all pages without scrolling
  useEffect(() => {
    if (productsLastEvaluatedKey && !isLoadingMore) {
      const timer = setTimeout(() => {
        handleNextPage();
      }, 200); // 200ms delay between loads
      return () => clearTimeout(timer);
    }
  }, [productsLastEvaluatedKey, isLoadingMore]);

  // Build filter options from data
  const statusOptions = ['All', ...Array.from(new Set(products.map((d: any) => d.status).filter(Boolean)))];
  const typeOptions = ['All', ...Array.from(new Set(products.map((d: any) => d.product_type).filter(Boolean)))];
  const vendorOptions = ['All', ...Array.from(new Set(products.map((d: any) => d.vendor).filter(Boolean)))];
  const smartFieldOptions = [
    { label: 'Title', value: 'title' },
    { label: 'Vendor', value: 'vendor' },
    { label: 'Type', value: 'product_type' },
    { label: 'Status', value: 'status' },
  ];

  // Multi-filter logic
  let filteredProducts = products.filter((row: any) =>
    (status === 'All' || row.status === status) &&
    (type === 'All' || row.product_type === type) &&
    (vendor === 'All' || row.vendor === vendor)
  );
  // Smart filter logic
  if (smartValue) {
    filteredProducts = filteredProducts.filter((row: any) => {
      const val = row[smartField];
      if (Array.isArray(val)) {
        return val.some((v) => String(v).toLowerCase().includes(smartValue.toLowerCase()));
      }
      return String(val ?? '').toLowerCase().includes(smartValue.toLowerCase());
    });
  }

  let tableData = filteredProducts;
  let columns = [
    {
      header: 'Image',
      accessor: 'image',
      render: (_: any, row: any, viewType?: string) => (
        <ImageCell src={row.image?.src} alt={row.title} viewType={viewType === 'grid' ? 'card' : viewType} />
      ),
    },
    { header: 'Product ID', accessor: 'id' },
    {
      header: 'Title',
      accessor: 'title',
      render: (value: any, _row: any, viewType?: string) => viewType === 'grid' ? <span className="font-semibold text-base truncate">{value}</span> : value,
    },
    { header: 'Vendor', accessor: 'vendor' },
    { header: 'Product Type', accessor: 'product_type' },
    { header: 'Status', accessor: 'status' },
    { header: 'Tags', accessor: 'tags', render: (value: any) => Array.isArray(value) ? value.join(', ') : value ?? '' },
    { header: 'Created At', accessor: 'created_at' },
    { header: 'Updated At', accessor: 'updated_at' },
  ];

  // Filter columns based on visibleColumns
  const filteredColumns = columns.filter(col => visibleColumns.includes(col.accessor as string));

  // Example grouping/aggregation (can be extended as needed)
  // For now, just pass through data as grouping/aggregation is not defined for products

  if (loading && isInitialLoad) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // When rendering grid view, only pass the image and title columns:
  const gridColumns = [columns[0], columns[2]];

  // Reset all filters
  const handleResetFilters = () => {
    setStatus('All');
    setType('All');
    setVendor('All');
    setSmartField('title');
    setSmartValue('');
  };

  return (
    <div className=" flex flex-col">
      <UniversalAnalyticsBar section="shopify" tabKey="products" total={totalProducts} currentCount={tableData.length} />
      <ViewsBar />
      <UniversalOperationBar 
        section="shopify" 
        tabKey="products" 
        analytics={analytics} 
        data={tableData}
        selectedData={selectedRows}
      />
      <div className="flex-1 min-h-0">
        <div className="bg-white p-6 rounded-lg shadow h-full overflow-auto">
          <DataView
            data={tableData}
            columns={filteredColumns}
            gridColumns={gridColumns}
            onSort={() => {}}
            onSearch={() => {}}
            section="shopify"
            tabKey="products"
            onSelectionChange={setSelectedRows}
            onLoadMore={() => handleNextPage()}
            hasMore={!!productsLastEvaluatedKey}
            isLoadingMore={isLoadingMore}
            status={status}
            setStatus={setStatus}
            statusOptions={statusOptions}
            type={type}
            setType={setType}
            typeOptions={typeOptions}
            board={vendor}
            setBoard={setVendor}
            boardOptions={vendorOptions}
            smartField={smartField}
            setSmartField={setSmartField}
            smartFieldOptions={smartFieldOptions}
            smartValue={smartValue}
            setSmartValue={setSmartValue}
            onResetFilters={handleResetFilters}
          />
        </div>
      </div>
    </div>
  );
} 