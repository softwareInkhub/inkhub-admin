'use client';

import React from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Database,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResourceStatus {
  key: string;
  label: string;
  status: 'idle' | 'loading' | 'completed' | 'error' | 'paused';
  progress: number;
  dataCount: number;
  error?: string | null;
}

interface SystemLoadStatusProps {
  resources: ResourceStatus[];
  onStart: (resourceKey: string) => void;
}

const statusConfig = {
  idle: { color: 'text-gray-500', bg: 'bg-gray-100', icon: Clock },
  loading: { color: 'text-blue-500', bg: 'bg-blue-100', icon: Activity },
  completed: { color: 'text-green-500', bg: 'bg-green-100', icon: CheckCircle },
  error: { color: 'text-red-500', bg: 'bg-red-100', icon: XCircle },
  paused: { color: 'text-yellow-500', bg: 'bg-yellow-100', icon: Pause },
};

const healthConfig = {
  good: { color: 'text-green-600', bg: 'bg-green-50', text: 'Good' },
  warning: { color: 'text-yellow-600', bg: 'bg-yellow-50', text: 'Warning' },
  error: { color: 'text-red-600', bg: 'bg-red-50', text: 'Error' },
  unknown: { color: 'text-gray-600', bg: 'bg-gray-50', text: 'Unknown' },
};

export default function SystemLoadStatus({ resources, onStart }: SystemLoadStatusProps) {
  const overallProgress = resources.length > 0 
    ? Math.round(resources.reduce((sum, r) => sum + r.progress, 0) / resources.length)
    : 0;
  
  const completedResources = resources.filter(r => r.status === 'completed').length;
  const totalItems = resources.reduce((sum, r) => sum + r.dataCount, 0);
  const successRate = resources.length > 0 
    ? Math.round((completedResources / resources.length) * 100)
    : 0;

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Engine Dashboard</h1>
            <p className="text-gray-600">Monitor and manage data resources</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Overall Progress</div>
            <div className="text-2xl font-bold text-gray-900">{overallProgress}%</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Resources</div>
            <div className="text-2xl font-bold text-gray-900">{completedResources}/{resources.length}</div>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress: {overallProgress}%</span>
          <span className="text-sm text-gray-500">{completedResources} of {resources.length} resources loaded</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {resources.map((resource) => {
          const status = statusConfig[resource.status];
          const StatusIcon = status.icon;
          const health = resource.status === 'completed' ? 'good' : 
                        resource.status === 'error' ? 'error' : 
                        resource.status === 'loading' ? 'warning' : 'unknown';
          const healthStatus = healthConfig[health];

          return (
            <div key={resource.key} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <StatusIcon className={cn("h-6 w-6", status.color)} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{resource.label}</h3>
                    <p className="text-sm text-gray-500">{resource.dataCount} items loaded</p>
                  </div>
                </div>
                <div className={cn("px-2 py-1 rounded-full text-xs font-medium", healthStatus.bg, healthStatus.color)}>
                  {healthStatus.text}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-gray-900">{resource.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      resource.status === 'completed' ? 'bg-green-500' :
                      resource.status === 'error' ? 'bg-red-500' :
                      resource.status === 'loading' ? 'bg-blue-500' :
                      resource.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-300'
                    )}
                    style={{ width: `${resource.progress}%` }}
                  />
                </div>
              </div>

              {/* Error Display */}
              {resource.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{resource.error}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onStart(resource.key)}
                  disabled={resource.status === 'loading'}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    resource.status === 'loading' 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                >
                  <Play className="h-4 w-4" />
                  {resource.status === 'loading' ? 'Loading...' : 'Start'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Active Resources</p>
              <p className="text-2xl font-bold text-gray-900">
                {resources.filter(r => r.status === 'loading').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedResources}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
