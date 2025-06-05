import React from 'react';

interface SystemLoadStatusProps {
  resources: {
    key: string;
    label: string;
    status: string;
    progress: number;
    dataCount: number;
  }[];
}

export default function SystemLoadStatus({ resources }: SystemLoadStatusProps) {
  const totalResources = resources.length;
  const completedResources = resources.filter(r => r.status === 'Complete').length;
  const overallProgress = Math.round((completedResources / totalResources) * 100);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">System Load Status</h2>
        <div className="text-sm text-gray-600">
          {completedResources} of {totalResources} resources loaded
        </div>
      </div>
      
      {/* Overall progress bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
        <div className="text-right text-sm text-gray-600 mt-1">
          Overall Progress: {overallProgress}%
        </div>
      </div>

      {/* Individual resource status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <div key={resource.key} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{resource.label}</span>
              <span className={`text-sm ${
                resource.status === 'Complete' ? 'text-green-600' : 
                resource.status === 'Fetching...' ? 'text-blue-600' : 
                'text-gray-600'
              }`}>
                {resource.status}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  resource.status === 'Complete' ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${resource.progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">
              {resource.dataCount > 0 ? `${resource.dataCount} items loaded` : 'No data loaded'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 