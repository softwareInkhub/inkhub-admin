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

  const [filter, setFilter] = useState('All');
  let filteredProducts = products;
  if (filter !== 'All') {
    filteredProducts = products.filter(product => product.status === filter.toLowerCase());
  }

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
      <UniversalOperationBar 
        section="shopify" 
        tabKey="products" 
        analytics={analytics} 
        data={tableData}
        selectedData={selectedRows}
      />
      <DecoupledHeader
        columns={columns}
        visibleColumns={visibleColumns}
        onColumnsChange={setVisibleColumns}
        analyticsBar={
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 mr-1">Filter:</label>
            <select
              className="input input-sm rounded-full border-gray-300 text-xs px-2 py-1"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
            <span className="ml-2 min-w-[56px] text-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 inline-block align-middle">
              {filteredProducts.length} found
            </span>
          </div>
        }
      />
      <div className="flex-1 min-h-0">
        <div className="bg-white p-6 rounded-lg shadow h-full overflow-auto">
          <DataView
            data={filteredProducts}
            columns={filteredColumns}
            onSort={() => {}}
            onSearch={() => {}}
            section="shopify"
            tabKey="products"
            onSelectionChange={setSelectedRows}
          />
          {/* Pagination Controls */}
          <div className="flex justify-end mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 flex items-center gap-2"
              onClick={handleNextPage}
              disabled={!productsLastEvaluatedKey || isLoadingMore}
            >
              {isLoadingMore && (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              )}
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 