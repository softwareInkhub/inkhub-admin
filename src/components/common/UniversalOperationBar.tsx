"use client";

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
    <div className="flex flex-row items-center gap-4 bg-gray-50 border-b border-gray-200 rounded-t-lg px-6 py-3 shadow-sm w-full">
      <span className="font-bold text-primary-700 text-base mr-2">Operations</span>
      <button
        className="btn btn-secondary rounded-full px-4 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
        onClick={() => {
          console.log('Download selectedData:', selectedData);
          handleDownload();
        }}
      >
        Download Data
      </button>
      {selectedData.length > 0 && (
        <span className="ml-2 text-xs text-blue-700 font-semibold bg-blue-50 rounded-full px-2 py-0.5">
          {selectedData.length} selected
        </span>
      )}
    </div>
  );
} 