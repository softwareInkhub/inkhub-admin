'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchProducts } from '@/store/slices/shopifySlice';
import DataView from '@/components/common/DataView';
import { ProductsAnalyticsOptions } from '../ShopifyAnalyticsBar';
import lodashGroupBy from 'lodash/groupBy';

export default function ShopifyProducts({ analytics }: { analytics?: ProductsAnalyticsOptions }) {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector((state: RootState) => state.shopify);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Filter products
  let filteredProducts = products;
  if (analytics && analytics.filter !== 'all') {
    filteredProducts = products.filter((product) => product.status === analytics.filter);
  }

  // Grouping and aggregation
  let tableData = filteredProducts;
  let columns = [
    { header: 'Product ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
    { header: 'Type', accessor: 'type' },
    { header: 'Vendor', accessor: 'vendor' },
    { header: 'Status', accessor: 'status' },
    { header: 'Inventory', accessor: 'inventory' },
  ];

  if (analytics && analytics.groupBy !== 'none') {
    const grouped = lodashGroupBy(filteredProducts, analytics.groupBy);
    tableData = Object.entries(grouped).map(([group, items]) => {
      let value = 0;
      if (analytics.aggregate === 'count') value = items.length;
      if (analytics.aggregate === 'sum_inventory') value = items.reduce((sum, p) => sum + (p.inventory || 0), 0);
      return {
        group,
        value,
        items,
      };
    });
    columns = [
      { header: analytics.groupBy.charAt(0).toUpperCase() + analytics.groupBy.slice(1), accessor: 'group' },
      { header: analytics.aggregate === 'sum_inventory' ? 'Sum Inventory' : 'Count', accessor: 'value' },
    ];
  }

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
      {analytics && (
        <div className="mb-2 text-sm text-primary-700 font-semibold">
          Filter: {analytics.filter}, Group By: {analytics.groupBy}, Aggregate: {analytics.aggregate}
        </div>
      )}
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