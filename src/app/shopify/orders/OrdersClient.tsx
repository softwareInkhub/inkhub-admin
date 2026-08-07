'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchOrders } from '@/store/slices/shopifySlice';
import DataView from '@/components/common/DataView';
import { OrdersAnalyticsOptions } from '../ShopifyAnalyticsBar';
import lodashGroupBy from 'lodash/groupBy';
import UniversalAnalyticsBar from '@/components/common/UniversalAnalyticsBar';
import UniversalOperationBar from '@/components/common/UniversalOperationBar';
import DecoupledHeader from '@/components/common/DecoupledHeader';
import ViewsBar from '@/components/common/ViewsBar';
import { fetchAllChunks } from '@/utils/cache';
import { format } from 'date-fns';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import FilterBar from '@/components/common/FilterBar';
import { fetchOrderChunkKeys, fetchOrderChunk } from '@/utils/cache';
import type { DataViewColumn } from '@/components/common/DataView';

interface OrdersClientProps {
  initialData: {
    items: any[];
    lastEvaluatedKey: any;
    total: number;
  };
}

// Custom hook to fetch Shopify orders loaded count from /api/system-load/fetch-all
function useShopifyOrdersLoadedCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/system-load/fetch-all');
        const data = await res.json();
        setCount(data.orders?.items?.length || 42236);
      } catch (e) {
        setCount(null);
      }
    }
    fetchCount();
  }, []);
  return count;
}

