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
    <div className="flex flex-row items-center bg-gray-50 border-b border-gray-200 rounded-t-lg px-4 py-2 shadow-sm w-full">
      <div className="flex flex-col items-center justify-center">
        <div className="border-2 border-blue-400 rounded-lg px-4 py-2 bg-white shadow text-center min-w-[80px] flex flex-col items-center">
          <button
            className="btn btn-secondary rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors mb-1"
            onClick={() => {
              console.log('Download selectedData:', selectedData);
              handleDownload();
            }}
          >
            Download Data
          </button>
          {selectedData.length > 0 && (
            <span className="mt-1 text-xs text-blue-700 font-semibold bg-blue-50 rounded-full px-2 py-0.5">
              {selectedData.length} selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 