'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchOrders } from '@/store/slices/shopifySlice';
import DataView from '@/components/common/DataView';
import { OrdersAnalyticsOptions } from '../ShopifyAnalyticsBar';
import lodashGroupBy from 'lodash/groupBy';
import { format } from 'date-fns';

const tabs = [
  { name: 'All Orders', key: 'all' },
  { name: 'Drafts', key: 'drafts' },
  { name: 'Abandoned Checkouts', key: 'abandoned' },
];

export default function ShopifyOrders({ analytics }: { analytics?: OrdersAnalyticsOptions }) {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.shopify);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Filter orders
  let filteredOrders = orders;
  if (analytics && analytics.filter !== 'all') {
    filteredOrders = orders.filter((order) => order.financial_status === analytics.filter);
  }

  // Grouping and aggregation
  let tableData = filteredOrders;
  let columns = [
    { header: 'Order ID', accessor: 'id' },
    { header: 'Customer', accessor: 'customer.email' },
    { header: 'Total', accessor: 'total_price' },
    { header: 'Status', accessor: 'financial_status' },
    { header: 'Created At', accessor: 'created_at' },
  ];

  if (analytics && analytics.groupBy !== 'none') {
    // Group by selected field
    const grouped = lodashGroupBy(filteredOrders, (order) => {
      if (analytics.groupBy === 'created_at') {
        return format(new Date(order.created_at), 'yyyy-MM-dd');
      }
      return order[analytics.groupBy];
    });

    // Aggregate
    tableData = Object.entries(grouped).map(([group, items]) => {
      let value = 0;
      if (analytics.aggregate === 'count') value = items.length;
      if (analytics.aggregate === 'sum') value = items.reduce((sum, o) => sum + parseFloat(o.total_price), 0);
      if (analytics.aggregate === 'average') value = items.reduce((sum, o) => sum + parseFloat(o.total_price), 0) / items.length;
      return {
        group,
        value: analytics.aggregate === 'average' ? value.toFixed(2) : value,
        items,
      };
    });

    columns = [
      { header: analytics.groupBy === 'created_at' ? 'Date' : 
                analytics.groupBy === 'customer.email' ? 'Customer' : 
                analytics.groupBy === 'financial_status' ? 'Status' : 'Group', 
        accessor: 'group' },
      { header: analytics.aggregate === 'count' ? 'Count' :
                analytics.aggregate === 'sum' ? 'Total Amount' :
                'Average Amount',
        accessor: 'value' },
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
    <div className="h-full flex flex-col">
      {/* Analytics options summary */}
      <div className="flex-none">
        {analytics && (
          <div className="mb-2 text-sm text-primary-700 font-semibold">
            Filter: {analytics.filter}, Group By: {analytics.groupBy}, Aggregate: {analytics.aggregate}
          </div>
        )}
      </div>
      {/* Data Table - Scrollable */}
      <div className="flex-1 min-h-0">
        <div className="bg-white p-6 rounded-lg shadow h-full overflow-auto">
          <DataView
            data={tableData}
            columns={columns}
            onSort={(column) => {
              // Implement sorting logic
            }}
            onSearch={(query) => {
              // Implement search logic
            }}
          />
        </div>
      </div>
    </div>
  );
} 