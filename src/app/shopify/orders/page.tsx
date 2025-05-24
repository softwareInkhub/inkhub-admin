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

export default function ShopifyOrders() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.shopify);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Debug: log the date fields for the first few orders
  useEffect(() => {
    if (orders && orders.length > 0) {
      console.log('Order date fields sample:', orders.slice(0, 5).map(o => ({
        order_number: o.order_number,
        created_at: o.created_at,
        updated_at: o.updated_at,
      })));
    }
  }, [orders]);

  // Filter orders
  let filteredOrders = orders;

  // Grouping and aggregation
  let tableData = filteredOrders;
  let columns = [
    { 
      header: 'Order #', 
      accessor: 'order_number',
      render: (value: any) => value?.toString() ?? ''
    },
    { 
      header: 'Customer', 
      accessor: 'customer',
      render: (value: any) => `${value?.first_name || ''} ${value?.last_name || ''}`.trim()
    },
    { 
      header: 'Email', 
      accessor: 'email',
      render: (value: any) => value ?? ''
    },
    { 
      header: 'Phone', 
      accessor: 'phone',
      render: (value: any) => value ?? ''
    },
    { 
      header: 'Total', 
      accessor: 'total_price',
      render: (value: any, row: any) => row.currency && value ? `${row.currency} ${value}` : ''
    },
    { 
      header: 'Status', 
      accessor: 'financial_status',
      render: (value: any) => value ?? ''
    },
    { 
      header: 'Fulfillment', 
      accessor: 'fulfillment_status',
      render: (value: any) => value ?? ''
    },
    { 
      header: 'Items', 
      accessor: 'line_items',
      render: (value: any) => Array.isArray(value) ? value.length : 0
    },
    { 
      header: 'Created', 
      accessor: 'created_at',
      render: (value: any) => value ? format(new Date(value), 'MMM d, yyyy') : ''
    },
    { 
      header: 'Updated', 
      accessor: 'updated_at',
      render: (value: any) => value ? format(new Date(value), 'MMM d, yyyy') : ''
    },
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
    <div className="h-full flex flex-col">
      {/* Removed analytics options summary */}
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