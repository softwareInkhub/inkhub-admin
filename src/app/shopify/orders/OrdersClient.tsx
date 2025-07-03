'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchOrders, setInitialOrders, resetOrders } from '@/store/slices/shopifySlice';
import DataView from '@/components/common/DataView';
import { format } from 'date-fns';
import UniversalAnalyticsBar from '@/components/common/UniversalAnalyticsBar';
import UniversalOperationBar from '@/components/common/UniversalOperationBar';
import { useRef } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface OrdersClientProps {
  initialData: {
    items: any[];
    lastEvaluatedKey: any;
    total: number;
  };
}

export default function OrdersClient({ initialData }: OrdersClientProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error, totalOrders, hasMore, currentPage } = useSelector((state: RootState) => state.shopify);

  // Initialize Redux with server-side data
  useEffect(() => {
    dispatch(setInitialOrders({ ...initialData, hasMore: true, page: 1 }));
  }, [dispatch, initialData]);

  // Flatten orders if needed
  const flatOrders = orders.map(order => order.Item || order.item || order);

  // Pagination state
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 2000;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setTotalPages(Math.ceil((initialData.total || 0) / PAGE_SIZE));
  }, [initialData.total]);

  useEffect(() => {
    dispatch(fetchOrders({ page }));
  }, [dispatch, page]);

  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count' });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'order_number', 'customer', 'email', 'phone', 'total_price', 'financial_status', 'fulfillment_status', 'line_items', 'created_at', 'updated_at'
  ]);

  // Multi-filter states
  const [status, setStatus] = useState('All');
  const [fulfillment, setFulfillment] = useState('All');
  // Fulfillment date filter states
  const [dateRange, setDateRange] = useState<any>({
    startDate: null,
    endDate: null,
    key: 'selection',
  });
  const [showDateRange, setShowDateRange] = useState(false);
  // Smart filter states
  const [smartField, setSmartField] = useState('order_number');
  const [smartValue, setSmartValue] = useState('');
  // Debounced value for search
  const [debouncedSmartValue, setDebouncedSmartValue] = useState('');

  const [initialLoaded, setInitialLoaded] = useState(false);

  const [sortOption, setSortOption] = useState('date_latest');

  // Algolia will be loaded dynamically on client
  const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!;
  const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!;
  const ALGOLIA_INDEX = process.env.NEXT_PUBLIC_ALGOLIA_INDEX!;
  const ALGOLIA_PAGE_SIZE = 50;

  const [algoliaClient, setAlgoliaClient] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    async function loadAlgolia() {
      const mod = await import('algoliasearch/lite');
      const client = mod.liteClient(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
      if (mounted) {
        setAlgoliaClient(client);
      }
    }
    loadAlgolia();
    return () => { mounted = false; };
  }, []);

  // Algolia search state
  const [algoliaResults, setAlgoliaResults] = useState<any[]>([]);
  const [algoliaTotal, setAlgoliaTotal] = useState(0);
  const [algoliaPage, setAlgoliaPage] = useState(0); // Algolia pages are 0-based
  const [isAlgoliaSearch, setIsAlgoliaSearch] = useState(false);

  const handleNextPage = async () => {
    if (!hasMore || loading) return;
    try {
      await dispatch(fetchOrders({ page: currentPage + 1 })).unwrap();
    } catch (err) {
      console.error('Error loading more orders:', err);
    }
  };

  // Add error boundary for failed data fetches
  useEffect(() => {
    if (error) {
      console.error('Orders data fetch error:', error);
      // Optionally show a toast notification here
    }
  }, [error]);

  // Add loading state handling
  useEffect(() => {
    if (loading) {
      // Optionally show a loading indicator
      console.log('Loading orders data...');
    }
  }, [loading]);

  // Build filter options from data
  const statusOptions = ['All', ...Array.from(new Set(flatOrders.map((d: any) => d.financial_status).filter(Boolean)))];
  const fulfillmentOptions = ['All', ...Array.from(new Set(flatOrders.map((d: any) => d.fulfillment_status).filter(Boolean)))];
  const smartFieldOptions = [
    { label: 'Order #', value: 'order_number' },
    { label: 'Customer', value: 'customer' },
    { label: 'Email', value: 'email' },
    { label: 'Phone', value: 'phone' },
    { label: 'Total', value: 'total_price' },
    { label: 'Status', value: 'financial_status' },
    { label: 'Fulfillment', value: 'fulfillment_status' },
    { label: 'Items', value: 'line_items' },
    { label: 'Created', value: 'created_at' },
    { label: 'Updated', value: 'updated_at' },
  ];

  const columns = [
    { 
      header: 'Order #', 
      accessor: 'order_number',
      render: (value: any, row: any) => value?.toString() ?? row.order_number?.toString() ?? ''
    },
    { 
      header: 'Customer', 
      accessor: 'customer',
      render: (_: any, row: any) =>
        row.customer?.first_name || row.customer?.last_name
          ? `${row.customer.first_name || ''} ${row.customer.last_name || ''}`.trim()
          : row.full_name || ''
    },
    { 
      header: 'Email', 
      accessor: 'customer_email',
      render: (_: any, row: any) => row.customer?.email ?? row.email ?? ''
    },
    { 
      header: 'Phone', 
      accessor: 'phone',
      render: (value: any, row: any) => value ?? row.phone ?? row.customer?.phone ?? ''
    },
    { 
      header: 'Total', 
      accessor: 'total_price',
      render: (value: any, row: any) => row.total_price ?? row.total ?? ''
    },
    { 
      header: 'Status', 
      accessor: 'financial_status',
      render: (value: any, row: any) => row.financial_status ?? row.status ?? ''
    },
    { 
      header: 'Fulfillment', 
      accessor: 'fulfillment_status',
      render: (value: any, row: any) => row.fulfillment_status ?? row.fulfillment ?? ''
    },
    { 
      header: 'Items', 
      accessor: 'line_items',
      render: (_: any, row: any) => Array.isArray(row.line_items) ? row.line_items.length : row.items ?? 0
    },
    { 
      header: 'Created', 
      accessor: 'created_at',
      render: (value: any, row: any) => row.created_at ?? row.created ?? ''
    },
    { 
      header: 'Updated', 
      accessor: 'updated_at',
      render: (value: any, row: any) => row.updated_at ?? row.updated ?? ''
    },
  ];

  // Filter columns based on visibleColumns (define only once)
  const filteredColumns = columns.filter(col => visibleColumns.includes(col.accessor as string));

  // Multi-filter logic
  let filteredOrders = flatOrders.filter((row: any) =>
    (status === 'All' || row.financial_status === status) &&
    (fulfillment === 'All' || row.fulfillment_status === fulfillment)
  );

  // Fulfillment date filter logic (now filters by updated_at)
  if (dateRange.startDate) {
    filteredOrders = filteredOrders.filter((row: any) => {
      if (!row.updated_at) return false;
      return new Date(row.updated_at) >= new Date(dateRange.startDate);
    });
  }
  if (dateRange.endDate) {
    filteredOrders = filteredOrders.filter((row: any) => {
      if (!row.updated_at) return false;
      return new Date(row.updated_at) <= new Date(dateRange.endDate);
    });
  }

  // Only apply local filtering if not using Algolia search
  if (debouncedSmartValue && !isAlgoliaSearch) {
    filteredOrders = filteredOrders.filter((row: any) => {
      return filteredColumns.some(col => {
        let value;
        if (col.accessor === 'customer') {
          value = `${row.customer?.first_name || ''} ${row.customer?.last_name || ''}`.trim();
        } else if (col.accessor === 'line_items') {
          value = Array.isArray(row.line_items) ? row.line_items.length : '';
        } else if (col.accessor === 'created_at' || col.accessor === 'updated_at') {
          value = row[col.accessor] ? new Date(row[col.accessor]).toLocaleDateString() : '';
        } else {
          value = row[col.accessor];
        }
        if (typeof value === 'object') value = JSON.stringify(value);
        return String(value ?? '').toLowerCase().includes(debouncedSmartValue.toLowerCase());
      });
    });
  }

  // Sorting logic
  if (sortOption === 'date_latest') {
    filteredOrders = filteredOrders.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sortOption === 'date_oldest') {
    filteredOrders = filteredOrders.slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else if (sortOption === 'price_high_low') {
    filteredOrders = filteredOrders.slice().sort((a, b) => (parseFloat(b.total_price) || 0) - (parseFloat(a.total_price) || 0));
  } else if (sortOption === 'price_low_high') {
    filteredOrders = filteredOrders.slice().sort((a, b) => (parseFloat(a.total_price) || 0) - (parseFloat(b.total_price) || 0));
  }

  // Reset all filters
  const handleResetFilters = () => {
    setStatus('All');
    setFulfillment('All');
    setDateRange({ startDate: null, endDate: null, key: 'selection' });
    setSmartField('order_number');
    setSmartValue('');
  };

  useEffect(() => {
    if (!initialLoaded) {
      dispatch(resetOrders());
      dispatch(fetchOrders({ page: 1 }));
      setInitialLoaded(true);
    }
  }, [dispatch, initialLoaded]);

  // Remove debounce effect and trigger search only on button click
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDebouncedSmartValue(smartValue);
    if (smartValue.trim() && algoliaClient) {
      setIsAlgoliaSearch(true);
      setAlgoliaPage(0); // reset to first page
      try {
        const { results } = await algoliaClient.search([
          { indexName: ALGOLIA_INDEX, query: smartValue, params: { page: 0, hitsPerPage: ALGOLIA_PAGE_SIZE } }
        ]);
        const hits = results[0]?.hits || [];
        const nbHits = results[0]?.nbHits || 0;
        setAlgoliaResults(hits);
        setAlgoliaTotal(nbHits);
      } catch (err) {
        setAlgoliaResults([]);
        setAlgoliaTotal(0);
        console.error('Algolia search error:', err);
      }
    } else {
      setIsAlgoliaSearch(false);
      setAlgoliaResults([]);
      setAlgoliaTotal(0);
      setAlgoliaPage(0);
    }
  };

  // Algolia pagination handler
  const handleAlgoliaPageChange = async (newPage: number) => {
    setAlgoliaPage(newPage);
    if (!algoliaClient) return;
    try {
      const { results } = await algoliaClient.search([
        { indexName: ALGOLIA_INDEX, query: smartValue, params: { page: newPage, hitsPerPage: ALGOLIA_PAGE_SIZE } }
      ]);
      const hits = results[0]?.hits || [];
      const nbHits = results[0]?.nbHits || 0;
      setAlgoliaResults(hits);
      setAlgoliaTotal(nbHits);
    } catch (err) {
      setAlgoliaResults([]);
      setAlgoliaTotal(0);
      console.error('Algolia search error:', err);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-500 mb-2">{error}</div>
        <button 
          onClick={() => dispatch(fetchOrders({ page: 1 }))}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <UniversalAnalyticsBar 
        section="shopify" 
        tabKey="orders" 
        total={isAlgoliaSearch ? algoliaTotal : totalOrders} 
        currentCount={isAlgoliaSearch ? algoliaResults.length : page * PAGE_SIZE} 
      />
      <UniversalOperationBar 
        section="shopify" 
        tabKey="orders" 
        analytics={analytics} 
        data={isAlgoliaSearch ? algoliaResults : filteredOrders}
        selectedData={selectedRows}
      />
      {/* Search & Filter Section */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex w-56 ml-6">
            <div className="relative flex-grow">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                {/* Search icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
              </span>
              <input
                id="order-search"
                type="text"
                className="border-t border-b border-l border-gray-300 rounded-l pl-9 pr-3 py-2 h-9 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Search..."
                value={smartValue}
                onChange={e => setSmartValue(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-gray-800 hover:bg-gray-900 text-white h-9 w-10 flex items-center justify-center rounded-r border-t border-b border-r border-gray-300 focus:outline-none"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </button>
          </form>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-orders" className="font-medium text-gray-700">Sort By:</label>
          <select
            id="sort-orders"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
          >
            <option value="date_latest">Date: Latest</option>
            <option value="date_oldest">Date: Oldest</option>
            <option value="price_high_low">Total Price: High-Low</option>
            <option value="price_low_high">Total Price: Low-High</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="font-medium text-gray-700">Status:</label>
          <select
            id="status-filter"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="fulfillment-date" className="font-medium text-gray-700">Fulfillment Date:</label>
          <button
            type="button"
            className="border border-gray-300 rounded px-2 py-1 text-sm min-w-[220px] text-left bg-white"
            onClick={() => setShowDateRange(v => !v)}
          >
            {dateRange.startDate && dateRange.endDate
              ? `${format(new Date(dateRange.startDate), 'dd MMM yyyy')} - ${format(new Date(dateRange.endDate), 'dd MMM yyyy')}`
              : 'Select date range'}
          </button>
          {showDateRange && (
            <div className="absolute z-50 mt-2 bg-white border rounded shadow-lg p-4" style={{ minWidth: 350 }}>
              <DateRange
                ranges={[dateRange]}
                onChange={item => setDateRange(item.selection)}
                moveRangeOnFirstSelection={false}
                showMonthAndYearPickers={true}
                rangeColors={["#2563eb"]}
                maxDate={new Date()}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 text-sm"
                  onClick={() => {
                    setDateRange({ startDate: null, endDate: null, key: 'selection' });
                    setShowDateRange(false);
                  }}
                >
                  Clear
                </button>
                <button
                  className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-600 text-white text-sm"
                  onClick={() => setShowDateRange(false)}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          className="ml-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 text-sm"
          onClick={handleResetFilters}
        >
          Reset Filters
        </button>
      </div>
      <div>
        <div style={{ maxHeight: '52vh', overflow: 'visible' }}>
          <DataView
            data={isAlgoliaSearch ? algoliaResults : filteredOrders}
            columns={filteredColumns}
          />
        </div>
        {/* Pagination Bar */}
        <div className="flex justify-center items-center mt-4">
          {isAlgoliaSearch ? (
            <>
              <button
                className="px-3 py-1 mx-1 rounded text-gray-500 hover:text-blue-600 disabled:opacity-50"
                onClick={() => handleAlgoliaPageChange(algoliaPage - 1)}
                disabled={algoliaPage === 0}
              >
                Previous
              </button>
              <span className="mx-2 text-gray-700">Page {algoliaPage + 1} of {Math.max(1, Math.ceil(algoliaTotal / ALGOLIA_PAGE_SIZE))}</span>
              <button
                className="px-3 py-1 mx-1 rounded text-gray-500 hover:text-blue-600 disabled:opacity-50"
                onClick={() => handleAlgoliaPageChange(algoliaPage + 1)}
                disabled={algoliaPage + 1 >= Math.ceil(algoliaTotal / ALGOLIA_PAGE_SIZE)}
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button
                className="px-3 py-1 mx-1 rounded text-gray-500 hover:text-blue-600 disabled:opacity-50"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="mx-2 text-gray-700">Page {page} of {totalPages}</span>
              <button
                className="px-3 py-1 mx-1 rounded text-gray-500 hover:text-blue-600 disabled:opacity-50"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 