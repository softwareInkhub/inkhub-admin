'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchDesigns } from '@/store/slices/designLibrarySlice';
import DataView from '@/components/common/DataView';
import Image from 'next/image';
// import UniversalAnalyticsBar from '@/components/common/UniversalAnalyticsBar';
// import UniversalOperationBar from '@/components/common/UniversalOperationBar';

export default function DesignLibrary() {
  const dispatch = useDispatch<AppDispatch>();
  const { designs, loading, error, lastEvaluatedKey } = useSelector((state: RootState) => state.designLibrary);

  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count' });
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!initialLoaded) {
      dispatch(fetchDesigns({ limit: 100 }));
      setInitialLoaded(true);
    }
  }, [dispatch, initialLoaded]);

  const handleNextPage = () => {
    if (lastEvaluatedKey && !isLoadingMore) {
      setIsLoadingMore(true);
      dispatch(fetchDesigns({ limit: 100, lastKey: lastEvaluatedKey }))
        .then(() => setPage((p) => p + 1))
        .finally(() => setIsLoadingMore(false));
    }
  };

  let filteredDesigns = designs;
  if (analytics.filter && analytics.filter !== 'All') {
    filteredDesigns = filteredDesigns.filter(design => design.designStatus === analytics.filter || design.designType === analytics.filter);
  }

  let tableData = filteredDesigns;
  let columns = [
    {
      header: 'Image',
      accessor: 'designImageUrl',
      render: (value: string) => (
        <div className="relative w-32 h-32">
          {value ? (
            <Image
              src={value}
              alt="Design"
              fill
              className="object-contain rounded-lg"
              sizes="(max-width: 128px) 100vw, 128px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>
      ),
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

  // Example grouping/aggregation (can be extended as needed)
  // For now, just pass through data as grouping/aggregation is not defined for designs

  if (loading && !initialLoaded) {
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
      {/* <UniversalAnalyticsBar section="design library" tabKey="designs" onChange={setAnalytics} /> */}
      {/* <UniversalOperationBar section="design library" tabKey="designs" analytics={analytics} data={tableData} /> */}
      <div className="flex-1 min-h-0">
        <div className="bg-white p-6 rounded-lg shadow h-full overflow-auto">
          <DataView
            data={tableData}
            columns={columns}
            onSort={() => {}}
            onSearch={() => {}}
          />
          {/* Pagination Controls */}
          <div className="flex justify-end mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 flex items-center gap-2"
              onClick={handleNextPage}
              disabled={!lastEvaluatedKey || isLoadingMore}
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