'use client';

import { useEffect, useState } from 'react';
import { 
  Zap, 
  Package, 
  ShoppingCart, 
  ImageIcon, 
  BookOpen, 
  Palette, 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Database,
  Activity,
  TrendingUp,
  Settings,
  Pause,
  RotateCcw,
  AlertCircle,
  Info,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Resource {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  status: 'idle' | 'loading' | 'completed' | 'error' | 'paused';
  itemsLoaded: number;
  cacheHealth: 'healthy' | 'warning' | 'error' | 'unknown';
  lastUpdated: string | null;
  progress: number;
  error?: string;
  startTime?: string;
  estimatedTime?: number;
  retryCount: number;
}

const initialResources: Resource[] = [
  {
    id: 'shopify-orders',
    name: 'Shopify Orders',
    icon: ShoppingCart,
    color: 'text-blue-600',
    status: 'idle',
    itemsLoaded: 0,
    cacheHealth: 'unknown',
    lastUpdated: null,
    progress: 0,
    retryCount: 0,
  },
  {
    id: 'shopify-products',
    name: 'Shopify Products',
    icon: Package,
    color: 'text-green-600',
    status: 'idle',
    itemsLoaded: 0,
    cacheHealth: 'unknown',
    lastUpdated: null,
    progress: 0,
    retryCount: 0,
  },
  {
    id: 'pinterest-pins',
    name: 'Pinterest Pins',
    icon: ImageIcon,
    color: 'text-red-600',
    status: 'idle',
    itemsLoaded: 0,
    cacheHealth: 'unknown',
    lastUpdated: null,
    progress: 0,
    retryCount: 0,
  },
  {
    id: 'pinterest-boards',
    name: 'Pinterest Boards',
    icon: BookOpen,
    color: 'text-pink-600',
    status: 'idle',
    itemsLoaded: 0,
    cacheHealth: 'unknown',
    lastUpdated: null,
    progress: 0,
    retryCount: 0,
  },
  {
    id: 'design-library',
    name: 'Design Library Designs',
    icon: Palette,
    color: 'text-purple-600',
    status: 'idle',
    itemsLoaded: 0,
    cacheHealth: 'unknown',
    lastUpdated: null,
    progress: 0,
    retryCount: 0,
  },
];

const statusConfig = {
  idle: { color: 'text-gray-500', bg: 'bg-gray-100', icon: Square },
  loading: { color: 'text-blue-500', bg: 'bg-blue-100', icon: RefreshCw },
  completed: { color: 'text-green-500', bg: 'bg-green-100', icon: CheckCircle },
  error: { color: 'text-red-500', bg: 'bg-red-100', icon: XCircle },
  paused: { color: 'text-yellow-500', bg: 'bg-yellow-100', icon: Pause },
};

const healthConfig = {
  healthy: { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
  warning: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: AlertTriangle },
  error: { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
  unknown: { color: 'text-gray-600', bg: 'bg-gray-50', icon: Clock },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.idle;
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.bg, config.color)}>
      <Icon className={cn('h-3 w-3', status === 'loading' && 'animate-spin')} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function HealthBadge({ health }: { health: string }) {
  const config = healthConfig[health as keyof typeof healthConfig] || healthConfig.unknown;
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.bg, config.color)}>
      <Icon className="h-3 w-3" />
      {health.charAt(0).toUpperCase() + health.slice(1)}
    </span>
  );
}