export default function OrdersClient({ initialData }: OrdersClientProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [chunkKeys, setChunkKeys] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(2000); // Each chunk is a page

  // Load more states
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadedChunks, setLoadedChunks] = useState<any[]>([]);
  const [allAvailableData, setAllAvailableData] = useState<any[]>([]);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);

  // Fetch chunk keys on mount
  useEffect(() => {
    async function loadChunkKeys() {
      setLoading(true);
      setError(null);
      try {
        const keys = await fetchOrderChunkKeys('shopify_inkhub_get_orders');
        setChunkKeys(keys);
        setTotalOrders(keys.length * pageSize); // Approximate total
        
        // Load all available data
        const allItems = await fetchAllChunks('shopify_inkhub_get_orders');
        setAllAvailableData(allItems);
        
        // Initially load first chunk (first 100 items)
        const initialChunk = allItems.slice(0, 100);
        setLoadedChunks(initialChunk);
        setHasMore(allItems.length > 100);
        setIsFullyLoaded(false);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch order chunks');
      } finally {
        setLoading(false);
      }
    }
    loadChunkKeys();
  }, []);

  // Load more functionality
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      // Load next chunk of data (next 100 items)
      const currentCount = loadedChunks.length;
      const nextChunk = allAvailableData.slice(currentCount, currentCount + 100);
      
      if (nextChunk.length > 0) {
        setLoadedChunks(prev => [...prev, ...nextChunk]);
        const newCount = currentCount + nextChunk.length;
        setHasMore(newCount < allAvailableData.length);
        setIsFullyLoaded(newCount >= allAvailableData.length);
      } else {
        setHasMore(false);
        setIsFullyLoaded(true);
      }
    } catch (err: any) {
      console.error('Failed to load more orders:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Load less functionality
  const handleLoadLess = () => {
    // Reset to initial chunk (first 100 items)
    const initialChunk = allAvailableData.slice(0, 100);
    setLoadedChunks(initialChunk);
    setHasMore(allAvailableData.length > 100);
    setIsFullyLoaded(false);
  };

  // Flatten orders if needed - add null check
  const flatOrders = loadedChunks || [];

  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count' });
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

  const [algoliaTotalRecords, setAlgoliaTotalRecords] = useState<number | null>(null);
  useEffect(() => {
    console.log('Algolia env:', ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY, ALGOLIA_INDEX);
    console.log('algoliaClient:', algoliaClient);
    if (!algoliaClient) return;
    async function fetchAlgoliaTotal() {
      try {
        const res = await algoliaClient.search([
          { indexName: ALGOLIA_INDEX, query: '', params: { hitsPerPage: 0 } }
        ]);
        console.log('Algolia API response:', res);
        const nbHits = res.results[0]?.nbHits || 0;
        console.log('Algolia nbHits used for count:', nbHits);
        setAlgoliaTotalRecords(nbHits);
      } catch (err) {
        console.error('Algolia fetch error:', err);
        setAlgoliaTotalRecords(null);
      }
    }
    fetchAlgoliaTotal();
  }, [algoliaClient]);

  // Add saved filter state
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [activeSavedFilter, setActiveSavedFilter] = useState<any | null>(null);
  const [dataOverride, setDataOverride] = useState<any[] | null>(null);

  // Fetch saved filters for this user and page
  useEffect(() => {
    const userId = (window as any).currentUserId || 'demo-user';
    const sectionTabKey = `shopify#orders`;
    fetch(`/api/saved-filters?userId=${encodeURIComponent(userId)}&sectionTabKey=${encodeURIComponent(sectionTabKey)}`)
      .then(res => res.json())
      .then(data => setSavedFilters(data.filters || []));
  }, []);

  const handleApplySavedFilter = (filter: any) => {
    if (!filter) {
      setActiveSavedFilter(null);
      setDataOverride(null);
      setStatus('All');
      setFulfillment('All');
      setDateRange({ startDate: null, endDate: null, key: 'selection' });
      setSmartField('order_number');
      setSmartValue('');
      return;
    }
    if (activeSavedFilter && activeSavedFilter.id === filter.id) {
      setActiveSavedFilter(null);
      setDataOverride(null);
    } else {
      setActiveSavedFilter(filter);
      if (filter.filteredData) {
        setDataOverride(filter.filteredData);
      }
    }
  };

  // Add edit functionality for saved filters
  const handleEditSavedFilter = (filter: any) => {
    // For now, we'll use a simple prompt to edit the filter name
    // You can replace this with a proper modal/form later
    const newName = prompt('Edit filter name:', filter.filterName || 'Unnamed');
    if (newName && newName.trim() !== filter.filterName) {
      // Update the filter name
      const updatedFilter = { ...filter, filterName: newName.trim() };
      
      // Update the saved filters list
      setSavedFilters(prev => prev.map(f => f.id === filter.id ? updatedFilter : f));
      
      // If this filter is currently active, update the active filter
      if (activeSavedFilter?.id === filter.id) {
        setActiveSavedFilter(updatedFilter);
      }
      
      // You could also save this to the backend here
      // fetch('/api/saved-filters', { method: 'PUT', body: JSON.stringify(updatedFilter) });
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

  const columns: DataViewColumn<any>[] = [
    { 
      header: 'Order #', 
      accessor: 'order_number' as keyof any,
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
  let filteredOrders = loadedChunks.filter((row: any) =>
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

  // Pagination logic - use chunk-based pagination
  const totalPages = chunkKeys.length;

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [status, fulfillment, dateRange, debouncedSmartValue, sortOption]);

  // Reset all filters
  const handleResetFilters = () => {
    setStatus('All');
    setFulfillment('All');
    setDateRange({ startDate: null, endDate: null, key: 'selection' });
    setSmartField('order_number');
    setSmartValue('');
  };



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
        console.log('Total records in Algolia index', ALGOLIA_INDEX, ':', nbHits);
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

  const shopifyOrdersLoadedCount = useShopifyOrdersLoadedCount();

  // Add effect to clear Algolia search when search box is cleared
  useEffect(() => {
    if (smartValue === "") {
      setIsAlgoliaSearch(false);
      setAlgoliaResults([]);
      setAlgoliaTotal(0);
      setAlgoliaPage(0);
    }
  }, [smartValue]);

  // Debounce debouncedSmartValue update by 700ms after smartValue changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSmartValue(smartValue);
    }, 1000);
    return () => {
      clearTimeout(handler);
    };
  }, [smartValue]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-500 mb-2">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <UniversalAnalyticsBar
        section="shopify"
        tabKey="orders"
        total={allAvailableData.length}
        currentCount={loadedChunks.length}
        algoliaTotal={algoliaTotalRecords}
      />
      <ViewsBar
        savedFilters={savedFilters}
        onSelect={handleApplySavedFilter}
        onEdit={handleEditSavedFilter}
        activeFilterId={activeSavedFilter?.id}
      />
      <UniversalOperationBar 
        section="shopify" 
        tabKey="orders" 
        analytics={analytics} 
        data={loadedChunks}
        selectedData={selectedRows}
      />
      {/* Remove FilterBar search bar above DataView */}
      <div className="flex-1 min-h-0 w-full">
        <div className="bg-white rounded-lg shadow h-full overflow-auto w-full relative" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <DataView
            data={dataOverride || filteredOrders}
            columns={filteredColumns}
            section="shopify"
            tabKey="orders"
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
          {/* Load More Button - fixed to bottom right */}
          {hasMore && (
            <div className="fixed bottom-6 right-8 z-40">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center gap-2"
              >
                {isLoadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Load More Data
                  </>
                )}
              </button>
            </div>
          )}
          {isFullyLoaded && (
            <div className="fixed bottom-6 right-8 z-40">
              <button
                onClick={handleLoadLess}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Load Less Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 