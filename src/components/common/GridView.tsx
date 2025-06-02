import React from 'react';

interface GridViewProps<T> {
  data: T[];
  columns: {
    header: string;
    accessor: keyof T;
    render?: (value: any, row: T, viewType?: 'grid' | 'card') => React.ReactNode;
  }[];
  itemsPerRow?: number;
  viewType?: 'grid' | 'card';
  onItemClick?: (item: T) => void;
}

function GridView<T>({ data, columns, itemsPerRow = 6, viewType = 'grid', onItemClick }: GridViewProps<T>) {
  // Find the first image column (header includes 'image' or 'cover')
  const imageColIdx = columns.findIndex(col => col.header.toLowerCase().includes('image') || col.header.toLowerCase().includes('cover'));
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 md:grid-cols-${itemsPerRow} gap-4 p-2`}>
      {data.map((item, idx) => {
        // Always show image column first if available
        const shownCols: typeof columns = [];
        if (imageColIdx !== -1) shownCols.push(columns[imageColIdx]);
        // Add up to two more non-image columns
        let count = 0;
        for (let i = 0; i < columns.length && shownCols.length < 3; i++) {
          if (i !== imageColIdx) {
            shownCols.push(columns[i]);
            count++;
          }
        }
        return (
          <div
            key={idx}
            className="flex flex-col items-center p-2 bg-white rounded shadow border border-gray-200 cursor-pointer"
            onClick={() => onItemClick?.(item)}
          >
            {shownCols.map((col, colIdx) => (
              <div key={colIdx} className="w-full text-center mb-1 truncate">
                {col.render
                  ? col.render(item[col.accessor], item, 'grid')
                  : String(item[col.accessor] ?? '')}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default GridView; 