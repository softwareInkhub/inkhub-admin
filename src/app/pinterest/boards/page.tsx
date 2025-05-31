'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchBoards } from '@/store/slices/pinterestSlice';
import DataView from '@/components/common/DataView';
import UniversalAnalyticsBar from '@/components/common/UniversalAnalyticsBar';
import UniversalOperationBar from '@/components/common/UniversalOperationBar';
import DecoupledHeader from '@/components/common/DecoupledHeader';

export default function PinterestBoards() {
  const dispatch = useDispatch<AppDispatch>();
  const { boards, loading, error, boardsLastEvaluatedKey } = useSelector((state: RootState) => state.pinterest);

  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count' });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'Item.media.image_cover_url', 'Item.name', 'Item.description', 'Item.pin_count', 'Item.privacy', 'Item.owner.username', 'Item.created_at'
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setIsInitialLoad(true);
      await dispatch(fetchBoards({ limit: 100 }));
      setIsInitialLoad(false);
    };
    fetchData();
  }, [dispatch]);

  const handleNextPage = async () => {
    if (!boardsLastEvaluatedKey || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await dispatch(fetchBoards({ limit: 100, lastKey: boardsLastEvaluatedKey }));
    } finally {
      setIsLoadingMore(false);
    }
  };

  let filteredBoards = boards.filter(board => board.Item);
  if (analytics.filter && analytics.filter !== 'All') {
    filteredBoards = filteredBoards.filter(board => board.Item?.owner?.username === analytics.filter);
  }

  let tableData = filteredBoards;
  let columns = [
    {
      header: 'Cover',
      accessor: 'Item.media.image_cover_url',
      render: (value: any, row: any) =>
        row.Item?.media?.image_cover_url ? (
          <img
            src={row.Item.media.image_cover_url}
            alt={row.Item.name}
            className="w-16 h-12 object-cover rounded"
          />
        ) : (
          <span>No Image</span>
        ),
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

  // Example grouping/aggregation (can be extended as needed)
  // For now, just pass through data as grouping/aggregation is not defined for boards

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
    <div className="h-full flex flex-col">
      <UniversalAnalyticsBar section="pinterest" tabKey="boards" onChange={setAnalytics} />
      <UniversalOperationBar 
        section="pinterest" 
        tabKey="boards" 
        analytics={analytics} 
        data={tableData}
        selectedData={selectedRows}
      />
      <div className="flex-1 min-h-0">
        <div className="bg-white p-6 rounded-lg shadow h-full overflow-auto">
          <DataView
            data={tableData}
            columns={filteredColumns}
            section="pinterest"
            tabKey="boards"
            onSelectionChange={setSelectedRows}
            onLoadMore={handleNextPage}
            hasMore={!!boardsLastEvaluatedKey}
            isLoadingMore={isLoadingMore}
          />
        </div>
      </div>
    </div>
  );
} 