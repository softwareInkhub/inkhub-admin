'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchBoards } from '@/store/slices/pinterestSlice';
import DataView from '@/components/common/DataView';

export default function PinterestBoards() {
  const dispatch = useDispatch<AppDispatch>();
  const { boards, loading, error } = useSelector((state: RootState) => state.pinterest);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  const columns = [
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="h-full flex flex-col">
      <DataView
        data={boards}
        columns={columns}
      />
    </div>
  );
} 