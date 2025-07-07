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
      {/* Removed Export Data and Copy Data buttons */}
    </div>
  );
} 