'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchProducts } from '@/store/slices/shopifySlice';
import DataView from '@/components/common/DataView';
import { ProductsAnalyticsOptions } from '../ShopifyAnalyticsBar';
import lodashGroupBy from 'lodash/groupBy';

export default function ShopifyProducts() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector((state: RootState) => state.shopify);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Filter products
  let filteredProducts = products;

  // Grouping and aggregation
  let tableData = filteredProducts;
  let columns = [
    { header: 'Product ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
    { header: 'Vendor', accessor: 'vendor' },
    { header: 'Product Type', accessor: 'product_type' },
    { header: 'Status', accessor: 'status' },
    { header: 'Tags', accessor: 'tags', render: (value: any) => Array.isArray(value) ? value.join(', ') : value ?? '' },
    { header: 'Created At', accessor: 'created_at' },
    { header: 'Updated At', accessor: 'updated_at' },
  ];

  if (loading) {
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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <DataView
          data={tableData}
          columns={columns}
          onSort={() => {}}
          onSearch={() => {}}
        />
      </div>
    </div>
  );
} 