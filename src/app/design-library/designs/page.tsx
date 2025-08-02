'use client';

import { useEffect, useState, useRef } from 'react';
import DataView from '@/components/common/DataView';
import { ProductsAnalyticsOptions } from '../../shopify/ShopifyAnalyticsBar';
import lodashGroupBy from 'lodash/groupBy';
import UnifiedDataHeader from '@/components/common/UnifiedDataHeader';
import DecoupledHeader from '@/components/common/DecoupledHeader';
import ImageCell from '@/components/common/ImageCell';
import GridView from '@/components/common/GridView';
import { fetchAllChunks } from '@/utils/cache';
import Pagination from '@/components/common/Pagination';
import DesignCard from '@/components/cards/DesignCard';
import DesignImageCard from '@/components/cards/DesignImageCard';
import CreateFilterModal from '@/components/common/CreateFilterModal';

export default function DesignLibrary() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDesigns, setTotalDesigns] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    const fetchDesigns = async () => {
      setLoading(true);
      setError(null);
      try {
        const allItems = await fetchAllChunks('admin-design-image');
        setDesigns(allItems);
        setTotalDesigns(allItems.length);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch designs');
      } finally {
        setLoading(false);
      }
    };
    fetchDesigns();
  }, []);

  // Multi-filter states
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [board, setBoard] = useState('All');
  // Smart filter states
  const [smartField, setSmartField] = useState('designName');
  const [smartValue, setSmartValue] = useState('');

  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count' });
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'designImageUrl', 'designName', 'designPrice', 'designSize', 'designStatus', 'designType', 'orderName', 'designTags', 'designCreatedAt', 'designUpdateAt'
  ]);

  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('');
  const sortOptions = [
    { label: 'Created At: Latest', value: 'created_at_desc' },
    { label: 'Created At: Oldest', value: 'created_at_asc' },
  ];

  // Add view type state
  const [viewType, setViewType] = useState<'table' | 'grid' | 'card' | 'list'>('table');

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
  
  // Search filter state
  const [selectedSearchFilter, setSelectedSearchFilter] = useState<string>('');
  const [showSearchFilterDropdown, setShowSearchFilterDropdown] = useState(false);

  // Fetch saved filters for this user and page
  useEffect(() => {
    const userId = (window as any).currentUserId || 'demo-user';
    const sectionTabKey = `design-library#designs`;
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

  // Build filter options from data
  const statusOptions = ['All', ...Array.from(new Set(designs.map((d: any) => d.designStatus).filter(Boolean)))];
  const typeOptions = ['All', ...Array.from(new Set(designs.map((d: any) => d.designType).filter(Boolean)))];
  const boardOptions = ['All', ...Array.from(new Set(designs.map((d: any) => d.orderName).filter(Boolean)))];
  const smartFieldOptions = [
    { label: 'Name', value: 'designName' },
    { label: 'Status', value: 'designStatus' },
    { label: 'Type', value: 'designType' },
    { label: 'Board', value: 'orderName' },
    { label: 'Tags', value: 'designTags' },
    { label: 'Price', value: 'designPrice' },
    { label: 'Size', value: 'designSize' },
  ];

  // Multi-filter logic
  let filteredDesigns = designs.filter((row: any) =>
    (status === 'All' || row.designStatus === status) &&
    (type === 'All' || row.designType === type) &&
    (board === 'All' || row.orderName === board)
  );
  // Enhanced search functionality
  if (smartValue.trim()) {
    const searchTerm = smartValue.toLowerCase();
    filteredDesigns = filteredDesigns.filter((row: any) => {
      // Search across multiple fields
      const searchableFields = [
        row.designName?.toString() || '',
        row.name?.toString() || '',
        row.title?.toString() || '',
        row.designDescription?.toString() || '',
        row.description?.toString() || '',
        row.designStatus?.toString() || '',
        row.status?.toString() || '',
        row.designType?.toString() || '',
        row.type?.toString() || '',
        row.orderName?.toString() || '',
        row.board?.toString() || '',
        row.designTags?.toString() || '',
        row.tags?.toString() || '',
        row.designPrice?.toString() || '',
        row.price?.toString() || '',
        row.designSize?.toString() || '',
        row.size?.toString() || '',
        row.category?.toString() || '',
        row.style?.toString() || '',
        row.designCreatedAt?.toString() || '',
        row.created_at?.toString() || '',
        row.designUpdateAt?.toString() || '',
        row.updated_at?.toString() || '',
        row.id?.toString() || '',
        row.designId?.toString() || ''
      ];
      
      return searchableFields.some(field => 
        field.toLowerCase().includes(searchTerm)
      );
    });
  }

  let columns = [
    {
      header: 'Image',
      accessor: 'designImageUrl',
      render: (value: string, row: any, viewType?: 'table' | 'grid' | 'card') => {
        // Check if the URL is valid
        if (!value) {
          return <span className="text-gray-400 text-xs">No Image</span>;
        }
        
        // Check if it's a valid image URL
        const isImageUrl = (url: string) => {
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
          const lowerUrl = url.toLowerCase();
          return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
                 lowerUrl.includes('s3.amazonaws.com') || 
                 lowerUrl.includes('cdn.shopify.com');
        };
        
        if (!isImageUrl(value)) {
          return <span className="text-gray-400 text-xs">Invalid URL</span>;
        }
        
        return <ImageCell src={value} alt="Design" viewType={viewType} />;
      },
    },
    { header: 'Name', accessor: 'designName' },
    { header: 'Price', accessor: 'designPrice', render: (value: string) => value ? `₹${value}` : 'N/A' },
    { header: 'Size', accessor: 'designSize' },
    { header: 'Status', accessor: 'designStatus' },
    { header: 'Type', accessor: 'designType' },
    { header: 'Order', accessor: 'orderName' },
    {
      header: 'Tags',
      accessor: 'designTags',
      render: (tags: string[]) => (
        <div className="flex flex-wrap gap-1">
          {tags?.map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
      ),
    },
    { header: 'Created At', accessor: 'designCreatedAt', render: (value: string) => value ? new Date(value).toLocaleDateString() : 'N/A' },
    { header: 'Updated At', accessor: 'designUpdateAt', render: (value: string) => value ? new Date(value).toLocaleDateString() : 'N/A' },
  ];

  // Filter columns based on visibleColumns
  const filteredColumns = columns.filter(col => visibleColumns.includes(col.accessor as string));

  let tableData = filteredDesigns;
  // Note: Removed parent-level sorting to let DataView handle sorting
  // if (sortValue === 'created_at_desc') {
  //   tableData = [...tableData].sort((a, b) => new Date(b.designCreatedAt).getTime() - new Date(a.designCreatedAt).getTime());
  // } else if (sortValue === 'created_at_asc') {
  //   tableData = [...tableData].sort((a, b) => new Date(a.designCreatedAt).getTime() - new Date(b.designCreatedAt).getTime());
  // }

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

  // Reset all filters
  const handleResetFilters = () => {
    setStatus('All');
    setType('All');
    setBoard('All');
    setSmartField('designName');
    setSmartValue('');
  };

  // Pagination logic
  const totalItems = tableData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = tableData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
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

  // Row selection handler
  const handleRowSelect = (rowId: string, selected: boolean) => {
    if (selected) {
      setSelectedRows(prev => [...prev, rowId]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== rowId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(paginatedData.map((row: any) => row.id || row.designName));
    } else {
      setSelectedRows([]);
    }
  };

  const handleCopyClick = () => {
    // Copy filtered data to clipboard
    const dataToCopy = paginatedData;
    
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
    
    const filtered = (dataOverride || paginatedData).map(row => {
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
      a.download = 'designs_data.json';
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
      a.download = 'designs_data.csv';
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
    { value: 'title', label: 'Design Title' },
    { value: 'description', label: 'Description' },
    { value: 'category', label: 'Category' },
    { value: 'tags', label: 'Tags' },
    { value: 'status', label: 'Status' },
    { value: 'created_at', label: 'Created Date' }
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
    // Remove the item from the designs array
    setDesigns(prevDesigns => prevDesigns.filter(design => design.id !== item.id));
    console.log('Deleted design:', item);
    alert('Design deleted successfully!');
  };

  const handleViewItem = (item: any) => {
    console.log('Viewing design:', item);
  };

  const handleEditItem = (item: any) => {
    console.log('Editing design:', item);
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
            value: totalDesigns.toLocaleString(),
            color: "blue",
            icon: <div className="w-6 h-6 bg-blue-500 rounded"></div>
          },
          {
            label: searchValue.trim() ? "Search Results" : "Loaded Data",
            value: tableData.length.toLocaleString(),
            color: "green",
            icon: <div className="w-6 h-6 bg-green-500 rounded"></div>
          },
          {
            label: "Algolia Count",
            value: "0",
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
        searchPlaceholder="Search designs by name, description, status, type, tags, price, size..."
        
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
            data={dataOverride || filteredDesigns}
            columns={columns}
            viewType={viewType}
            onViewTypeChange={setViewType}
            onRowSelect={handleRowSelect}
            selectedRows={selectedRows}
            onSelectAll={handleSelectAll}
            // Pagination props
            enablePagination={true}
            totalItems={totalDesigns}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            renderCard={design => <DesignImageCard design={design} />}
            // Action handlers
            onViewItem={handleViewItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            showActions={viewType !== 'grid'}
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
          { value: 'designName', label: 'Design Name' },
          { value: 'designDescription', label: 'Description' },
          { value: 'category', label: 'Category' },
          { value: 'style', label: 'Style' },
          { value: 'tags', label: 'Tags' },
          { value: 'created_at', label: 'Created At' },
          { value: 'updated_at', label: 'Updated At' }
        ]}
      />
    </div>
  );
} 