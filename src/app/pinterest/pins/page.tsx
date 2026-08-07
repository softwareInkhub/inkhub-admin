'use client';

import { useEffect, useState } from 'react';
import DataView from '@/components/common/DataView';
import UniversalAnalyticsBar from '@/components/common/UniversalAnalyticsBar';
import UniversalOperationBar from '@/components/common/UniversalOperationBar';
import ViewsBar from '@/components/common/ViewsBar';
import { fetchAllChunks } from '@/utils/cache';

export default function PinterestPins() {
  const [pins, setPins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load more states
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadedChunks, setLoadedChunks] = useState<any[]>([]);
  const [allAvailableData, setAllAvailableData] = useState<any[]>([]);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);

  useEffect(() => {
    const fetchPins = async () => {
      setLoading(true);
      setError(null);
      try {
        const allItems = await fetchAllChunks('pinterest-inkhub-get-pins');
        setAllAvailableData(allItems);
        // Initially load first chunk (first 100 items)
        const initialChunk = allItems.slice(0, 100);
        setLoadedChunks(initialChunk);
        setHasMore(allItems.length > 100);
        setIsFullyLoaded(false);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch pins');
      } finally {
        setLoading(false);
      }
    };
    fetchPins();
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
      console.error('Failed to load more pins:', err);
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
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'id', 'title', 'description', 'link', 'media_type', 'created_at', 'updated_at'
  ]);

  // Add saved filter state
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [activeSavedFilter, setActiveSavedFilter] = useState<any | null>(null);
  const [dataOverride, setDataOverride] = useState<any[] | null>(null);

  // Handle saved filter selection
  const handleApplySavedFilter = (filter: any) => {
    setActiveSavedFilter(filter);
    // Apply the filter logic here
    console.log('Applying filter:', filter);
  };

  // Handle saved filter editing
  const handleEditSavedFilter = (filter: any) => {
    const newName = prompt('Edit filter name:', filter.filterName || 'Unnamed');
    if (newName && newName.trim() !== filter.filterName) {
      const updatedFilter = { ...filter, filterName: newName.trim() };
      setSavedFilters(prev => prev.map(f => f.id === filter.id ? updatedFilter : f));
      if (activeSavedFilter?.id === filter.id) {
        setActiveSavedFilter(updatedFilter);
      }
    }
  };

  const columns = [
    {
      header: 'Image',
      accessor: 'image',
      render: (_: any, row: any) => {
        const imageSrc = row.image?.original?.url || row.image?.url || row.media?.images?.['1200x']?.url;
        return (
          <div className="flex items-center justify-center">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={row.title || 'Pin'}
                className="w-8 h-8 object-cover rounded"
              />
            ) : (
              <span className="text-gray-400">No Image</span>
            )}
          </div>
        );
      }
    },
    { 
      header: 'ID', 
      accessor: 'id',
      render: (_: any, row: any) => row.id || row.Item?.id || '—'
    },
    { 
      header: 'Title', 
      accessor: 'title',
      render: (_: any, row: any) => row.title || row.Item?.title || '—'
    },
    { 
      header: 'Description', 
      accessor: 'description',
      render: (_: any, row: any) => {
        const desc = row.description || row.Item?.description || '';
        return desc.length > 50 ? `${desc.substring(0, 50)}...` : desc || '—';
      }
    },
    { 
      header: 'Link', 
      accessor: 'link',
      render: (_: any, row: any) => {
        const link = row.link || row.Item?.link || '';
        return link ? (
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            View
          </a>
        ) : '—';
      }
    },
    { 
      header: 'Media Type', 
      accessor: 'media_type',
      render: (_: any, row: any) => row.media_type || row.Item?.media_type || '—'
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
    <div className="flex flex-col">
      <UniversalAnalyticsBar section="pinterest" tabKey="pins" total={allAvailableData.length} currentCount={loadedChunks.length} />
      <ViewsBar
        savedFilters={savedFilters}
        onSelect={handleApplySavedFilter}
        onEdit={handleEditSavedFilter}
        activeFilterId={activeSavedFilter?.id}
      />
      <UniversalOperationBar 
        section="pinterest" 
        tabKey="pins" 
        analytics={analytics} 
        data={loadedChunks}
        selectedData={selectedRows}
      />
      <div className="flex-1 min-h-0">
        <div className="bg-white rounded-lg shadow h-full overflow-auto">
          <DataView
            data={dataOverride || loadedChunks}
            columns={filteredColumns}
            section="pinterest"
            tabKey="pins"
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
          />
        </div>
        {/* Load More Button */}
        {hasMore && (
          <div className="mt-2 flex justify-center">
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
        {/* Load Less Button */}
        {isFullyLoaded && (
          <div className="mt-2 flex justify-center">
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
  );
} 