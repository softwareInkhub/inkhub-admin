'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchPins } from '@/store/slices/pinterestSlice';
import DataView from '@/components/common/DataView';
import Image from 'next/image';
import lodashGroupBy from 'lodash/groupBy';

export default function PinterestPins() {
  const dispatch = useDispatch<AppDispatch>();
  const { pins, loading, error } = useSelector((state: RootState) => state.pinterest);

  // Analytics/filter/group state
  const [filter, setFilter] = useState('all');
  const [groupBy, setGroupBy] = useState('none');
  const [aggregate, setAggregate] = useState('count');
  const [viewType, setViewType] = useState<'table' | 'grid' | 'card'>('table');

  useEffect(() => {
    dispatch(fetchPins());
  }, [dispatch]);

  // Filter out pins without Item
  let filteredPins = pins.filter(pin => pin.Item);
  if (filter !== 'all') {
    filteredPins = filteredPins.filter(pin => pin.Item?.board_owner?.username === filter);
  }

  // Grouping and aggregation
  let tableData = filteredPins;
  let columns = [
    {
      header: 'Image',
      accessor: 'Item.media.images.600x.url',
      render: (value: any) => (
        <div className="relative w-20 h-20">
          {value ? (
            <Image
              src={value}
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
    { header: 'Title', accessor: 'Item.title' },
    { header: 'Description', accessor: 'Item.description' },
    { header: 'Board', accessor: 'Item.board_owner.username' },
    { header: 'Created At', accessor: 'Item.created_at' },
  ];

  if (groupBy !== 'none') {
    const grouped = lodashGroupBy(filteredPins, pin => pin.Item?.board_owner?.username);
    tableData = Object.entries(grouped).map(([group, items]) => {
      let value = 0;
      if (aggregate === 'count') value = items.length;
      return {
        group,
        value,
        items,
      };
    });
    columns = [
      { header: 'Board', accessor: 'group' },
      { header: 'Count', accessor: 'value' },
    ];
  }

  // For card view, show image as main content
  const renderCardView = () => (
    <div className="flex flex-wrap gap-4">
      {filteredPins.map((pin, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6 min-w-[220px] flex flex-col items-center">
          <div className="relative w-40 h-40 mb-4">
            {pin.Item?.media?.images?.['600x']?.url ? (
              <Image
                src={pin.Item.media.images['600x'].url}
                alt="Pin"
                fill
                className="object-cover rounded-lg"
              />
            ) : (
              <span>No Image</span>
            )}
          </div>
          <div className="font-semibold text-lg mb-2">{pin.Item?.title || 'No Title'}</div>
          <div className="text-gray-500 mb-2">{pin.Item?.description || 'No Description'}</div>
          <div className="text-sm text-blue-600 mb-1">Board: {pin.Item?.board_owner?.username || 'Unknown'}</div>
          <div className="text-xs text-gray-400">{pin.Item?.created_at || 'Unknown'}</div>
        </div>
      ))}
    </div>
  );

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

  // Get unique boards for filter dropdown
  const uniqueBoards = Array.from(new Set(pins.map(pin => pin.Item?.board_owner?.username).filter(Boolean)));

  return (
    <div className="h-full flex flex-col">
      {/* Analytics/filter/group bar */}
      <div className="flex items-center space-x-4 p-4 bg-white border-b">
        <span className="font-medium text-gray-700">Filter by Board:</span>
        <select className="input w-40" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          {uniqueBoards.map(board => (
            <option key={board} value={board}>{board}</option>
          ))}
        </select>
        <span className="font-medium text-gray-700">Group By:</span>
        <select className="input w-32" value={groupBy} onChange={e => setGroupBy(e.target.value)}>
          <option value="none">None</option>
          <option value="board">Board</option>
        </select>
        <span className="font-medium text-gray-700">Aggregate:</span>
        <select className="input w-32" value={aggregate} onChange={e => setAggregate(e.target.value)}>
          <option value="count">Count</option>
        </select>
        <span className="ml-auto font-medium text-gray-700">View:</span>
        <button className={`btn btn-secondary ${viewType === 'table' ? 'bg-primary-100 text-primary-700' : ''}`} onClick={() => setViewType('table')}>Table</button>
        <button className={`btn btn-secondary ${viewType === 'grid' ? 'bg-primary-100 text-primary-700' : ''}`} onClick={() => setViewType('grid')}>Grid</button>
        <button className={`btn btn-secondary ${viewType === 'card' ? 'bg-primary-100 text-primary-700' : ''}`} onClick={() => setViewType('card')}>Card</button>
      </div>
      {/* Data Table - Scrollable */}
      <div className="flex-1 min-h-0">
        <div className="bg-white p-6 rounded-lg shadow h-full overflow-auto">
          {viewType === 'card' ? renderCardView() : (
            <DataView
              data={tableData}
              columns={columns}
              onSort={() => {}}
              onSearch={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
} 