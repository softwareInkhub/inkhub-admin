'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchProducts } from '@/store/slices/shopifySlice';
import DataView from '@/components/common/DataView';
import { ProductsAnalyticsOptions } from '../ShopifyAnalyticsBar';
import lodashGroupBy from 'lodash/groupBy';
import UniversalAnalyticsBar from '@/components/common/UniversalAnalyticsBar';
import UniversalOperationBar from '@/components/common/UniversalOperationBar';
import DecoupledHeader from '@/components/common/DecoupledHeader';
import ImageCell from '@/components/common/ImageCell';
import GridView from '@/components/common/GridView';
import FilterBar from '@/components/common/FilterBar';
import ViewsBar from '@/components/common/ViewsBar';
import { fetchAllChunks } from '@/utils/cache';

// Reusable image cell component
function ProductImageCell({ src, alt, viewType }: { src: string; alt: string; viewType?: string }) {
  const size = viewType === 'card' ? 64 : 28;
  const radius = viewType === 'card' ? 8 : 4;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{ width: size, height: size, objectFit: 'cover', borderRadius: radius }}
        />
      ) : (
        <span>No Image</span>
      )}
    </div>
  );
}

export default function ShopifyProducts() {
  // Remove Redux usage for products
  // const dispatch = useDispatch<AppDispatch>();
  // const { products, loading, error, productsLastEvaluatedKey, totalProducts } = useSelector((state: RootState) => state.shopify);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load more states
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadedChunks, setLoadedChunks] = useState<any[]>([]);
  const [allAvailableData, setAllAvailableData] = useState<any[]>([]);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const allItems = await fetchAllChunks('shopify-inkhub-get-products');
        setAllAvailableData(allItems);
        // Initially load first chunk (first 100 items)
        const initialChunk = allItems.slice(0, 100);
        setLoadedChunks(initialChunk);
        setHasMore(allItems.length > 100);
        setIsFullyLoaded(false);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
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
      console.error('Failed to load more products:', err);
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

  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count' });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'image', 'id', 'title', 'vendor', 'product_type', 'status', 'tags', 'created_at', 'updated_at'
  ]);

  // Multi-filter states
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [vendor, setVendor] = useState('All');
  // Smart filter states
  const [smartField, setSmartField] = useState('title');
  const [smartValue, setSmartValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('');
  const sortOptions = [
    { label: 'Created At: Latest', value: 'created_at_desc' },
    { label: 'Created At: Oldest', value: 'created_at_asc' },
  ];

  // Add saved filter state
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [activeSavedFilter, setActiveSavedFilter] = useState<any | null>(null);
  const [dataOverride, setDataOverride] = useState<any[] | null>(null);

  // Fetch saved filters for this user and page
  useEffect(() => {
    const userId = (window as any).currentUserId || 'demo-user';
    const sectionTabKey = `shopify#products`;
    fetch(`/api/saved-filters?userId=${encodeURIComponent(userId)}&sectionTabKey=${encodeURIComponent(sectionTabKey)}`)
      .then(res => res.json())
      .then(data => setSavedFilters(data.filters || []));
  }, []);

  const handleApplySavedFilter = (filter: any) => {
    if (!filter) {
      setActiveSavedFilter(null);
      setDataOverride(null);
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

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setIsInitialLoad(true);
  //     await dispatch(fetchProducts({ limit: 100 }));
  //     setIsInitialLoad(false);
  //   };
  //   fetchData();
  // }, [dispatch]);

  // const handleNextPage = async () => {
  //   if (!productsLastEvaluatedKey || isLoadingMore) return;
  //   setIsLoadingMore(true);
  //   try {
  //     await dispatch(fetchProducts({ limit: 100, lastKey: productsLastEvaluatedKey }));
  //   } finally {
  //     setIsLoadingMore(false);
  //   }
  // };

  // Auto-load all pages without scrolling
  // useEffect(() => {
  //   if (productsLastEvaluatedKey && !isLoadingMore) {
  //     const timer = setTimeout(() => {
  //       handleNextPage();
  //     }, 200); // 200ms delay between loads
  //     return () => clearTimeout(timer);
  //   }
  // }, [productsLastEvaluatedKey, isLoadingMore]);

  // Build filter options from data
  console.log('Sample product data:', loadedChunks[0]);
  const statusOptions = ['All', ...Array.from(new Set(loadedChunks.map((d: any) => d.status || d.Item?.status).filter(Boolean)))];
  const typeOptions = ['All', ...Array.from(new Set(loadedChunks.map((d: any) => d.product_type || d.Item?.product_type).filter(Boolean)))];
  const vendorOptions = ['All', ...Array.from(new Set(loadedChunks.map((d: any) => d.vendor || d.Item?.vendor).filter(Boolean)))];
  const smartFieldOptions = [
    { label: 'Title', value: 'title' },
    { label: 'Vendor', value: 'vendor' },
    { label: 'Type', value: 'product_type' },
    { label: 'Status', value: 'status' },
  ];

  // Multi-filter logic
  let filteredProducts = loadedChunks.filter((row: any) =>
    (status === 'All' || row.status === status || row.Item?.status === status) &&
    (type === 'All' || row.product_type === type || row.Item?.product_type === type) &&
    (vendor === 'All' || row.vendor === vendor || row.Item?.vendor === vendor)
  );
  // Smart filter logic
  if (smartValue) {
    filteredProducts = filteredProducts.filter((row: any) => {
      const val = row[smartField];
      if (Array.isArray(val)) {
        return val.some((v) => String(v).toLowerCase().includes(smartValue.toLowerCase()));
      }
      return String(val ?? '').toLowerCase().includes(smartValue.toLowerCase());
    });
  }

  let tableData = filteredProducts;
  // Sort by date
  if (sortValue === 'created_at_desc') {
    tableData = [...tableData].sort((a, b) => {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : (a.Item?.created_at ? new Date(a.Item.created_at).getTime() : 0);
      const bDate = b.created_at ? new Date(b.created_at).getTime() : (b.Item?.created_at ? new Date(b.Item.created_at).getTime() : 0);
      return bDate - aDate;
    });
  } else if (sortValue === 'created_at_asc') {
    tableData = [...tableData].sort((a, b) => {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : (a.Item?.created_at ? new Date(a.Item.created_at).getTime() : 0);
      const bDate = b.created_at ? new Date(b.created_at).getTime() : (b.Item?.created_at ? new Date(b.Item.created_at).getTime() : 0);
      return aDate - bDate;
    });
  }

  let columns = [
    {
      header: 'Image',
      accessor: 'image',
      render: (_: any, row: any, viewType?: 'card' | 'grid' | 'table') => {
        const imageSrc = row.image?.src || row.Item?.image?.src;
        const title = row.title || row.Item?.title;
        return (
          <ImageCell src={imageSrc} alt={title} viewType={viewType === 'grid' ? 'card' : viewType} />
        );
      },
    },
    { 
      header: 'Product ID', 
      accessor: 'id',
      render: (_: any, row: any) => row.id || row.Item?.id || '—'
    },
    {
      header: 'Title',
      accessor: 'title',
      render: (value: any, row: any, viewType?: 'card' | 'grid' | 'table') => {
        const title = value || row.Item?.title || '—';
        return viewType === 'grid' ? <span className="font-semibold text-base truncate">{title}</span> : title;
      },
    },
    { 
      header: 'Vendor', 
      accessor: 'vendor',
      render: (_: any, row: any) => row.vendor || row.Item?.vendor || '—'
    },
    { 
      header: 'Product Type', 
      accessor: 'product_type',
      render: (_: any, row: any) => row.product_type || row.Item?.product_type || '—'
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (_: any, row: any) => row.status || row.Item?.status || '—'
    },
    { 
      header: 'Tags', 
      accessor: 'tags', 
      render: (value: any, row: any) => {
        const tags = value || row.Item?.tags;
        return Array.isArray(tags) ? tags.join(', ') : tags ?? '—';
      }
    },
    { 
      header: 'Created At', 
      accessor: 'created_at',
      render: (_: any, row: any) => row.created_at || row.Item?.created_at || '—'
    },
    { 
      header: 'Updated At', 
      accessor: 'updated_at',
      render: (_: any, row: any) => row.updated_at || row.Item?.updated_at || '—'
    },
  ];

  // Filter columns based on visibleColumns
  const filteredColumns = columns.filter(col => visibleColumns.includes(col.accessor as string));

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

  // When rendering grid view, only pass the image and title columns:
  const gridColumns = [columns[0], columns[2]];

  // Reset all filters
  const handleResetFilters = () => {
    setStatus('All');
    setType('All');
    setVendor('All');
    setSmartField('title');
    setSmartValue('');
  };

  return (
    <div className="flex flex-col w-full">
      <UniversalAnalyticsBar section="shopify" tabKey="products" total={allAvailableData.length} currentCount={loadedChunks.length} />
      <ViewsBar
        savedFilters={savedFilters}
        onSelect={handleApplySavedFilter}
        onEdit={handleEditSavedFilter}
        activeFilterId={activeSavedFilter?.id}
      />
      <UniversalOperationBar 
        section="shopify" 
        tabKey="products" 
        analytics={analytics} 
        data={loadedChunks}
        selectedData={selectedRows}
      />
      <div className="flex-1 min-h-0 w-full">
        <div className="bg-white rounded-lg shadow h-full overflow-auto w-full relative">
          {/* Remove FilterBar search bar above DataView */}
          <DataView
            data={dataOverride || filteredProducts}
            columns={filteredColumns}
            section="shopify"
            tabKey="products"
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