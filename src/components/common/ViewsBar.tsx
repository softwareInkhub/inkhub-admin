import React from 'react';

export default function ViewsBar() {
  return (
    <div className="flex flex-row items-center w-full mb-2 gap-2">
      {[...Array(8)].map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg shadow-sm min-w-[70px] min-h-[32px] text-gray-700 font-semibold text-xs"
        >
          Views
        </div>
      ))}
    </div>
  );
} 