export default function SystemEngineDashboard() {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedResources, setCompletedResources] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Add tab for this page
  useEffect(() => {
    const path = window.location.pathname;
    const { addTab } = require('@/lib/store').useAppStore.getState();
    addTab({
      title: 'Caching Settings',
      path,
      pinned: false,
      closable: true,
    });
  }, []);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  // Calculate overall progress
  useEffect(() => {
    const total = resources.length;
    const completed = resources.filter(r => r.status === 'completed').length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    setOverallProgress(progress);
    setCompletedResources(completed);
  }, [resources]);

  // Simulate resource loading with better error handling
  const startResource = async (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    setLoadingStates(prev => ({ ...prev, [resourceId]: true }));
    
    setResources(prev => prev.map(r => 
      r.id === resourceId 
        ? { 
            ...r, 
            status: 'loading', 
            progress: 0, 
            itemsLoaded: 0,
            startTime: new Date().toISOString(),
            error: undefined
          }
        : r
    ));

    try {
      // Simulate loading process with potential errors
      const totalSteps = 100;
      const shouldError = Math.random() < 0.1; // 10% chance of error
      const errorStep = shouldError ? Math.floor(Math.random() * 80) + 20 : -1;

      for (let i = 0; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (i === errorStep) {
          throw new Error(`Failed to load ${resource.name} at ${i}%`);
        }

        setResources(prev => prev.map(r => 
          r.id === resourceId 
            ? { 
                ...r, 
                progress: i, 
                itemsLoaded: Math.floor((i / totalSteps) * 1000),
                lastUpdated: new Date().toISOString()
              }
            : r
        ));
      }

      // Complete the resource
      setResources(prev => prev.map(r => 
        r.id === resourceId 
          ? { 
              ...r, 
              status: 'completed', 
              progress: 100, 
              itemsLoaded: 1000,
              cacheHealth: 'healthy',
              lastUpdated: new Date().toISOString()
            }
          : r
      ));
    } catch (error: any) {
      setResources(prev => prev.map(r => 
        r.id === resourceId 
          ? { 
              ...r, 
              status: 'error', 
              error: error.message,
              retryCount: r.retryCount + 1
            }
          : r
      ));
    } finally {
      setLoadingStates(prev => ({ ...prev, [resourceId]: false }));
    }
  };

  const stopResource = (resourceId: string) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId 
        ? { 
            ...r, 
            status: r.status === 'loading' ? 'paused' : 'idle', 
            progress: r.status === 'loading' ? r.progress : 0, 
            itemsLoaded: r.status === 'loading' ? r.itemsLoaded : 0 
          }
        : r
    ));
  };

  const pauseResource = (resourceId: string) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId 
        ? { ...r, status: 'paused' }
        : r
    ));
  };

  const retryResource = (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (resource && resource.status === 'error') {
      startResource(resourceId);
    }
  };

  const clearResource = (resourceId: string) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId 
        ? { 
            ...r, 
            status: 'idle', 
            progress: 0, 
            itemsLoaded: 0, 
            error: undefined,
            retryCount: 0,
            lastUpdated: null
          }
        : r
    ));
  };

  const refreshAll = () => {
    setShowConfirmReset(true);
  };

  const confirmRefreshAll = () => {
    setResources(prev => prev.map(r => ({ 
      ...r, 
      status: 'idle', 
      progress: 0, 
      itemsLoaded: 0, 
      error: undefined,
      retryCount: 0,
      lastUpdated: null
    })));
    setShowConfirmReset(false);
  };

  const startAll = async () => {
    const idleResources = resources.filter(r => r.status === 'idle');
    for (const resource of idleResources) {
      await startResource(resource.id);
    }
  };

  const stopAll = () => {
    setResources(prev => prev.map(r => 
      r.status === 'loading' 
        ? { ...r, status: 'paused' }
        : r
    ));
  };

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Engine Dashboard</h1>
            <p className="text-gray-600">Manage and monitor data caching across all resources</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{completedResources} of {resources.length} resources loaded</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              Overall Progress: {overallProgress.toFixed(0)}%
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={startAll}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={!resources.some(r => r.status === 'idle')}
            >
              <Play className="h-4 w-4" />
              Start All
            </button>
            <button
              onClick={stopAll}
              className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              disabled={!resources.some(r => r.status === 'loading')}
            >
              <Pause className="h-4 w-4" />
              Pause All
            </button>
            <button
              onClick={refreshAll}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh All
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">System Progress</span>
          <span className="text-sm text-gray-500">{overallProgress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <div key={resource.id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Icon className={cn('h-6 w-6', resource.color)} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                    <StatusBadge status={resource.status} />
                  </div>
                </div>
                <div className="flex gap-1">
                  {resource.status === 'idle' && (
                    <button
                      onClick={() => startResource(resource.id)}
                      disabled={loadingStates[resource.id]}
                      className="px-3 py-1 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                      title="Start"
                    >
                      <Play className="h-3 w-3" />
                    </button>
                  )}
                  {resource.status === 'loading' && (
                    <>
                      <button
                        onClick={() => pauseResource(resource.id)}
                        className="px-3 py-1 rounded text-sm font-medium bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
                        title="Pause"
                      >
                        <Pause className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => stopResource(resource.id)}
                        className="px-3 py-1 rounded text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                        title="Stop"
                      >
                        <Square className="h-3 w-3" />
                      </button>
                    </>
                  )}
                  {resource.status === 'paused' && (
                    <>
                      <button
                        onClick={() => startResource(resource.id)}
                        className="px-3 py-1 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                        title="Resume"
                      >
                        <Play className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => stopResource(resource.id)}
                        className="px-3 py-1 rounded text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                        title="Stop"
                      >
                        <Square className="h-3 w-3" />
                      </button>
                    </>
                  )}
                  {resource.status === 'error' && (
                    <>
                      <button
                        onClick={() => retryResource(resource.id)}
                        className="px-3 py-1 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        title="Retry"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => clearResource(resource.id)}
                        className="px-3 py-1 rounded text-sm font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                        title="Clear"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                  {resource.status === 'completed' && (
                    <button
                      onClick={() => clearResource(resource.id)}
                      className="px-3 py-1 rounded text-sm font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                      title="Clear"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Info */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items Loaded:</span>
                  <span className="font-medium">{resource.itemsLoaded.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cache Health:</span>
                  <HealthBadge health={resource.cacheHealth} />
                </div>

                {resource.lastUpdated && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-gray-500">
                      {new Date(resource.lastUpdated).toLocaleTimeString()}
                    </span>
                  </div>
                )}

                {resource.retryCount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Retry Count:</span>
                    <span className="text-orange-600 font-medium">{resource.retryCount}</span>
                  </div>
                )}

                {/* Progress Bar */}
                {(resource.status === 'loading' || resource.status === 'paused') && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{resource.status === 'paused' ? 'Paused' : 'Loading...'}</span>
                      <span>{resource.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          'h-2 rounded-full transition-all duration-300',
                          resource.status === 'paused' ? 'bg-yellow-500' : 'bg-blue-500'
                        )}
                        style={{ width: `${resource.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {resource.error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-red-700 text-xs">
                        <div className="font-medium mb-1">Error:</div>
                        <div>{resource.error}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* System Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">Active Resources</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-2">
            {resources.filter(r => r.status === 'loading').length}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-gray-900">Completed</span>
          </div>
          <div className="text-2xl font-bold text-green-600 mt-2">
            {completedResources}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-gray-900">Total Items</span>
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-2">
            {resources.reduce((sum, r) => sum + r.itemsLoaded, 0).toLocaleString()}
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            <span className="font-medium text-gray-900">Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-orange-600 mt-2">
            {resources.length > 0 ? ((completedResources / resources.length) * 100).toFixed(0) : 0}%
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Reset</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This will reset all resources to their initial state. Any progress will be lost. Are you sure?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRefreshAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
