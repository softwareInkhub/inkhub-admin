"use client";

interface UniversalOperationBarProps {
  section: string;
  tabKey: string;
  analytics: any;
  data: any[];
}

export default function UniversalOperationBar({ section, tabKey, analytics, data }: UniversalOperationBarProps) {
  // Example handlers
  const handleDownload = () => {
    // For demo: download JSON
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
    <div className="bg-gray-100 border-b px-4 py-3 flex space-x-4 items-center min-h-[48px]">
      <span className="font-medium text-gray-700">
        {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)} Operations
      </span>
      <button className="btn btn-secondary" onClick={handleDownload}>Download</button>
      <button className="btn btn-secondary" onClick={handleUpload}>Upload</button>
      {/* Add more context-aware actions here as needed */}
    </div>
  );
} 