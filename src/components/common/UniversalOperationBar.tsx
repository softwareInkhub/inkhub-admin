"use client";

import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';

interface UniversalOperationBarProps {
  section: string;
  tabKey: string;
  analytics: any;
  data: any[];
  selectedData?: any[];
}

export default function UniversalOperationBar({ section, tabKey, analytics, data, selectedData = [] }: UniversalOperationBarProps) {
  // Example handlers
  const handleDownload = () => {
    const toDownload = selectedData.length > 0 ? selectedData : data;
    const blob = new Blob([JSON.stringify(toDownload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${section}-${tabKey}-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleUpload = () => {
    alert(`Upload data for ${section} - ${tabKey}`);
  };

  return (
    <div className="flex flex-row items-center bg-white border-b border-gray-200 rounded-t-lg px-4 py-2 shadow-sm w-full mb-4 justify-end">
      <div className="flex flex-col items-center justify-center">
        <div className="rounded-xl px-4 py-2 bg-gradient-to-br from-blue-50/40 to-white flex flex-col items-center min-w-[120px]">
          <div className="flex flex-row gap-2">
            <button
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold bg-blue-500 text-white shadow-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={() => {
                console.log('Download selectedData:', selectedData);
                handleDownload();
              }}
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Export Data
            </button>
            <button
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold bg-gray-500 text-white shadow-md hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              onClick={() => {
                const toCopy = selectedData.length > 0 ? selectedData : data;
                navigator.clipboard.writeText(JSON.stringify(toCopy, null, 2));
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a3 3 0 013-3h2a3 3 0 013 3v2m4 0a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h16z" /></svg>
              Copy Data
            </button>
          </div>
          {selectedData.length > 0 && (
            <span className="mt-2 text-xs text-blue-700 font-semibold bg-blue-50 rounded-full px-2 py-0.5">
              {selectedData.length} selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 