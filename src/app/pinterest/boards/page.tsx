'use client';

import { useEffect, useState, Fragment, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchBoards } from '@/store/slices/pinterestSlice';
import DataView from '@/components/common/DataView';
import Image from 'next/image';
import lodashGroupBy from 'lodash/groupBy';
import UnifiedDataHeader from '@/components/common/UnifiedDataHeader';
import DecoupledHeader from '@/components/common/DecoupledHeader';
import ImageCell from '@/components/common/ImageCell';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { fetchAllChunks } from '@/utils/cache';
import Pagination from '@/components/common/Pagination';
import BoardCard from '@/components/cards/BoardCard';
import PinterestBoardImageCard from '@/components/cards/PinterestBoardImageCard';
import CreateFilterModal from '@/components/common/CreateFilterModal';

export default function PinterestBoards() {
  // Remove Redux usage for boards
  // const dispatch = useDispatch<AppDispatch>();
  // const { boards, loading, error, boardsLastEvaluatedKey, totalBoards } = useSelector((state: RootState) => state.pinterest);
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count' });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'Item.media.image_cover_url', 'Item.name', 'Item.description', 'Item.pin_count', 'Item.privacy', 'Item.owner.username', 'Item.created_at'
  ]);

  // Multi-filter states
  const [privacy, setPrivacy] = useState('All');
  const [owner, setOwner] = useState('All');
  // Smart filter states
  const [smartField, setSmartField] = useState('Item.name');
  const [smartValue, setSmartValue] = useState('');

  // Active accounts state
  const [activeAccountNames, setActiveAccountNames] = useState<string[]>([]);

  // Fetch active accounts on mount
  useEffect(() => {
    const fetchActiveAccounts = async () => {
      const res = await fetch('/api/pinterest/accounts');
      const data = await res.json();
      const names = (data.accounts || [])
        .filter((acc: any) => acc.active !== false) // Show all accounts unless explicitly marked as inactive
        .map((acc: any) => acc.accountName);
      console.log('All accounts:', data.accounts);
      console.log('Active account names:', names);
      setActiveAccountNames(names);
    };
    fetchActiveAccounts();
  }, []);

  useEffect(() => {
    const fetchBoards = async () => {
      setLoading(true);
      setError(null);
      try {
        const allItems = await fetchAllChunks('pinterest_inkhub_get_boards');
        setBoards(allItems);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch boards');
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  // Note: Pagination removed since we're now fetching all cached data at once

  // Build filter options from data
  const privacyOptions = ['All', ...Array.from(new Set(boards.map((d: any) => d.Item?.privacy).filter(Boolean)))];
  const ownerOptions = ['All', ...Array.from(new Set(boards.map((d: any) => d.Item?.owner?.username).filter(Boolean)))];
  const smartFieldOptions = [
    { label: 'Name', value: 'Item.name' },
    { label: 'Description', value: 'Item.description' },
    { label: 'Owner', value: 'Item.owner.username' },
    { label: 'Privacy', value: 'Item.privacy' },
  ];

  // Multi-filter logic
  let filteredBoards = boards.filter(board => board.Item);
  console.log('Initial boards after Item filter:', filteredBoards.length);
  
  // Temporarily disable account filtering to debug
  // if (activeAccountNames.length > 0) {
  //   console.log('Active account names:', activeAccountNames);
  //   filteredBoards = filteredBoards.filter((row: any) =>
  //     activeAccountNames.includes(row.Item?.owner?.username)
  //   );
  //   console.log('Boards after active accounts filter:', filteredBoards.length);
  // } else {
  //   console.log('No active accounts loaded yet, showing all boards');
  // }
  
  // Apply other filters
  filteredBoards = filteredBoards.filter((row: any) =>
    (privacy === 'All' || row.Item?.privacy === privacy) &&
    (owner === 'All' || row.Item?.owner?.username === owner)
  );
  console.log('Final filtered boards:', filteredBoards.length);
  // Enhanced search functionality
  if (smartValue.trim()) {
    const searchTerm = smartValue.toLowerCase();
    filteredBoards = filteredBoards.filter((row: any) => {
      // Search across multiple fields
      const searchableFields = [
        row.title?.toString() || '',
        row.name?.toString() || '',
        row.Item?.title?.toString() || '',
        row.Item?.name?.toString() || '',
        row.boardName?.toString() || '',
        row.Item?.boardName?.toString() || '',
        row.description?.toString() || '',
        row.Item?.description?.toString() || '',
        row.boardDescription?.toString() || '',
        row.Item?.boardDescription?.toString() || '',
        row.owner?.toString() || '',
        row.Item?.owner?.toString() || '',
        row.owner?.username?.toString() || '',
        row.Item?.owner?.username?.toString() || '',
        row.username?.toString() || '',
        row.Item?.username?.toString() || '',
        row.privacy?.toString() || '',
        row.Item?.privacy?.toString() || '',
        row.pin_count?.toString() || '',
        row.Item?.pin_count?.toString() || '',
        row.pins?.toString() || '',
        row.Item?.pins?.toString() || '',
        row.tags?.toString() || '',
        row.Item?.tags?.toString() || '',
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

  let tableData = filteredBoards;
  
  // Add state for search, sort, etc.
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('');
  const sortOptions = [
    { label: 'Created At: Latest', value: 'created_at_desc' },
    { label: 'Created At: Oldest', value: 'created_at_asc' },
  ];

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
      const allRowIds = (dataOverride || paginatedData).map((row, index) => String(row.id || index));
      setSelectedRows(allRowIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleCopyClick = () => {
    // Copy filtered data to clipboard
    const dataToCopy = dataOverride || paginatedData;
    
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
      a.download = 'boards_data.json';
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
      a.download = 'boards_data.csv';
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
    { value: 'name', label: 'Board Name' },
    { value: 'description', label: 'Description' },
    { value: 'privacy', label: 'Privacy' },
    { value: 'owner', label: 'Owner' },
    { value: 'pin_count', label: 'Pin Count' },
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
  
  // Note: Removed parent-level sorting to let DataView handle sorting
  // if (sortValue === 'created_at_desc') {
  //   tableData = [...tableData].sort((a, b) => new Date(b.Item?.created_at).getTime() - new Date(a.Item?.created_at).getTime());
  // } else if (sortValue === 'created_at_asc') {
  //   tableData = [...tableData].sort((a, b) => new Date(a.Item?.created_at).getTime() - new Date(b.Item?.created_at).getTime());
  // }

  let columns = [
    {
      header: 'Cover',
      accessor: 'Item.media.image_cover_url',
      render: (_: any, row: any, viewType?: string) =>
        <ImageCell src={row.Item?.media?.image_cover_url} alt={row.Item?.name} viewType={viewType as 'table' | 'grid' | 'card' | 'list'} />,
    },
    { header: 'Name', accessor: 'Item.name', render: (_: any, row: any) => row.Item?.name || '—' },
    { header: 'Description', accessor: 'Item.description', render: (_: any, row: any) => row.Item?.description || '—' },
    { header: 'Pins', accessor: 'Item.pin_count', render: (_: any, row: any) => row.Item?.pin_count ?? '—' },
    { header: 'Privacy', accessor: 'Item.privacy', render: (_: any, row: any) => row.Item?.privacy || '—' },
    { header: 'Owner', accessor: 'Item.owner.username', render: (_: any, row: any) => row.Item?.owner?.username || '—' },
    { header: 'Created At', accessor: 'Item.created_at', render: (_: any, row: any) => row.Item?.created_at || '—' },
  ];

  // Filter columns based on visibleColumns
  const filteredColumns = columns.filter(col => visibleColumns.includes(col.accessor as string));

  // Reset all filters
  const handleResetFilters = () => {
    setPrivacy('All');
    setOwner('All');
    setSmartField('Item.name');
    setSmartValue('');
  };

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
    const sectionTabKey = `pinterest#boards`;
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

  const handleDeleteItem = (item: any) => {
    // Remove the item from the boards array
    setBoards(prevBoards => prevBoards.filter(board => board.id !== item.id));
    console.log('Deleted item:', item);
    alert('Item deleted successfully!');
  };

  const handleViewItem = (item: any) => {
    console.log('Viewing item:', item);
  };

  const handleEditItem = (item: any) => {
    console.log('Editing item:', item);
  };

  const handleCreateFilter = (newFilter: any) => {
    console.log('Creating new filter:', newFilter);
    // Add the new filter to saved filters
    setSavedFilters(prev => [...prev, newFilter]);
    // You could also save to localStorage or API here
  };

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

  return (
    <div className="flex flex-col h-full">
      <UnifiedDataHeader
        // Analytics cards
        analyticsCards={[
          {
            label: "Total Data",
            value: boards.length.toLocaleString(),
            color: "blue",
            icon: <div className="w-6 h-6 bg-blue-500 rounded"></div>
          },
          {
            label: searchValue.trim() ? "Search Results" : "Loaded Data",
            value: filteredBoards.length.toLocaleString(),
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
        searchPlaceholder="Search boards by title, description, owner, privacy, pin count..."
        
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
            data={dataOverride || filteredBoards}
            columns={columns}
            viewType={viewType}
            onViewTypeChange={handleViewTypeChange}
            onRowSelect={handleRowSelect}
            selectedRows={selectedRows}
            onSelectAll={handleSelectAll}
            // Pagination props
            enablePagination={true}
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            renderCard={board => <PinterestBoardImageCard board={board} />}
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
          { value: 'title', label: 'Title' },
          { value: 'description', label: 'Description' },
          { value: 'owner', label: 'Owner' },
          { value: 'privacy', label: 'Privacy' },
          { value: 'pin_count', label: 'Pin Count' },
          { value: 'created_at', label: 'Created At' },
          { value: 'updated_at', label: 'Updated At' }
        ]}
      />
    </div>
  );
} 