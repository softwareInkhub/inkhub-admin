import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

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
  return (
    <div className={`flex flex-col gap-4 p-2`}>
      {data.map((item, idx) => {
        const imageCol = columns[imageColIdx];
        const flatRow = getFlattenedRow ? getFlattenedRow(item) : item;
        return (
          <div key={idx} className="flex flex-row items-stretch bg-white rounded shadow border p-2 relative gap-2">
            {/* Image Box */}
            <div className="w-40 flex items-center justify-center border bg-white rounded p-2">
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
                    className="object-contain w-full h-full max-h-32"
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
                <div key={accessor} className="w-40 flex items-center justify-center border bg-gray-50 rounded p-2 overflow-hidden" title={typeof value === 'string' ? value : undefined}>
                  <span className="block w-full max-w-full text-center truncate overflow-hidden whitespace-nowrap">
                    {col.render
                      ? col.render(value, item, 'grid')
                      : typeof value === 'object'
                        ? JSON.stringify(value)
                        : String(value ?? '')}
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