import React, { useState } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface GridViewProps<T> {
  data: T[];
  columns: {
    header: string;
    accessor: string;
    render?: (value: any, row: T, viewType?: 'grid' | 'card') => React.ReactNode;
  }[];
  itemsPerRow?: number;
  viewType?: 'grid' | 'card';
  onItemClick?: (item: T) => void;
  selectedFields?: string[]; // array of accessors to show after image
  getFlattenedRow?: (row: T) => Record<string, any>; // for dot notation access
}

// Helper to robustly find the image column
function findImageColIdx<T>(columns: GridViewProps<T>["columns"]): number {
  const imageKeywords = ["image", "cover", "thumbnail", "photo", "img"];
  return columns.findIndex(col => {
    const header = col.header.toLowerCase();
    const accessor = String(col.accessor).toLowerCase();
    return imageKeywords.some(keyword => header.includes(keyword) || accessor.includes(keyword));
  });
}

function GridView<T>({ data, columns, itemsPerRow = 6, viewType = 'grid', onItemClick, selectedFields = [], getFlattenedRow }: GridViewProps<T>) {
  const imageColIdx = findImageColIdx(columns);
  const imageCol = columns[imageColIdx];
  // Collapse state per row
  const [collapsedRows, setCollapsedRows] = useState<{ [idx: number]: boolean }>({});
  const toggleRow = (idx: number) => setCollapsedRows(prev => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <div className={`flex flex-col gap-2 p-1`}>
      {/* Sticky Header Row */}
      <div className="flex flex-row items-stretch sticky top-0 z-20 bg-white border-b">
        {/* Collapse header */}
        {/* <div className="w-6" /> */}
        {/* Image column header */}
        <div className="min-w-[60px] flex items-center justify-center font-bold uppercase text-xs text-gray-500 py-1 border-r">{imageCol ? imageCol.header : 'Image'}</div>
        {/* Selected fields headers */}
        {selectedFields.map((accessor) => {
          const col = columns.find(c => String(c.accessor) === accessor);
          return (
            <div key={accessor} className="min-w-[80px] flex-1 items-center justify-center font-bold uppercase text-xs text-gray-500 py-1 border-r">
              {col ? col.header : accessor}
            </div>
          );
        })}
      </div>
      {data.map((item, idx) => {
        const flatRow = getFlattenedRow ? getFlattenedRow(item) : item;
        // const isCollapsed = collapsedRows[idx] ?? false;
        return (
          <div key={idx} className="flex flex-row items-center bg-white rounded shadow border border-gray-200 px-1 py-1 relative hover:shadow-md transition-all">
            {/* Collapse/Expand Toggle */}
            {/* <button ... /> */}
            {/* Image Box */}
            <div className="min-w-[60px] h-16 flex items-center justify-center border bg-white rounded p-1">
              {imageCol && (() => {
                let imageValue = (item as any)[imageCol.accessor];
                let imageUrl: string | undefined = undefined;
                // Shopify array/object
                if (Array.isArray(imageValue) && (imageValue[0] as any)?.src) {
                  imageUrl = (imageValue[0] as any).src;
                } else if (typeof imageValue === 'object' && imageValue !== null && (imageValue as any).src) {
                  imageUrl = (imageValue as any).src;
                } else if (typeof imageValue === 'string') {
                  imageUrl = imageValue;
                }
                // Pinterest Pins/Boards
                const itemAny = item as any;
                if (!imageUrl && itemAny.Item?.media?.images?.['600x']?.url) {
                  imageUrl = itemAny.Item.media.images['600x'].url;
                } else if (!imageUrl && itemAny.Item?.media?.image_cover_url) {
                  imageUrl = itemAny.Item.media.image_cover_url;
                }
                return imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    className="object-contain w-full h-full max-h-14"
                    onClick={() => onItemClick?.(item)}
                    style={{ cursor: 'pointer' }}
                  />
                ) : null;
              })()}
            </div>
            {/* Data Boxes for selected fields */}
            {selectedFields.map((accessor, i) => {
              const col = columns.find(c => String(c.accessor) === accessor);
              if (!col) return null;
              // Use flattened row for dot notation access
              const value = (flatRow as Record<string, any>)[accessor];
              return (
                <div
                  key={accessor}
                  className="min-w-[80px] flex-1 flex items-center justify-center border bg-gray-50 rounded px-2 py-1 overflow-hidden mx-0"
                  title={typeof value === 'string' ? value : undefined}
                  style={{ height: '2.2rem', marginLeft: 0, marginRight: 0 }}
                >
                  <span className="block w-full max-w-full text-center truncate overflow-hidden whitespace-nowrap text-xs">
                    {col.render
                      ? col.render(value, item, 'grid')
                      : typeof value === 'object'
                        ? '[Object]'
                        : String(value)
                  }
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default GridView; 