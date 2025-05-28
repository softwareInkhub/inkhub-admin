'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchProducts } from '@/store/slices/shopifySlice';
import DataView from '@/components/common/DataView';
import { ProductsAnalyticsOptions } from '../ShopifyAnalyticsBar';
import lodashGroupBy from 'lodash/groupBy';
// import UniversalAnalyticsBar from '@/components/common/UniversalAnalyticsBar';
// import UniversalOperationBar from '@/components/common/UniversalOperationBar';

export default function ShopifyProducts() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error, productsLastEvaluatedKey } = useSelector((state: RootState) => state.shopify);

  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count' });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

  let filteredProducts = products;
  if (analytics.filter && analytics.filter !== 'All') {
    filteredProducts = filteredProducts.filter(product => product.status === analytics.filter || product.product_type === analytics.filter || product.vendor === analytics.filter);
  }

  let tableData = filteredProducts;
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
      {/* <UniversalAnalyticsBar section="shopify" tabKey="products" onChange={setAnalytics} /> */}
      {/* <UniversalOperationBar section="shopify" tabKey="products" analytics={analytics} data={tableData} /> */}
      <div className="flex-1 min-h-0">
        <div className="bg-white p-6 rounded-lg shadow h-full overflow-auto">
          <DataView
            data={tableData}
            columns={columns}
            onSort={() => {}}
            onSearch={() => {}}
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