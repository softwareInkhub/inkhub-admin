import { useState } from 'react';
import ImageCell from '@/components/common/ImageCell';

interface DataViewSectionProps {
  activeTab: string;
  analytics: any;
  data: any[];
  columns: { header: string; accessor: string; render?: (value: any, row: any, viewType?: string) => React.ReactNode }[];
}

const VIEW_TYPES = [
  { label: 'Table', value: 'table' },
  { label: 'Grid', value: 'grid' },
  { label: 'Card', value: 'card' },
];

// Helper function to check if a value is an image URL
const isImageUrl = (value: any): boolean => {
  if (typeof value !== 'string') return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const url = value.toLowerCase();
  return imageExtensions.some(ext => url.includes(ext)) || url.includes('cdn.shopify.com');
};

// Helper function to extract image URL from product data
const extractImageUrl = (row: any): string | null => {
  // Check for image in different possible locations based on actual API structure
  let imageSrc = null;
  
  // First, check if the image field is a JSON string that needs to be parsed
  if (row.image && typeof row.image === 'string') {
    try {
      const parsedImage = JSON.parse(row.image);
      imageSrc = parsedImage.src || parsedImage.url;
    } catch (e) {
      // If it's not valid JSON, treat it as a direct URL
      imageSrc = row.image;
    }
  } else if (row.image && typeof row.image === 'object') {
    imageSrc = row.image.src || row.image.url;
  } else if (row.images && Array.isArray(row.images) && row.images[0]) {
    if (typeof row.images[0] === 'string') {
      try {
        const parsedImage = JSON.parse(row.images[0]);
        imageSrc = parsedImage.src || parsedImage.url;
      } catch (e) {
        imageSrc = row.images[0];
      }
    } else if (typeof row.images[0] === 'object') {
      imageSrc = row.images[0].src || row.images[0].url;
    } else {
      imageSrc = row.images[0];
    }
  } else if (row.Item?.image && typeof row.Item.image === 'string') {
    try {
      const parsedImage = JSON.parse(row.Item.image);
      imageSrc = parsedImage.src || parsedImage.url;
    } catch (e) {
      imageSrc = row.Item.image;
    }
  } else if (row.Item?.image && typeof row.Item.image === 'object') {
    imageSrc = row.Item.image.src || row.Item.image.url;
  } else if (row.Item?.images && Array.isArray(row.Item.images) && row.Item.images[0]) {
    if (typeof row.Item.images[0] === 'string') {
      try {
        const parsedImage = JSON.parse(row.Item.images[0]);
        imageSrc = parsedImage.src || parsedImage.url;
      } catch (e) {
        imageSrc = row.Item.images[0];
      }
    } else if (typeof row.Item.images[0] === 'object') {
      imageSrc = row.Item.images[0].src || row.Item.images[0].url;
    } else {
      imageSrc = row.Item.images[0];
    }
  } else {
    // Fallback to direct properties
    imageSrc = row.image?.src || row.images?.[0]?.src || row.Item?.image?.src || row.Item?.images?.[0]?.src ||
              row.src || row.Item?.src || row.featured_image || row.Item?.featured_image;
  }
  
  return imageSrc && isImageUrl(imageSrc) ? imageSrc : null;
};

export default function DataViewSection({ activeTab, analytics, data, columns }: DataViewSectionProps) {
  const [viewType, setViewType] = useState('table');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Sorting logic
  let sortedData = [...data];
  if (sortBy) {
    sortedData.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortDir === 'asc' ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Render cell content with proper image handling
  const renderCellContent = (col: any, row: any, viewType?: string) => {
    // If column has a custom render function, use it
    if (col.render) {
      return col.render(row[col.accessor], row, viewType);
    }
    
    // Special handling for image columns
    if (col.accessor === 'image') {
      const imageSrc = extractImageUrl(row);
      if (imageSrc) {
        return <ImageCell src={imageSrc} alt={row.title || 'Product Image'} viewType={viewType as 'table' | 'grid' | 'card' | 'list' | undefined} />;
      }
      return <span className="text-gray-400">No Image</span>;
    }
    
    // For other columns, return the value
    return row[col.accessor] || '—';
  };

  // Render table view
  const renderTable = () => (
    <div className="overflow-auto max-h-96">
      <table className="min-w-full border rounded-lg">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="px-4 py-2 border-b bg-gray-50 text-left cursor-pointer select-none"
                onClick={() => {
                  if (sortBy === col.accessor) {
                    setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(col.accessor);
                    setSortDir('asc');
                  }
                }}
              >
                {col.header}
                {sortBy === col.accessor && (sortDir === 'asc' ? ' ▲' : ' ▼')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.accessor} className="px-4 py-2 border-b">
                  {renderCellContent(col, row, 'table')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render grid view
  const renderGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {sortedData.map((row, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4">
          {columns.map((col) => (
            <div key={col.accessor} className="mb-1">
              <span className="font-semibold text-gray-700">{col.header}: </span>
              <span>{renderCellContent(col, row, 'grid')}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // Render card view
  const renderCard = () => (
    <div className="flex flex-wrap gap-4">
      {sortedData.map((row, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6 min-w-[220px]">
          {columns.map((col) => (
            <div key={col.accessor} className="mb-2">
              <span className="font-semibold text-gray-700">{col.header}: </span>
              <span>{renderCellContent(col, row, 'card')}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Quick actions: view type, sorting */}
      <div className="flex items-center space-x-4">
        <span className="font-medium text-gray-700">View:</span>
        {VIEW_TYPES.map((v) => (
          <button
            key={v.value}
            className={`btn btn-secondary ${viewType === v.value ? 'bg-primary-100 text-primary-700' : ''}`}
            onClick={() => setViewType(v.value)}
          >
            {v.label}
          </button>
        ))}
      </div>
      {/* Data view */}
      {viewType === 'table' && renderTable()}
      {viewType === 'grid' && renderGrid()}
      {viewType === 'card' && renderCard()}
    </div>
  );
} 