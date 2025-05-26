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

export default function PinterestPins() {
  const dispatch = useDispatch<AppDispatch>();
  const { pins, loading, error } = useSelector((state: RootState) => state.pinterest);

  // Analytics/filter/group state
  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count' });

  useEffect(() => {
    dispatch(fetchPins());
  }, [dispatch]);

  // Filter out pins without Item
  let filteredPins = pins.filter(pin => pin.Item);
  if (analytics.filter && analytics.filter !== 'All') {
    filteredPins = filteredPins.filter(pin => pin.Item?.board_owner?.username === analytics.filter);
  }

  // Grouping and aggregation
  let tableData = filteredPins;
  let columns = [
    {
      header: 'Image',
      accessor: 'Item.media.images.600x.url',
      render: (value: any, row: any) => (
        <div className="relative w-20 h-20">
          {row.Item?.media?.images?.['600x']?.url ? (
            <Image
              src={row.Item.media.images['600x'].url}
              alt="Pin"
              fill
              className="object-cover rounded-lg"
            />
          ) : (
            <span>No Image</span>
          )}
        </div>
      ),
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
    <div className="h-full flex flex-col">
      <UniversalAnalyticsBar section="pinterest" tabKey="pins" onChange={setAnalytics} />
      <UniversalOperationBar section="pinterest" tabKey="pins" analytics={analytics} data={tableData} />
      {/* Data Table - Scrollable */}
      <div className="flex-1 min-h-0">
        <div className="bg-white p-6 rounded-lg shadow h-full overflow-auto">
          <DataView
            data={tableData}
            columns={columns}
            onSort={() => {}}
            onSearch={() => {}}
          />
        </div>
      </div>
    </div>
  );
} 