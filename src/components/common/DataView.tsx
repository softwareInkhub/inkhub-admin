'use client';

import { useState, useMemo } from 'react';
import {
  TableCellsIcon,
  Squares2X2Icon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';
import { useDispatch } from 'react-redux';
import { updateDesign, deleteDesign, fetchDesigns } from '@/store/slices/designLibrarySlice';

interface DataViewProps<T> {
  data: T[];
  columns: {
    header: string;
    accessor: keyof T;
    render?: (value: any) => React.ReactNode;
  }[];
  onSort?: (column: keyof T) => void;
  onSearch?: (query: string) => void;
}

type ViewType = 'table' | 'grid' | 'card';

export default function DataView<T>({
  data,
  columns,
  onSort,
  onSearch,
}: DataViewProps<T>) {
  const [viewType, setViewType] = useState<ViewType>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [editItem, setEditItem] = useState<T | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [selectedTag, setSelectedTag] = useState<string>('');
  const dispatch = useDispatch();

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
    dispatch(fetchDesigns());
  };

  const handleDelete = async (uid: string) => {
    await dispatch(deleteDesign(uid));
    setSelectedItem(null);
    dispatch(fetchDesigns());
  };

  const renderTableView = (tableData: T[] = filteredData) => (
    <div className="overflow-auto flex-1 min-h-0 max-h-96">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.accessor)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => onSort?.(column.accessor)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tableData.map((item, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={String(column.accessor)} className="px-6 py-4 whitespace-nowrap">
                  {column.render
                    ? column.render(item[column.accessor])
                    : String(item[column.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGridView = (gridData: T[] = filteredData) => {
    // Find the image column accessor
    const imageColumn = columns.find(
      (col) => col.header.toLowerCase().includes('image')
    );
    return (
      <div className="overflow-auto flex-1 min-h-0 max-h-96">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {gridData.map((item, index) => (
            <div
              key={index}
              className="bg-white p-2 rounded-lg shadow cursor-pointer flex items-center justify-center"
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative w-32 h-32">
                {imageColumn && imageColumn.render
                  ? imageColumn.render(item[imageColumn.accessor])
                  : item[imageColumn?.accessor as keyof T] && (
                      <img
                        src={String(item[imageColumn.accessor])}
                        alt="Design"
                        className="object-contain w-full h-full rounded-lg"
                      />
                    )}
              </div>
            </div>
          ))}
        </div>
        {/* Details Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setSelectedItem(null)}
              >
                &times;
              </button>
              {/* Show all details */}
              {columns.map((column) => (
                <div key={String(column.accessor)} className="mb-2">
                  <span className="font-medium text-gray-500">{column.header}: </span>
                  {column.render
                    ? column.render(selectedItem[column.accessor])
                    : String(selectedItem[column.accessor])}
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => handleEditClick(selectedItem)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => handleDelete((selectedItem as any).uid)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Edit Modal */}
        {editItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg md:max-w-2xl relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setEditItem(null)}
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-6">Edit Design</h2>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleEditSave();
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {columns.map((column) => (
                  <div key={String(column.accessor)} className="flex flex-col col-span-1">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      {column.header}
                    </label>
                    <input
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-400"
                      value={editForm[column.accessor] ?? ''}
                      onChange={e => handleEditChange(String(column.accessor), e.target.value)}
                      disabled={
                        String(column.accessor) === 'uid' ||
                        String(column.accessor).toLowerCase().includes('image')
                      }
                    />
                  </div>
                ))}
                <div className="md:col-span-2 flex gap-2 mt-4 justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded font-semibold transition"
                    onClick={() => setEditItem(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCardView = (cardData: T[] = filteredData) => (
    <div className="overflow-auto flex-1 min-h-0 max-h-96">
      <div className="space-y-4 p-4">
        {cardData.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            {columns.map((column) => (
              <div key={String(column.accessor)} className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">{column.header}</h3>
                <div className="mt-1">
                  {column.render
                    ? column.render(item[column.accessor])
                    : String(item[column.accessor])}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Tag Filter and Search */}
      <div className="flex flex-wrap gap-4 justify-between items-center p-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-700">Filter by Tag:</label>
          <select
            className="px-3 py-2 border rounded"
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
          >
            <option value="">All</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewType('table')}
            className={`p-2 rounded-lg ${
              viewType === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <TableCellsIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewType('grid')}
            className={`p-2 rounded-lg ${
              viewType === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewType('card')}
            className={`p-2 rounded-lg ${
              viewType === 'card' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <ViewColumnsIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 min-h-0">
        {viewType === 'table' && renderTableView(filteredData)}
        {viewType === 'grid' && renderGridView(filteredData)}
        {viewType === 'card' && renderCardView(filteredData)}
      </div>
    </div>
  );
} 