'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchPins } from '@/store/slices/pinterestSlice';
import DataView from '@/components/common/DataView';
import Image from 'next/image';
import lodashGroupBy from 'lodash/groupBy';
import UniversalAnalyticsBar from '@/components/common/UniversalAnalyticsBar';
import UniversalOperationBar from '@/components/common/UniversalOperationBar';
import ImageCell from '@/components/common/ImageCell';
import FilterBar from '@/components/common/FilterBar';
import ViewsBar from '@/components/common/ViewsBar';

export default function PinterestPins() {
  const dispatch = useDispatch<AppDispatch>();
  const { pins, loading, error, pinsLastEvaluatedKey, totalPins } = useSelector((state: RootState) => state.pinterest);

  // Analytics/filter/group state
  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count' });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'Item.media.images.600x.url', 'Item.title', 'Item.description', 'Item.board_owner.username', 'Item.created_at'
  ]);

  // Multi-filter states
  const [board, setBoard] = useState('All');
  // Smart filter states
  const [smartField, setSmartField] = useState('Item.title');
  const [smartValue, setSmartValue] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsInitialLoad(true);
      await dispatch(fetchPins({ limit: 100 }));
      setIsInitialLoad(false);
    };
    fetchData();
  }, [dispatch]);

  const handleNextPage = async () => {
    if (!pinsLastEvaluatedKey || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await dispatch(fetchPins({ limit: 100, lastKey: pinsLastEvaluatedKey }));
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Build filter options from data
  const boardOptions = ['All', ...Array.from(new Set(pins.map((d: any) => d.Item?.board_owner?.username).filter(Boolean)))];
  const smartFieldOptions = [
    { label: 'Title', value: 'Item.title' },
    { label: 'Description', value: 'Item.description' },
    { label: 'Board', value: 'Item.board_owner.username' },
    { label: 'Created At', value: 'Item.created_at' },
  ];

  // Multi-filter logic
  let filteredPins = pins.filter(pin => pin.Item)
    .filter((row: any) =>
      (board === 'All' || row.Item?.board_owner?.username === board)
    );
  // Smart filter logic
  if (smartValue) {
    filteredPins = filteredPins.filter((row: any) => {
      const val = smartField.split('.').reduce((acc, key) => acc?.[key], row);
      if (Array.isArray(val)) {
        return val.some((v) => String(v).toLowerCase().includes(smartValue.toLowerCase()));
      }
      return String(val ?? '').toLowerCase().includes(smartValue.toLowerCase());
    });
  }

  // Grouping and aggregation
  let tableData = filteredPins;
  let columns = [
    {
      header: 'Image',
      accessor: 'Item.media.images.600x.url',
      render: (_: any, row: any, viewType?: string) => {
        const url = row.Item?.media?.images?.['600x']?.url;
        return <ImageCell src={url} alt="Pin" viewType={viewType} />;
      }
    },
    {
      header: 'Title',
      accessor: 'Item.title',
      render: (_: any, row: any) => row.Item?.title || '—',
    },
    {
      header: 'Description',
      accessor: 'Item.description',
      render: (_: any, row: any) => row.Item?.description || '—',
    },
    {
      header: 'Board',
      accessor: 'Item.board_owner.username',
      render: (_: any, row: any) => row.Item?.board_owner?.username || '—',
    },
    {
      header: 'Created At',
      accessor: 'Item.created_at',
      render: (_: any, row: any) => row.Item?.created_at || '—',
    },
  ];

  // Filter columns based on visibleColumns
  const filteredColumns = columns.filter(col => visibleColumns.includes(col.accessor as string));

  if (analytics.groupBy && analytics.groupBy !== 'None') {
    const grouped = lodashGroupBy(filteredPins, pin => pin.Item?.board_owner?.username);
    tableData = Object.entries(grouped).map(([group, items]) => {
      let value = 0;
      if (analytics.aggregate === 'Count') value = items.length;
      return {
        group,
        value,
        items,
      };
    });
    columns = [
      { header: 'Board', accessor: 'group', render: (value: any, row: any) => row.group || '—' },
      { header: 'Count', accessor: 'value', render: (value: any, row: any) => row.value ?? '—' },
    ];
  }

  // Reset all filters
  const handleResetFilters = () => {
    setBoard('All');
    setSmartField('Item.title');
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
      <UniversalAnalyticsBar section="pinterest" tabKey="pins" total={totalPins} currentCount={filteredPins.length} />
      <ViewsBar />
      <UniversalOperationBar 
        section="pinterest" 
        tabKey="pins" 
        analytics={analytics} 
        data={filteredPins}
        selectedData={selectedRows}
      />
      <div className="flex-1 min-h-0">
        <div className="bg-white p-6 rounded-lg shadow h-full overflow-auto">
          <DataView
            data={filteredPins}
            columns={filteredColumns}
            onSort={() => {}}
            onSearch={() => {}}
            section="pinterest"
            tabKey="pins"
            onSelectionChange={setSelectedRows}
            onLoadMore={handleNextPage}
            hasMore={!!pinsLastEvaluatedKey}
            isLoadingMore={isLoadingMore}
            status={''}
            setStatus={() => {}}
            statusOptions={[]}
            type={''}
            setType={() => {}}
            typeOptions={[]}
            board={board}
            setBoard={setBoard}
            boardOptions={boardOptions}
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