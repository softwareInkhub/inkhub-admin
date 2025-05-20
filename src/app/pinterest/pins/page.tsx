'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchPins } from '@/store/slices/pinterestSlice';
import DataView from '@/components/common/DataView';
import Image from 'next/image';

export default function PinterestPins() {
  const dispatch = useDispatch<AppDispatch>();
  const { pins, loading, error } = useSelector((state: RootState) => state.pinterest);

  useEffect(() => {
    dispatch(fetchPins());
  }, [dispatch]);

  const columns = [
    {
      header: 'Image',
      accessor: 'image_url',
      render: (value: string) => (
        <div className="relative w-20 h-20">
          <Image
            src={value}
            alt="Pin"
            fill
            className="object-cover rounded-lg"
          />
        </div>
      ),
    },
    { header: 'Title', accessor: 'title' },
    { header: 'Description', accessor: 'description' },
    { header: 'Board', accessor: 'board_name' },
    { header: 'Created At', accessor: 'created_at' },
  ];

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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Pinterest Pins</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">Total Pins</h3>
            <p className="text-2xl font-bold">{pins.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">Unique Boards</h3>
            <p className="text-2xl font-bold">
              {new Set(pins.map(pin => pin.board_name)).size}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600">Latest Pin</h3>
            <p className="text-2xl font-bold">
              {pins.length > 0 ? new Date(pins[0].created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <DataView
          data={pins}
          columns={columns}
          onSort={(column) => {
            // Implement sorting logic
          }}
          onSearch={(query) => {
            // Implement search logic
          }}
        />
      </div>
    </div>
  );
} 