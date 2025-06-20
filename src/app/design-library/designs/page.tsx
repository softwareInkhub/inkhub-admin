'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchDesigns } from '@/store/slices/designLibrarySlice';
import DataView from '@/components/common/DataView';
import Image from 'next/image';
import UniversalAnalyticsBar from '@/components/common/UniversalAnalyticsBar';
import UniversalOperationBar from '@/components/common/UniversalOperationBar';
import DecoupledHeader from '@/components/common/DecoupledHeader';
import ImageCell from '@/components/common/ImageCell';
import FilterBar from '@/components/common/FilterBar';
import ViewsBar from '@/components/common/ViewsBar';

export default function DesignLibrary() {
  const dispatch = useDispatch<AppDispatch>();
  const { designs, loading, error, lastEvaluatedKey, totalDesigns } = useSelector((state: RootState) => state.designLibrary);

  // Multi-filter states
  const [status, setStatus] = useState('All');
  const [type, setType] = useState('All');
  const [board, setBoard] = useState('All');
  // Smart filter states
  const [smartField, setSmartField] = useState('designName');
  const [smartValue, setSmartValue] = useState('');

  const [analytics, setAnalytics] = useState({ filter: 'All', groupBy: 'None', aggregate: 'Count' });
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'designImageUrl', 'designName', 'designPrice', 'designSize', 'designStatus', 'designType', 'orderName', 'designTags', 'designCreatedAt', 'designUpdateAt'
  ]);

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
        .finally(() => setIsLoadingMore(false));
    }
  };

  // Build filter options from data
  const statusOptions = ['All', ...Array.from(new Set(designs.map((d: any) => d.designStatus).filter(Boolean)))];
  const typeOptions = ['All', ...Array.from(new Set(designs.map((d: any) => d.designType).filter(Boolean)))];
  const boardOptions = ['All', ...Array.from(new Set(designs.map((d: any) => d.orderName).filter(Boolean)))];
  const smartFieldOptions = [
    { label: 'Name', value: 'designName' },
    { label: 'Status', value: 'designStatus' },
    { label: 'Type', value: 'designType' },
    { label: 'Board', value: 'orderName' },
    { label: 'Tags', value: 'designTags' },
    { label: 'Price', value: 'designPrice' },
    { label: 'Size', value: 'designSize' },
  ];

  // Multi-filter logic
  let filteredDesigns = designs.filter((row: any) =>
    (status === 'All' || row.designStatus === status) &&
    (type === 'All' || row.designType === type) &&
    (board === 'All' || row.orderName === board)
  );
  // Smart filter logic
  if (smartValue) {
    filteredDesigns = filteredDesigns.filter((row: any) => {
      const val = row[smartField];
      if (Array.isArray(val)) {
        return val.some((v) => String(v).toLowerCase().includes(smartValue.toLowerCase()));
      }
      return String(val ?? '').toLowerCase().includes(smartValue.toLowerCase());
    });
  }

  let columns = [
    {
      header: 'Image',
      accessor: 'designImageUrl',
      render: (value: string, _row: any, viewType?: string) => (
        <ImageCell src={value} alt="Design" viewType={viewType} />
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

  // Filter columns based on visibleColumns
  const filteredColumns = columns.filter(col => visibleColumns.includes(col.accessor as string));

  let tableData = filteredDesigns;

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

  // Reset all filters
  const handleResetFilters = () => {
    setStatus('All');
    setType('All');
    setBoard('All');
    setSmartField('designName');
    setSmartValue('');
  };

  return (
    <div className="h-full flex flex-col">
      <UniversalAnalyticsBar section="design library" tabKey="designs" total={totalDesigns} currentCount={tableData.length} onChange={setAnalytics} />
      <ViewsBar />
      <UniversalOperationBar 
        section="design library" 
        tabKey="designs" 
        analytics={analytics} 
        data={tableData}
        selectedData={selectedRows}
      />
      <div className="flex-1 min-h-0">
        <div className="bg-white p-6 rounded-lg shadow h-full overflow-auto">
          <DataView
            data={tableData}
            columns={filteredColumns}
            onSort={() => {}}
            onSearch={() => {}}
            section="design library"
            tabKey="designs"
            onSelectionChange={setSelectedRows}
            onLoadMore={handleNextPage}
            hasMore={!!lastEvaluatedKey}
            isLoadingMore={isLoadingMore}
            status={status}
            setStatus={setStatus}
            statusOptions={statusOptions}
            type={type}
            setType={setType}
            typeOptions={typeOptions}
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