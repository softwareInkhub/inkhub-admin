'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchOrders } from '@/store/slices/shopifySlice';
import DataView from '@/components/common/DataView';
import { OrdersAnalyticsOptions } from '../ShopifyAnalyticsBar';
import lodashGroupBy from 'lodash/groupBy';
import { format } from 'date-fns';
import UniversalAnalyticsBar from '@/components/common/UniversalAnalyticsBar';
import UniversalOperationBar from '@/components/common/UniversalOperationBar';

const tabs = [
  { name: 'All Orders', key: 'all' },
  { name: 'Drafts', key: 'drafts' },
  { name: 'Abandoned Checkouts', key: 'abandoned' },
];

export default function ShopifyOrders() {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error, ordersLastEvaluatedKey } = useSelector((state: RootState) => state.shopify);

  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count' });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsInitialLoad(true);
        await dispatch(fetchOrders({ limit: 100 })).unwrap();
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setIsInitialLoad(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const handleNextPage = async () => {
    if (!ordersLastEvaluatedKey || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await dispatch(fetchOrders({ limit: 100, lastKey: ordersLastEvaluatedKey })).unwrap();
    } catch (err) {
      console.error('Error loading more orders:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

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
  if (analytics.filter && analytics.filter !== 'All') {
    filteredOrders = filteredOrders.filter(order => order.financial_status === analytics.filter);
  }

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

  // Example grouping/aggregation (can be extended as needed)
  // For now, just pass through data as grouping/aggregation is not defined for orders

  if ((loading && isInitialLoad) || isInitialLoad) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a few moments for large datasets</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-500 mb-2">{error}</div>
        <button 
          onClick={() => dispatch(fetchOrders({ limit: 100 }))}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <UniversalAnalyticsBar section="shopify" tabKey="orders" onChange={setAnalytics} />
      <UniversalOperationBar 
        section="shopify" 
        tabKey="orders" 
        analytics={analytics} 
        data={tableData}
        selectedData={selectedRows}
      />
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
            section="shopify"
            tabKey="orders"
            onSelectionChange={setSelectedRows}
          />
          {/* Pagination Controls */}
          <div className="flex justify-end mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 flex items-center gap-2"
              onClick={handleNextPage}
              disabled={!ordersLastEvaluatedKey || isLoadingMore}
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