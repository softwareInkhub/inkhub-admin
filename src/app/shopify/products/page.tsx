'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchProducts } from '@/store/slices/shopifySlice';
import DataView from '@/components/common/DataView';
import lodashGroupBy from 'lodash/groupBy';
import UniversalAnalyticsBar from '@/components/common/UniversalAnalyticsBar';
import UniversalOperationBar from '@/components/common/UniversalOperationBar';
import DecoupledHeader from '@/components/common/DecoupledHeader';

export default function ShopifyProducts() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error, productsLastEvaluatedKey } = useSelector((state: RootState) => state.shopify);

  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count', subFilter: '' });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'image', 'id', 'title', 'vendor', 'product_type', 'status', 'tags', 'created_at', 'updated_at'
  ]);

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

  // Group and aggregate data if needed
  let tableData = filteredProducts;
  if (analytics.groupBy && analytics.groupBy !== 'None') {
    const grouped = lodashGroupBy(filteredProducts, product => {
      switch (analytics.groupBy) {
        case 'Type':
          return product.product_type || 'Unknown';
        case 'Vendor':
          return product.vendor || 'Unknown';
        default:
          return 'Unknown';
      }
    });

    tableData = Object.entries(grouped).map(([group, items]) => {
      let value = 0;
      switch (analytics.aggregate) {
        case 'Count':
          value = items.length;
          break;
        case 'Sum Inventory':
          value = items.reduce((sum, item) => sum + (item.inventory_quantity || 0), 0);
          break;
      }
      return {
        group,
        value,
        items,
      };
    });
  }

  let columns = [
    {
      header: 'Image',
      accessor: 'image',
      render: (value: any, row: any) =>
        row.image && row.image.src ? (
          <img
            src={row.image.src}
            alt={row.title}
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          <span>No Image</span>
        ),
    },
    { header: 'Product ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
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

  return (
    <div className="h-full flex flex-col">
      <UniversalAnalyticsBar section="shopify" tabKey="products" onChange={setAnalytics} />
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
            onSort={() => {}}
            onSearch={() => {}}
            section="shopify"
            tabKey="products"
            onSelectionChange={setSelectedRows}
            onLoadMore={() => handleNextPage()}
            hasMore={!!productsLastEvaluatedKey}
            isLoadingMore={isLoadingMore}
          />
        </div>
      </div>
    </div>
  );
} 