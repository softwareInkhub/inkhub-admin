'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchProducts } from '@/store/slices/shopifySlice';
import DataView from '@/components/common/DataView';
import { ProductsAnalyticsOptions } from '../ShopifyAnalyticsBar';
import lodashGroupBy from 'lodash/groupBy';
import UnifiedDataHeader from '@/components/common/UnifiedDataHeader';
import DecoupledHeader from '@/components/common/DecoupledHeader';
import ImageCell from '@/components/common/ImageCell';
import GridView from '@/components/common/GridView';
import { fetchAllChunks } from '@/utils/cache';
import { fetchOrderChunkKeys, fetchOrderChunk } from '@/utils/cache';
import Pagination from '@/components/common/Pagination';
import ProductCard from '@/components/cards/ProductCard';
import ProductImageCard from '@/components/cards/ProductImageCard';
import CreateFilterModal from '@/components/common/CreateFilterModal';

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
  console.log('ShopifyProducts: Component starting to render');
  
  // Remove Redux usage for products
  // const dispatch = useDispatch<AppDispatch>();
  // const { products, loading, error, productsLastEvaluatedKey, totalProducts } = useSelector((state: RootState) => state.shopify);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // Infinite scroll state
  const [hasMoreData, setHasMoreData] = useState(true);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<any[]>([]);
  const [currentDisplayCount, setCurrentDisplayCount] = useState(25);
  const [chunkKeys, setChunkKeys] = useState<string[]>([]);
  const [loadedChunks, setLoadedChunks] = useState<Set<number>>(new Set());
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);

  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count' });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
  const [showCreateFilterModal, setShowCreateFilterModal] = useState(false);
  
  // Button dropdown states
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [selectedDownloadFields, setSelectedDownloadFields] = useState<string[]>([]);
  const [selectedDownloadFormat, setSelectedDownloadFormat] = useState<string>('JSON');
  
  // View type state
  const [viewType, setViewType] = useState<'table' | 'grid' | 'card' | 'list'>('table');
  
  // Search filter state
  const [selectedSearchFilter, setSelectedSearchFilter] = useState<string>('');
  const [showSearchFilterDropdown, setShowSearchFilterDropdown] = useState(false);

  // Fetch saved filters for this user and page
  useEffect(() => {
    const userId = (window as any).currentUserId || 'demo-user';
    const sectionTabKey = `shopify#products`;
    fetch(`/api/saved-filters?userId=${encodeURIComponent(userId)}&sectionTabKey=${encodeURIComponent(sectionTabKey)}`)
      .then(res => res.json())
      .then(data => setSavedFilters(data.filters || []));
  }, []);

  // Search functionality - filter displayed products in real-time
  useEffect(() => {
    if (searchValue.trim()) {
      const searchTerm = searchValue.toLowerCase();
      const filtered = displayedProducts.filter((product: any) => {
        const searchableFields = [
          product.title || product.Item?.title || '',
          product.vendor || product.Item?.vendor || '',
          product.product_type || product.Item?.product_type || '',
          product.status || product.Item?.status || '',
          product.tags || product.Item?.tags || '',
          product.description || product.Item?.description || '',
          product.id?.toString() || product.Item?.id?.toString() || ''
        ];
        
        return searchableFields.some(field => 
          field.toLowerCase().includes(searchTerm)
        );
      });
      
      setDataOverride(filtered);
    } else {
      setDataOverride(null);
    }
  }, [searchValue, displayedProducts]);

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

  // Initial data fetch - load chunk keys first
  useEffect(() => {
    const fetchChunkKeys = async () => {
      console.log('ShopifyProducts: Starting to fetch chunk keys');
      setLoading(true);
      setError(null);
      try {
        // Get all chunk keys first
        const keys = await fetchOrderChunkKeys('shopify-inkhub-get-products');
        console.log('ShopifyProducts: Fetched chunk keys:', keys);
        setChunkKeys(keys);
        
        // Load first chunk
        if (keys.length > 0) {
          const match = keys[0].match(/chunk:(\d+)/);
          const chunkNumber = match ? parseInt(match[1], 10) : 0;
          const firstChunkData = await fetchOrderChunk('shopify-inkhub-get-products', chunkNumber);
          console.log('ShopifyProducts: Fetched first chunk, items count:', firstChunkData.length);
          
          setDisplayedProducts(firstChunkData);
          setLoadedChunks(new Set([chunkNumber]));
          setCurrentChunkIndex(1);
          setHasMoreData(keys.length > 1);
        }
      } catch (err: any) {
        console.error('ShopifyProducts: Error fetching chunk keys:', err);
        setError(err.message || 'Failed to fetch chunk keys');
      } finally {
        console.log('ShopifyProducts: Finished loading, setting loading to false');
        setLoading(false);
      }
    };
    fetchChunkKeys();
  }, []);

  // Load more function for infinite scroll - load next chunk
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreData) return;
    
    setIsLoadingMore(true);
    try {
      // Get next chunk number
      const nextChunkKey = chunkKeys[currentChunkIndex];
      if (!nextChunkKey) {
        setHasMoreData(false);
        return;
      }
      
      const match = nextChunkKey.match(/chunk:(\d+)/);
      const chunkNumber = match ? parseInt(match[1], 10) : 0;
      
      // Load the next chunk
      const chunkData = await fetchOrderChunk('shopify-inkhub-get-products', chunkNumber);
      console.log('ShopifyProducts: Loaded chunk', chunkNumber, 'with', chunkData.length, 'items');
      
      // Append new chunk data to displayed products
      setDisplayedProducts(prev => [...prev, ...chunkData]);
      setLoadedChunks(prev => new Set([...prev, chunkNumber]));
      setCurrentChunkIndex(prev => prev + 1);
      
      // Check if there are more chunks
      setHasMoreData(currentChunkIndex + 1 < chunkKeys.length);
    } catch (err: any) {
      console.error('ShopifyProducts: Error loading more data:', err);
      setError(err.message || 'Failed to load more data');
    } finally {
      setIsLoadingMore(false);
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
  console.log('Sample product data:', products[0]);
  const statusOptions = ['All', ...Array.from(new Set(products.map((d: any) => d.status || d.Item?.status).filter(Boolean)))];
  const typeOptions = ['All', ...Array.from(new Set(products.map((d: any) => d.product_type || d.Item?.product_type).filter(Boolean)))];
  const vendorOptions = ['All', ...Array.from(new Set(products.map((d: any) => d.vendor || d.Item?.vendor).filter(Boolean)))];
  const smartFieldOptions = [
    { label: 'Title', value: 'title' },
    { label: 'Vendor', value: 'vendor' },
    { label: 'Type', value: 'product_type' },
    { label: 'Status', value: 'status' },
  ];

  // Multi-filter logic
  let filteredProducts = products.filter((row: any) =>
    (status === 'All' || row.status === status || row.Item?.status === status) &&
    (type === 'All' || row.product_type === type || row.Item?.product_type === type) &&
    (vendor === 'All' || row.vendor === vendor || row.Item?.vendor === vendor)
  );
  
  // Enhanced search functionality
  if (smartValue.trim()) {
    const searchTerm = smartValue.toLowerCase();
    filteredProducts = filteredProducts.filter((row: any) => {
      // Search across multiple fields
      const searchableFields = [
        row.title?.toString() || '',
        row.name?.toString() || '',
        row.Item?.title?.toString() || '',
        row.Item?.name?.toString() || '',
        row.vendor?.toString() || '',
        row.Item?.vendor?.toString() || '',
        row.product_type?.toString() || '',
        row.Item?.product_type?.toString() || '',
        row.status?.toString() || '',
        row.Item?.status?.toString() || '',
        row.tags?.toString() || '',
        row.Item?.tags?.toString() || '',
        row.body_html?.toString() || '',
        row.Item?.body_html?.toString() || '',
        row.created_at?.toString() || '',
        row.Item?.created_at?.toString() || '',
        row.updated_at?.toString() || '',
        row.Item?.updated_at?.toString() || '',
        row.id?.toString() || '',
        row.Item?.id?.toString() || ''
      ];
      
      return searchableFields.some(field => 
        field.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Use displayed products for infinite scroll
  let tableData = dataOverride || displayedProducts;
  
  // Apply filters to the displayed data
  if (!dataOverride) {
    // Filter the displayed products (which come from chunks)
    let filteredProducts = displayedProducts.filter((product: any) => {
      // Status filter
      if (status !== 'All') {
        const productStatus = product.status || product.Item?.status;
        if (productStatus !== status) return false;
      }
      
      // Type filter
      if (type !== 'All') {
        const productType = product.product_type || product.Item?.product_type;
        if (productType !== type) return false;
      }
      
      // Vendor filter
      if (vendor !== 'All') {
        const productVendor = product.vendor || product.Item?.vendor;
        if (productVendor !== vendor) return false;
      }
      
      // Smart filter
      if (smartValue.trim()) {
        const searchableFields = [
          product.title || product.Item?.title || '',
          product.vendor || product.Item?.vendor || '',
          product.product_type || product.Item?.product_type || '',
          product.status || product.Item?.status || '',
          product.tags || product.Item?.tags || '',
          product.description || product.Item?.description || '',
          product.id?.toString() || product.Item?.id?.toString() || ''
        ];
        
        const searchTerm = smartValue.toLowerCase();
        const hasMatch = searchableFields.some(field => 
          field.toLowerCase().includes(searchTerm)
        );
        if (!hasMatch) return false;
      }
      
      return true;
    });
    
    tableData = filteredProducts;
  }
  
  // Sort by date
  if (sortValue === 'created_at_desc') {
    tableData = [...tableData].sort((a, b) => {
      const dateA = a.created_at || a.Item?.created_at || a.created || a.Item?.created;
      const dateB = b.created_at || b.Item?.created_at || b.created || b.Item?.created;
      return new Date(dateB || 0).getTime() - new Date(dateA || 0).getTime();
    });
  } else if (sortValue === 'created_at_asc') {
    tableData = [...tableData].sort((a, b) => {
      const dateA = a.created_at || a.Item?.created_at || a.created || a.Item?.created;
      const dateB = b.created_at || b.Item?.created_at || b.created || b.Item?.created;
      return new Date(dateA || 0).getTime() - new Date(dateB || 0).getTime();
    });
  }

  let columns = [
    {
      header: 'Image',
      accessor: 'image',
      render: (_: any, row: any, viewType?: string) => {
        // Check for image in different possible locations based on actual API structure
        let imageSrc = null;
        
        // First, check if the image field is a JSON string that needs to be parsed
        if (row.image && typeof row.image === 'string') {
          try {
            const parsedImage = JSON.parse(row.image);
            imageSrc = parsedImage.src || parsedImage.url;
          } catch (e) {
            // If it's not valid JSON, treat it as a direct URL
            imageSrc = row.image;
          }
        } else if (row.image && typeof row.image === 'object') {
          imageSrc = row.image.src || row.image.url;
        } else if (row.images && Array.isArray(row.images) && row.images[0]) {
          if (typeof row.images[0] === 'string') {
            try {
              const parsedImage = JSON.parse(row.images[0]);
              imageSrc = parsedImage.src || parsedImage.url;
            } catch (e) {
              imageSrc = row.images[0];
            }
          } else if (typeof row.images[0] === 'object') {
            imageSrc = row.images[0].src || row.images[0].url;
          } else {
            imageSrc = row.images[0];
          }
        } else if (row.Item?.image && typeof row.Item.image === 'string') {
          try {
            const parsedImage = JSON.parse(row.Item.image);
            imageSrc = parsedImage.src || parsedImage.url;
          } catch (e) {
            imageSrc = row.Item.image;
          }
        } else if (row.Item?.image && typeof row.Item.image === 'object') {
          imageSrc = row.Item.image.src || row.Item.image.url;
        } else if (row.Item?.images && Array.isArray(row.Item.images) && row.Item.images[0]) {
          if (typeof row.Item.images[0] === 'string') {
            try {
              const parsedImage = JSON.parse(row.Item.images[0]);
              imageSrc = parsedImage.src || parsedImage.url;
            } catch (e) {
              imageSrc = row.Item.images[0];
            }
          } else if (typeof row.Item.images[0] === 'object') {
            imageSrc = row.Item.images[0].src || row.Item.images[0].url;
          } else {
            imageSrc = row.Item.images[0];
          }
        } else {
          // Fallback to direct properties
          imageSrc = row.image?.src || row.images?.[0]?.src || row.Item?.image?.src || row.Item?.images?.[0]?.src ||
                    row.src || row.Item?.src || row.featured_image || row.Item?.featured_image;
        }
        
        const title = row.title || row.Item?.title || 'Product';
        
        if (imageSrc && (imageSrc.includes('.jpg') || imageSrc.includes('.png') || imageSrc.includes('cdn.shopify.com'))) {
          return (
            <ImageCell src={imageSrc} alt={title} viewType={viewType === 'grid' ? 'card' : (viewType as 'table' | 'grid' | 'card')} />
          );
        }
        return <span className="text-gray-400">No Image</span>;
      },
    },
    { 
      header: 'Product ID', 
      accessor: 'id',
      render: (_: any, row: any) => {
        const id = row.id || row.Item?.id || row.product_id || row.Item?.product_id;
        return id || '—';
      }
    },
    {
      header: 'Title',
      accessor: 'title',
      render: (value: any, row: any, viewType?: string) => {
        const title = value || row.Item?.title || row.name || row.Item?.name || '—';
        return viewType === 'grid' ? <span className="font-semibold text-base truncate">{title}</span> : title;
      },
    },
    { 
      header: 'Vendor', 
      accessor: 'vendor',
      render: (_: any, row: any) => {
        const vendor = row.vendor || row.Item?.vendor || row.seller || row.Item?.seller;
        return vendor || '—';
      }
    },
    { 
      header: 'Product Type', 
      accessor: 'product_type',
      render: (_: any, row: any) => {
        const type = row.product_type || row.Item?.product_type || row.type || row.Item?.type;
        return type || '—';
      }
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (_: any, row: any) => {
        const status = row.status || row.Item?.status || row.state || row.Item?.state;
        return status || '—';
      }
    },
    { 
      header: 'Tags', 
      accessor: 'tags', 
      render: (value: any, row: any) => {
        const tags = value || row.Item?.tags || row.tag || row.Item?.tag;
        if (Array.isArray(tags)) {
          return tags.join(', ');
        }
        if (typeof tags === 'string') {
          return tags;
        }
        return '—';
      }
    },
    { 
      header: 'Created At', 
      accessor: 'created_at',
      render: (_: any, row: any) => {
        const date = row.created_at || row.Item?.created_at || row.created || row.Item?.created;
        return date ? new Date(date).toLocaleDateString() : '—';
      }
    },
    { 
      header: 'Updated At', 
      accessor: 'updated_at',
      render: (_: any, row: any) => {
        const date = row.updated_at || row.Item?.updated_at || row.updated || row.Item?.updated;
        return date ? new Date(date).toLocaleDateString() : '—';
      }
    },
  ];

  // Filter columns based on visibleColumns
  const filteredColumns = columns.filter(col => visibleColumns.includes(col.accessor as string));

  // Example grouping/aggregation (can be extended as needed)
  // For now, just pass through data as grouping/aggregation is not defined for products

  console.log('ShopifyProducts: Rendering with loading:', loading, 'error:', error, 'products count:', products.length, 'tableData count:', tableData.length);

  if (loading && isInitialLoad) {
    console.log('ShopifyProducts: Showing loading spinner');
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    console.log('ShopifyProducts: Showing error:', error);
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  console.log('ShopifyProducts: Rendering main content');

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

  // Infinite scroll logic - replace pagination
  const totalItems = tableData.length;
  const displayedData = dataOverride || displayedProducts;

  const handlePageChange = (page: number) => {
    // This is now handled by infinite scroll
    console.log('Page change not needed with infinite scroll');
  };

  const handlePageSizeChange = (newPageSize: number) => {
    // This is now handled by infinite scroll
    console.log('Page size change not needed with infinite scroll');
  };

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

  const handleSearchFilterDropdownToggle = () => {
    setShowSearchFilterDropdown(!showSearchFilterDropdown);
  };

  const handleSearchFilterChange = (filter: string) => {
    setSelectedSearchFilter(filter);
    setShowSearchFilterDropdown(false);
  };

  // View type change handler
  const handleViewTypeChange = (newViewType: 'table' | 'grid' | 'card' | 'list') => {
    setViewType(newViewType);
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
      const allRowIds = (dataOverride || displayedProducts).map((row, index) => String(row.id || index));
      setSelectedRows(allRowIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleCopyClick = () => {
    // Copy filtered data to clipboard
    const dataToCopy = dataOverride || displayedProducts;
    
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

  const handleDownload = () => {
    if (!selectedDownloadFields.length || !selectedDownloadFormat) return;
    
    const filtered = (dataOverride || displayedProducts).map(row => {
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
      a.download = 'products_data.json';
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
      a.download = 'products_data.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (selectedDownloadFormat === 'PDF') {
      console.log('PDF download not implemented yet');
      alert('PDF download feature coming soon!');
    }
    
    setShowDownloadDropdown(false);
  };

  // Search filter options
  const searchFilterOptions = [
    { value: 'title', label: 'Product Title' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'product_type', label: 'Product Type' },
    { value: 'tags', label: 'Tags' },
    { value: 'status', label: 'Status' },
    { value: 'price', label: 'Price' },
    { value: 'inventory_quantity', label: 'Inventory' }
  ];

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

  const handleDeleteItem = (item: any) => {
    // Remove the item from the products array
    setProducts(prevProducts => prevProducts.filter(product => product.id !== item.id));
    console.log('Deleted product:', item);
    alert('Product deleted successfully!');
  };

  const handleViewItem = (item: any) => {
    console.log('Viewing product:', item);
    console.log('Product image field:', item.image);
    console.log('Product images field:', item.images);
    console.log('Product Item.image:', item.Item?.image);
    console.log('Product Item.images:', item.Item?.images);
  };

  const handleEditItem = (item: any) => {
    console.log('Editing product:', item);
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
            label: "Total Chunks",
            value: chunkKeys.length.toString(),
            color: "blue",
            icon: <div className="w-6 h-6 bg-blue-500 rounded"></div>
          },
          {
            label: searchValue.trim() ? "Search Results" : "Loaded Items",
            value: displayedProducts.length.toLocaleString(),
            color: "green",
            icon: <div className="w-6 h-6 bg-green-500 rounded"></div>
          },
          {
            label: "Loaded Chunks",
            value: loadedChunks.size.toString(),
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
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={() => setSmartValue(searchValue)}
        searchPlaceholder="Search products by title, vendor, type, status, tags, description..."
        
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
      <div className="flex-1 min-h-0">
        <div className="bg-white p-6 rounded-lg shadow h-full overflow-auto">
          <DataView
            data={dataOverride || displayedProducts}
            columns={columns}
            viewType={viewType}
            onViewTypeChange={handleViewTypeChange}
            onRowSelect={handleRowSelect}
            selectedRows={selectedRows}
            onSelectAll={handleSelectAll}
            // Infinite scroll props instead of pagination
            enableInfiniteScroll={true}
            hasMoreData={hasMoreData}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            renderCard={product => <ProductImageCard product={product} />}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
            // Action handlers
            onViewItem={handleViewItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            showActions={viewType !== 'grid'}
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
          { value: 'title', label: 'Title' },
          { value: 'vendor', label: 'Vendor' },
          { value: 'product_type', label: 'Product Type' },
          { value: 'status', label: 'Status' },
          { value: 'tags', label: 'Tags' },
          { value: 'created_at', label: 'Created At' },
          { value: 'updated_at', label: 'Updated At' }
        ]}
      />
    </div>
  );
} 