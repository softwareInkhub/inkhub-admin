'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchBoards } from '@/store/slices/pinterestSlice';
import DataView from '@/components/common/DataView';
import UniversalAnalyticsBar from '@/components/common/UniversalAnalyticsBar';
import UniversalOperationBar from '@/components/common/UniversalOperationBar';
import DecoupledHeader from '@/components/common/DecoupledHeader';
import ImageCell from '@/components/common/ImageCell';
import FilterBar from '@/components/common/FilterBar';
import ViewsBar from '@/components/common/ViewsBar';

export default function PinterestBoards() {
  const dispatch = useDispatch<AppDispatch>();
  const { boards, loading, error, boardsLastEvaluatedKey, totalBoards } = useSelector((state: RootState) => state.pinterest);

  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count' });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
  let filteredBoards = boards.filter(board => board.Item)
    .filter((row: any) =>
      (privacy === 'All' || row.Item?.privacy === privacy) &&
      (owner === 'All' || row.Item?.owner?.username === owner)
    );
  // Smart filter logic
  if (smartValue) {
    filteredBoards = filteredBoards.filter((row: any) => {
      const val = smartField.split('.').reduce((acc, key) => acc?.[key], row);
      if (Array.isArray(val)) {
        return val.some((v) => String(v).toLowerCase().includes(smartValue.toLowerCase()));
      }
      return String(val ?? '').toLowerCase().includes(smartValue.toLowerCase());
    });
  }

  let tableData = filteredBoards;
  let columns = [
    {
      header: 'Cover',
      accessor: 'Item.media.image_cover_url',
      render: (_: any, row: any, viewType?: string) =>
        <ImageCell src={row.Item?.media?.image_cover_url} alt={row.Item?.name} viewType={viewType} />,
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

  // Reset all filters
  const handleResetFilters = () => {
    setPrivacy('All');
    setOwner('All');
    setSmartField('Item.name');
    setSmartValue('');
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
    <div className="h-full flex flex-col">
      <UniversalAnalyticsBar section="pinterest" tabKey="boards" total={totalBoards} currentCount={filteredBoards.length} />
      <ViewsBar />
      <UniversalOperationBar 
        section="pinterest" 
        tabKey="boards" 
        analytics={analytics} 
        data={filteredBoards}
        selectedData={selectedRows}
      />
      <div className="flex-1 min-h-0">
        <div className="bg-white p-6 rounded-lg shadow h-full overflow-auto">
          <DataView
            data={filteredBoards}
            columns={filteredColumns}
            section="pinterest"
            tabKey="boards"
            onSelectionChange={setSelectedRows}
            onLoadMore={handleNextPage}
            hasMore={!!boardsLastEvaluatedKey}
            isLoadingMore={isLoadingMore}
            status={privacy}
            setStatus={setPrivacy}
            statusOptions={privacyOptions}
            type={owner}
            setType={setOwner}
            typeOptions={ownerOptions}
            board={''}
            setBoard={() => {}}
            boardOptions={[]}
            smartField={smartField}
            setSmartField={setSmartField}
            smartFieldOptions={smartFieldOptions}
            smartValue={smartValue}
            setSmartValue={setSmartValue}
            onResetFilters={handleResetFilters}
          />
        </div>
      </div>
    </div>
  );
} 