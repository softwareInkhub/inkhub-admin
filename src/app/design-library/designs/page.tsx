'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchDesigns } from '@/store/slices/designLibrarySlice';
import DataView from '@/components/common/DataView';
import Image from 'next/image';

export default function DesignLibrary() {
  const dispatch = useDispatch<AppDispatch>();
  const { designs, loading, error } = useSelector((state: RootState) => state.designLibrary);

  useEffect(() => {
    dispatch(fetchDesigns());
  }, [dispatch]);

  const columns = [
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
      <div className="flex-1 min-h-0">
        <div className="bg-white p-6 rounded-lg shadow h-full overflow-auto">
          <DataView
            data={designs}
            columns={columns}
            onSort={() => {}}
            onSearch={() => {}}
          />
        </div>
      </div>
    </div>
  );
} 