'use client';

import { useEffect, useState } from 'react';
import DataView from '@/components/common/DataView';
import { format } from 'date-fns';
import UnifiedDataHeader from '@/components/common/UnifiedDataHeader';
import { useRef } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { fetchOrderChunkKeys, fetchOrderChunk } from '@/utils/cache';
import Pagination from '@/components/common/Pagination';
import OrderCard from '@/components/cards/OrderCard';
import OrderImageCard from '@/components/cards/OrderImageCard';
import CreateFilterModal from '@/components/common/CreateFilterModal';

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
  
  // View type state
  const [viewType, setViewType] = useState<'table' | 'grid' | 'card' | 'list'>('table');
  
  // Button dropdown states
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [selectedDownloadFields, setSelectedDownloadFields] = useState<string[]>([]);
  const [selectedDownloadFormat, setSelectedDownloadFormat] = useState<string>('JSON');
  
  // Filter tags state
  const [activeFilters, setActiveFilters] = useState<Array<{ key: string; value: string; label?: string }>>([]);
  
  // Search filter state
  const [selectedSearchFilter, setSelectedSearchFilter] = useState<string>('');
  const [showSearchFilterDropdown, setShowSearchFilterDropdown] = useState(false);

  // Fetch chunk keys on mount
  useEffect(() => {
    async function loadChunkKeys() {
      setLoading(true);
      setError(null);
      try {
        const keys = await fetchOrderChunkKeys('shopify-inkhub-get-orders');
        setChunkKeys(keys);
        setTotalOrders(keys.length * pageSize); // Approximate total
        // Load first chunk
        if (keys.length > 0) {
          const match = keys[0].match(/chunk:(\d+)/);
          const chunkNumber = match ? parseInt(match[1], 10) : 0;
          const items = await fetchOrderChunk('shopify-inkhub-get-orders', chunkNumber);
          setOrders(items);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch order chunks');
      } finally {
        setLoading(false);
      }
    }
    loadChunkKeys();
  }, []);

  // Load chunk when page changes
  useEffect(() => {
    async function loadChunk() {
      if (!chunkKeys.length) return;
      setLoading(true);
      setError(null);
      try {
        const key = chunkKeys[currentPage - 1];
        const match = key.match(/chunk:(\d+)/);
        const chunkNumber = match ? parseInt(match[1], 10) : 0;
        const items = await fetchOrderChunk('shopify-inkhub-get-orders', chunkNumber);
        setOrders(items);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch order chunk');
      } finally {
        setLoading(false);
      }
    }
    if (chunkKeys.length) loadChunk();
  }, [currentPage, chunkKeys]);

  // Flatten orders if needed - add null check
  const flatOrders = orders?.map(order => order.Item || order.item || order) || [];

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
  const [showCreateFilterModal, setShowCreateFilterModal] = useState(false);

  // Fetch saved filters for this user and page
  useEffect(() => {
    const userId = (window as any).currentUserId || 'demo-user';
    const sectionTabKey = `shopify#orders`;
    fetch(`/api/saved-filters?userId=${encodeURIComponent(userId)}&sectionTabKey=${encodeURIComponent(sectionTabKey)}`)
      .then(res => res.json())
      .then(data => setSavedFilters(data.filters || []));
  }, []);

  const handleApplySavedFilter = (filter: any) => {
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

  // Real-time search functionality
  useEffect(() => {
    if (smartValue.trim()) {
      const searchTerm = smartValue.toLowerCase();
      const searchResults = flatOrders.filter((order: any) => {
        // Search across multiple fields
        const searchableFields = [
          order.order_number?.toString() || '',
          order.customer?.first_name || '',
          order.customer?.last_name || '',
          order.customer?.email || '',
          order.email || '',
          order.phone || '',
          order.customer?.phone || '',
          order.total_price?.toString() || '',
          order.financial_status || '',
          order.fulfillment_status || '',
          order.created_at || '',
          order.updated_at || '',
          // Search in line items
          ...(Array.isArray(order.line_items) ? order.line_items.map((item: any) => item.title || '').join(' ') : []),
          // Search in customer name combinations
          `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
          order.full_name || ''
        ];
        
        return searchableFields.some(field => 
          field.toLowerCase().includes(searchTerm)
        );
      });
      
      setDataOverride(searchResults);
      console.log(`Found ${searchResults.length} orders matching "${smartValue}"`);
    } else {
      // Clear search - show all data
      setDataOverride(null);
    }
  }, [smartValue, flatOrders]);

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
        if (typeof value === 'object') value = '[Object]';
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



  // Enhanced search functionality that works with local data
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDebouncedSmartValue(smartValue);
    
    if (smartValue.trim()) {
      // Search through local data first
      const searchTerm = smartValue.toLowerCase();
      const searchResults = flatOrders.filter((order: any) => {
        // Search across multiple fields
        const searchableFields = [
          order.order_number?.toString() || '',
          order.customer?.first_name || '',
          order.customer?.last_name || '',
          order.customer?.email || '',
          order.email || '',
          order.phone || '',
          order.customer?.phone || '',
          order.total_price?.toString() || '',
          order.financial_status || '',
          order.fulfillment_status || '',
          order.created_at || '',
          order.updated_at || '',
          // Search in line items
          ...(Array.isArray(order.line_items) ? order.line_items.map((item: any) => item.title || '').join(' ') : []),
          // Search in customer name combinations
          `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
          order.full_name || ''
        ];
        
        return searchableFields.some(field => 
          field.toLowerCase().includes(searchTerm)
        );
      });
      
      // Set local search results
      setDataOverride(searchResults);
      console.log(`Found ${searchResults.length} orders matching "${smartValue}"`);
      
      // Also try Algolia search if available
      if (algoliaClient) {
        setIsAlgoliaSearch(true);
        setAlgoliaPage(0);
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
      }
    } else {
      // Clear search - show all data
      setDataOverride(null);
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

  // Button handlers
  const handleDownloadClick = () => {
    setShowDownloadDropdown(!showDownloadDropdown);
    setShowColumnDropdown(false);
  };

  const handleColumnsClick = () => {
    setShowColumnDropdown(!showColumnDropdown);
    setShowDownloadDropdown(false);
  };

  const handleSaveFilterClick = () => {
    // This will be handled by the DataView component
    console.log('Save filter clicked');
  };

  const handleCopyClick = () => {
    // Copy filtered data to clipboard
    const dataToCopy = dataOverride || (isAlgoliaSearch ? algoliaResults : filteredOrders);
    
    // If no download fields are selected, copy all visible columns
    const fieldsToCopy = selectedDownloadFields.length > 0 
      ? selectedDownloadFields 
      : visibleColumns;
    
    const filtered = dataToCopy.map(row => {
      const obj: any = {};
      fieldsToCopy.forEach(field => {
        // Handle nested object access (e.g., 'customer.first_name')
        const fieldParts = field.split('.');
        let value = row;
        for (const part of fieldParts) {
          value = value?.[part];
        }
        obj[field] = value;
      });
      return obj;
    });
    
    const jsonString = JSON.stringify(filtered, null, 2);
    
    // Copy to clipboard
    navigator.clipboard.writeText(jsonString).then(() => {
      console.log('Data copied to clipboard');
      // Show success feedback
      alert('Data copied to clipboard successfully!');
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
      // Show error feedback
      alert('Failed to copy data to clipboard. Please try again.');
    });
  };

  const handleRemoveFilter = (key: string) => {
    setActiveFilters(prev => prev.filter(filter => filter.key !== key));
    // You can add additional logic here to reset the specific filter
    console.log('Removed filter:', key);
  };

  const handleSearchFilterDropdownToggle = () => {
    setShowSearchFilterDropdown(!showSearchFilterDropdown);
  };

  const handleSearchFilterChange = (filter: string) => {
    setSelectedSearchFilter(filter);
    setSmartField(filter);
    setShowSearchFilterDropdown(false);
    // If there's a current search value, re-run the search with the new field
    if (smartValue.trim()) {
      handleSearch();
    }
  };

  // Row selection handler
  const handleRowSelect = (rowId: string, selected: boolean) => {
    if (selected) {
      setSelectedRows(prev => [...prev, rowId]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== rowId));
    }
  };

  // Select all handler
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allRowIds = (dataOverride || (isAlgoliaSearch ? algoliaResults : filteredOrders)).map((row, index) => String(row.id || index));
      setSelectedRows(allRowIds);
    } else {
      setSelectedRows([]);
    }
  };

  // View type change handler
  const handleViewTypeChange = (newViewType: 'table' | 'grid' | 'card' | 'list') => {
    setViewType(newViewType);
  };

  // Example function to add filters (you can call this from your filter logic)
  const addSampleFilters = () => {
    setActiveFilters([
      { key: 'status', value: 'paid', label: 'Status: Paid' },
      { key: 'customer', value: 'john', label: 'Customer: John' }
    ]);
  };

  // Search filter options
  const searchFilterOptions = [
    { value: 'order_number', label: 'Order Number' },
    { value: 'customer', label: 'Customer Name' },
    { value: 'customer_email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'total_price', label: 'Total Price' },
    { value: 'financial_status', label: 'Status' },
    { value: 'fulfillment_status', label: 'Fulfillment' }
  ];

  const handleDownload = () => {
    if (!selectedDownloadFields.length || !selectedDownloadFormat) return;
    
    const dataToDownload = dataOverride || (isAlgoliaSearch ? algoliaResults : filteredOrders);
    const filtered = dataToDownload.map(row => {
      const obj: any = {};
      selectedDownloadFields.forEach(field => {
        obj[field] = row[field];
      });
      return obj;
    });

    if (selectedDownloadFormat === 'JSON') {
      const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (selectedDownloadFormat === 'CSV') {
      const csvData = convertToCSV(filtered, selectedDownloadFields);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders_data.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (selectedDownloadFormat === 'PDF') {
      // PDF download placeholder
      console.log('PDF download not implemented yet');
      alert('PDF download feature coming soon!');
    }
    
    setShowDownloadDropdown(false);
  };

  // Helper function to convert data to CSV
  const convertToCSV = (data: any[], fields: string[]) => {
    if (!data.length) return '';
    
    const headers = fields.map(field => {
      const column = columns.find(col => col.accessor === field);
      return column ? column.header : field;
    });
    
    const rows = data.map(row => {
      return fields.map(field => {
        const value = row[field];
        // Handle nested objects and arrays
        if (typeof value === 'object' && value !== null) {
          // Don't include object values in CSV - just show empty string
          return '';
        }
        return value || '';
      });
    });
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    return csvContent;
  };



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

  const handleDeleteItem = (item: any) => {
    // Remove the item from the orders array
    setOrders(prevOrders => prevOrders.filter(order => order.id !== item.id));
    console.log('Deleted order:', item);
    alert('Order deleted successfully!');
  };

  const handleViewItem = (item: any) => {
    console.log('Viewing order:', item);
  };

  const handleEditItem = (item: any) => {
    console.log('Editing order:', item);
  };

  const handleCreateFilter = (newFilter: any) => {
    console.log('Creating new filter:', newFilter);
    // Add the new filter to saved filters
    setSavedFilters(prev => [...prev, newFilter]);
    // You could also save to localStorage or API here
  };

  return (
    <div className="flex flex-col h-full">
      <UnifiedDataHeader
        // Analytics cards
        analyticsCards={[
          {
            label: "Total Data",
            value: totalOrders.toLocaleString(),
            color: "blue",
            icon: <div className="w-6 h-6 bg-blue-500 rounded"></div>
          },
          {
            label: smartValue.trim() ? "Search Results" : "Loaded Data",
            value: (dataOverride || flatOrders).length.toLocaleString(),
            color: "green",
            icon: <div className="w-6 h-6 bg-green-500 rounded"></div>
          },
          {
            label: "Algolia Count",
            value: algoliaTotalRecords?.toLocaleString() || "0",
            color: "purple",
            gradient: true
          },
          ...Array.from({ length: 8 }, (_, i) => ({
            label: `Box ${i + 4}`,
            value: "--",
            color: "gray" as const
          }))
        ]}
        
        // Filter tabs
        filterTabs={savedFilters.map((filter) => ({
          id: filter.id,
          name: filter.filterName || 'Unnamed',
          type: 'filter' as const,
          active: activeSavedFilter?.id === filter.id,
          count: filter.count || 0
        }))}
        activeTabId={activeSavedFilter?.id}
        onTabChange={(tabId) => {
          if (tabId === 'all') {
            setActiveSavedFilter(null);
            setDataOverride(null);
          } else {
            const filter = savedFilters.find(f => f.id === tabId);
            if (filter) {
              handleApplySavedFilter(filter);
            }
          }
        }}
        showCreateFilterButton={true}
        onCreateFilter={() => setShowCreateFilterModal(true)}
        
        // Search functionality
        searchValue={smartValue}
        onSearchChange={setSmartValue}
        onSearchSubmit={handleSearch}
        searchPlaceholder="Search orders by number, customer, email, phone, total, status..."
        
        // Search filter
        showSearchFilter={true}
        searchFilterOptions={searchFilterOptions}
        selectedSearchFilter={selectedSearchFilter}
        onSearchFilterChange={handleSearchFilterChange}
        showSearchFilterDropdown={showSearchFilterDropdown}
        onSearchFilterDropdownToggle={handleSearchFilterDropdownToggle}
        
        // Action buttons
        onDownload={handleDownloadClick}
        onCopy={handleCopyClick}
        onColumns={handleColumnsClick}
        onSaveFilter={handleSaveFilterClick}
        showDownload={true}
        showCopy={true}
        showColumns={true}
        showSaveFilter={true}
        downloadDisabled={false}
        copyDisabled={false}
        columnsDisabled={false}
        saveFilterDisabled={false}
        
        // Filter tags
        showFilterTags={true}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        
        // Download dropdown
        showDownloadDropdown={showDownloadDropdown}
        selectedDownloadFormat={selectedDownloadFormat}
        onDownloadFormatChange={setSelectedDownloadFormat}
        
        // Additional dropdown props
        showColumnDropdown={showColumnDropdown}
        selectedDownloadFields={selectedDownloadFields}
        visibleColumns={visibleColumns}
        onVisibleColumnsChange={setVisibleColumns}
        columns={columns}
        onDownloadFieldsChange={setSelectedDownloadFields}
        onDownloadExecute={handleDownload}
      />
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <DataView
            data={dataOverride || (isAlgoliaSearch ? algoliaResults : filteredOrders)}
            columns={filteredColumns}
            viewType={viewType}
            onViewTypeChange={handleViewTypeChange}
            onRowSelect={handleRowSelect}
            selectedRows={selectedRows}
            onSelectAll={handleSelectAll}
            // Pagination props
            enablePagination={true}
            totalItems={totalOrders}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newPageSize) => {
              // For now, we'll keep the existing pageSize logic
              // This could be enhanced to actually change the page size
            }}
            renderCard={order => <OrderImageCard order={order} />}
            // Action handlers
            onViewItem={handleViewItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            showActions={viewType !== 'card'}
            // Column filtering
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
            // Card click handler
            onCardClick={handleViewItem}
          />
        </div>
      </div>

      {/* Create Filter Modal */}
      <CreateFilterModal
        isOpen={showCreateFilterModal}
        onClose={() => setShowCreateFilterModal(false)}
        onCreateFilter={handleCreateFilter}
        availableFields={[
          { value: 'order_number', label: 'Order Number' },
          { value: 'customer', label: 'Customer' },
          { value: 'customer_email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'total_price', label: 'Total' },
          { value: 'financial_status', label: 'Status' },
          { value: 'fulfillment_status', label: 'Fulfillment' },
          { value: 'line_items', label: 'Items' },
          { value: 'created_at', label: 'Created At' },
          { value: 'updated_at', label: 'Updated At' }
        ]}
      />
    </div>
  );
} 