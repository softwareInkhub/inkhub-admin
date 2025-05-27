'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  TableCellsIcon,
  Squares2X2Icon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';
import { useDispatch } from 'react-redux';
import { updateDesign, deleteDesign, fetchDesigns } from '@/store/slices/designLibrarySlice';
import type { AppDispatch } from '@/store/store';

interface DataViewProps<T> {
  data: T[];
  columns: {
    header: string;
    accessor: keyof T;
    render?: (value: any, row: T) => React.ReactNode;
  }[];
  onSort?: (column: keyof T) => void;
  onSearch?: (query: string) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

type ViewType = 'table' | 'grid' | 'card';

export default function DataView<T>({
  data,
  columns,
  onSort,
  onSearch,
  onSelectionChange,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: DataViewProps<T>) {
  const [viewType, setViewType] = useState<ViewType>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const dispatch = useDispatch<AppDispatch>();

  // Extract all unique tags from data
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    data.forEach((item: any) => {
      if (Array.isArray(item.designTags)) {
        item.designTags.forEach((tag: string) => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet);
  }, [data]);

  // Filter data by selected tag
  const filteredData = useMemo(() => {
    if (!selectedTag) return data;
    return data.filter((item: any) =>
      Array.isArray(item.designTags) && item.designTags.includes(selectedTag)
    );
  }, [data, selectedTag]);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIndices = new Set(filteredData.map((_, index) => index));
      setSelectedRows(allIndices);
      onSelectionChange?.(filteredData);
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  // Handle individual row selection
  const handleRowSelect = (index: number, checked: boolean) => {
    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      newSelectedRows.add(index);
    } else {
      newSelectedRows.delete(index);
    }
    setSelectedRows(newSelectedRows);
    onSelectionChange?.(filteredData.filter((_, i) => newSelectedRows.has(i)));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleEditClick = (item: T) => {
    setEditItem(item);
    setEditForm({ ...item });
  };

  const handleEditChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    await dispatch(updateDesign(editForm));
    setEditItem(null);
    setSelectedItem(null);
  };

  const handleDelete = async (uid: string) => {
    await dispatch(deleteDesign(uid));
    setSelectedItem(null);
  };

  // Add intersection observer for infinite scroll
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const loadMoreTrigger = document.getElementById('load-more-trigger');
    if (loadMoreTrigger) {
      observer.observe(loadMoreTrigger);
    }

    return () => {
      if (loadMoreTrigger) {
        observer.unobserve(loadMoreTrigger);
      }
    };
  }, [onLoadMore, hasMore, isLoadingMore]);

  // Controls: stack vertically on mobile, horizontally on desktop
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Tag Filter and Search */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-4 justify-between items-stretch sm:items-center p-2 md:p-4 bg-white border-b">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="font-medium text-gray-700 text-xs md:text-base">Filter by Tag:</label>
          <select
            className="px-2 md:px-3 py-1 md:py-2 border rounded text-xs md:text-base"
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
          >
            <option value="">All</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 max-w-full sm:max-w-xs md:max-w-sm">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-2 md:px-4 py-1 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-base"
          />
        </div>
        <div className="flex space-x-1 md:space-x-2 justify-end sm:justify-start mt-2 sm:mt-0">
          <button
            onClick={() => setViewType('table')}
            className={`p-1 md:p-2 rounded-lg ${
              viewType === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <TableCellsIcon className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            onClick={() => setViewType('grid')}
            className={`p-1 md:p-2 rounded-lg ${
              viewType === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <ViewColumnsIcon className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            onClick={() => setViewType('card')}
            className={`p-1 md:p-2 rounded-lg ${
              viewType === 'card' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <Squares2X2Icon className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 min-h-0 overflow-auto relative">
        {/* Loading Overlay - Only show for initial load */}
        {data.length === 0 && !isLoadingMore && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {viewType === 'table' && (
          <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0 max-h-96">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm md:text-base">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={selectedRows.size === filteredData.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  {columns.map((column) => (
                    <th
                      key={String(column.header)}
                      className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => onSort?.(column.accessor as any)}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr key={index} className={selectedRows.has(index) ? 'bg-blue-50' : ''} style={{ height: '32px' }}>
                    <td className="px-2 py-1 whitespace-nowrap text-xs">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedRows.has(index)}
                        onChange={(e) => handleRowSelect(index, e.target.checked)}
                      />
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap text-xs">
                      {index + 1}
                    </td>
                    {columns.map((column) => {
                      const value = item[column.accessor];
                      // If this is an image column, render a smaller image
                      if (column.header.toLowerCase().includes('image')) {
                        let src: string | undefined = undefined;
                        if (typeof value === 'string') {
                          src = value;
                        } else if (value && typeof value === 'object' && 'src' in value) {
                          src = (value as any).src;
                        }
                        return (
                          <td key={String(column.header)} className="px-2 py-1 whitespace-nowrap text-xs">
                            {src ? <img src={src} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} /> : null}
                          </td>
                        );
                      }
                      return (
                        <td key={String(column.header)} className="px-2 py-1 whitespace-nowrap text-xs">
                          {column.render ? column.render(value, item) : String(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {viewType === 'grid' && (
          <div className="overflow-auto flex-1 min-h-0 max-h-96">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 p-1 gap-1">
              {filteredData.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-1 p-1 border border-blue-400 bg-white text-xs shadow-md">
                  {/* Image - clickable for modal */}
                  <div className="flex justify-center w-full">
                    {columns[0].render
                      ? columns[0].render(item[columns[0].accessor], item)
                      : <img src={String(item[columns[0].accessor])} alt="" className="w-28 h-28 object-cover rounded-lg" />
                    }
                  </div>
                  {/* Title */}
                  <div className="font-semibold text-base line-clamp-2 w-full text-center">
                    {columns[1].render
                      ? columns[1].render(item[columns[1].accessor], item)
                      : String(item[columns[1].accessor])}
                  </div>
                  {/* Description */}
                  <div className="text-gray-600 text-sm line-clamp-3 w-full text-center">
                    {columns[2].render
                      ? columns[2].render(item[columns[2].accessor], item)
                      : String(item[columns[2].accessor])}
                  </div>
                  {/* Date */}
                  <div className="text-xs text-gray-400 mt-auto w-full text-center">
                    {columns[4] && (columns[4].render
                      ? columns[4].render(item[columns[4].accessor], item)
                      : String(item[columns[4].accessor]))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {viewType === 'card' && (
          <div className="overflow-auto flex-1 min-h-0 max-h-96">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-2">
              {filteredData.map((item, index) => (
                <div key={index} className="flex flex-col items-center p-1 bg-white rounded shadow-md border-2 border-blue-400 cursor-pointer">
                  {/* Smaller image for compact card view */}
                  {columns[0].render
                    ? columns[0].render(item[columns[0].accessor], item)
                    : <img src={String(item[columns[0].accessor])} alt="" className="w-8 h-8 object-cover rounded-lg" />
                  }
                  {/* Optional: show a label or title below the image */}
                  {columns[1] && (
                    <div className="text-xs text-center mt-1 truncate w-full">
                      {columns[1].render
                        ? columns[1].render(item[columns[1].accessor], item)
                        : String(item[columns[1].accessor])}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Place the load more trigger at the end of the content for infinite scroll */}
        {hasMore && (
          <div id="load-more-trigger" className="w-full flex justify-center py-4">
            {isLoadingMore ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-500">Loading more...</span>
              </div>
            ) : (
              <span className="text-sm text-gray-500">Scroll to load more</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 