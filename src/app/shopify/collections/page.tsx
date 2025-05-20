'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchCollections } from '@/store/slices/shopifySlice';
import DataView from '@/components/common/DataView';
import { CollectionsAnalyticsOptions } from '../ShopifyAnalyticsBar';
import lodashGroupBy from 'lodash/groupBy';

export default function ShopifyCollections({ analytics }: { analytics?: CollectionsAnalyticsOptions }) {
  const dispatch = useDispatch<AppDispatch>();
  const { collections, loading, error } = useSelector((state: RootState) => state.shopify);

  useEffect(() => {
    dispatch(fetchCollections());
  }, [dispatch]);

  // Filter collections
  let filteredCollections = collections;
  if (analytics && analytics.filter !== 'all') {
    filteredCollections = collections.filter((col) => col.type === analytics.filter);
  }

  // Grouping and aggregation
  let tableData = filteredCollections;
  let columns = [
    { header: 'Collection ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
    { header: 'Type', accessor: 'type' },
    { header: 'Products Count', accessor: 'products_count' },
  ];

  if (analytics && analytics.groupBy !== 'none') {
    const grouped = lodashGroupBy(filteredCollections, analytics.groupBy);
    tableData = Object.entries(grouped).map(([group, items]) => {
      let value = 0;
      if (analytics.aggregate === 'count') value = items.length;
      return {
        group,
        value,
        items,
      };
    });
    columns = [
      { header: analytics.groupBy.charAt(0).toUpperCase() + analytics.groupBy.slice(1), accessor: 'group' },
      { header: 'Count', accessor: 'value' },
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