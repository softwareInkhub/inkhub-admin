'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  RefreshCw, 
  Play, 
  Square, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  Activity,
  Settings,
  Zap,
  FileText,
  ImageIcon,
  Package,
  ShoppingCart,
  BookOpen,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IndexingTask {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  status: 'idle' | 'indexing' | 'completed' | 'error' | 'paused';
  progress: number;
  itemsIndexed: number;
  totalItems: number;
  lastIndexed: string | null;
  error?: string;
  startTime?: string;
  estimatedTime?: number;
  retryCount: number;
}

const initialTasks: IndexingTask[] = [
  {
    id: 'shopify-orders',
    name: 'Shopify Orders',
    description: 'Index all order data for fast search and filtering',
    icon: ShoppingCart,
    color: 'text-blue-600',
    status: 'idle',
    progress: 0,
    itemsIndexed: 0,
    totalItems: 0,
    lastIndexed: null,
    retryCount: 0,
  },
  {
    id: 'shopify-products',
    name: 'Shopify Products',
    description: 'Index product catalog for search and categorization',
    icon: Package,
    color: 'text-green-600',
    status: 'idle',
    progress: 0,
    itemsIndexed: 0,
    totalItems: 0,
    lastIndexed: null,
    retryCount: 0,
  },
  {
    id: 'pinterest-pins',
    name: 'Pinterest Pins',
    description: 'Index pin data for content discovery',
    icon: ImageIcon,
    color: 'text-red-600',
    status: 'idle',
    progress: 0,
    itemsIndexed: 0,
    totalItems: 0,
    lastIndexed: null,
    retryCount: 0,
  },
  {
    id: 'pinterest-boards',
    name: 'Pinterest Boards',
    description: 'Index board collections and metadata',
    icon: BookOpen,
    color: 'text-pink-600',
    status: 'idle',
    progress: 0,
    itemsIndexed: 0,
    totalItems: 0,
    lastIndexed: null,
    retryCount: 0,
  },
  {
    id: 'design-library',
    name: 'Design Library',
    description: 'Index design assets and metadata',
    icon: Palette,
    color: 'text-purple-600',
    status: 'idle',
    progress: 0,
    itemsIndexed: 0,
    totalItems: 0,
    lastIndexed: null,
    retryCount: 0,
  },
];

function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'indexing':
        return { color: 'bg-blue-100 text-blue-800', icon: Activity };
      case 'error':
        return { color: 'bg-red-100 text-red-800', icon: XCircle };
      case 'paused':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Pause };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.color)}>
      <Icon className="h-4 w-4" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function IndexingPage() {
  const [tasks, setTasks] = useState<IndexingTask[]>(initialTasks);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Add tab for this page
  useEffect(() => {
    const path = window.location.pathname;
    const { addTab } = require('@/lib/store').useAppStore.getState();
    addTab({
      title: 'Indexing Management',
      path,
      pinned: false,
      closable: true,
    });
  }, []);

  const startIndexing = async (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: 'indexing' as const, 
            startTime: new Date().toISOString(),
            progress: 0,
            itemsIndexed: 0
          }
        : task
    ));

    // Simulate indexing process
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const totalItems = Math.floor(Math.random() * 10000) + 1000;
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, totalItems } : t
    ));

    // Simulate progress updates
    const interval = setInterval(() => {
      setTasks(prev => {
        const task = prev.find(t => t.id === taskId);
        if (!task || task.status !== 'indexing') {
          clearInterval(interval);
          return prev;
        }

        const newProgress = Math.min(task.progress + Math.random() * 10, 100);
        const newItemsIndexed = Math.floor((newProgress / 100) * task.totalItems);

        if (newProgress >= 100) {
          clearInterval(interval);
          return prev.map(t => 
            t.id === taskId 
              ? { 
                  ...t, 
                  status: 'completed' as const, 
                  progress: 100, 
                  itemsIndexed: task.totalItems,
                  lastIndexed: new Date().toISOString()
                }
              : t
          );
        }

        return prev.map(t => 
          t.id === taskId 
            ? { ...t, progress: newProgress, itemsIndexed: newItemsIndexed }
            : t
        );
      });
    }, 1000);
  };

  const stopIndexing = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'paused' as const }
        : task
    ));
  };

  const pauseIndexing = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'paused' as const }
        : task
    ));
  };

  const retryIndexing = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: 'idle' as const, 
            progress: 0, 
            itemsIndexed: 0,
            error: undefined,
            retryCount: task.retryCount + 1
          }
        : task
    ));
  };

  const resetIndexing = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: 'idle' as const, 
            progress: 0, 
            itemsIndexed: 0,
            totalItems: 0,
            lastIndexed: null,
            error: undefined,
            retryCount: 0
          }
        : task
    ));
  };

  const startAllIndexing = async () => {
    setLoading(true);
    const indexingTasks = tasks.filter(task => task.status === 'idle' || task.status === 'error');
    
    for (const task of indexingTasks) {
      await startIndexing(task.id);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between starts
    }
    setLoading(false);
  };

  const stopAllIndexing = () => {
    setTasks(prev => prev.map(task => 
      task.status === 'indexing' 
        ? { ...task, status: 'paused' as const }
        : task
    ));
  };

  const refreshAll = () => {
    setTasks(prev => prev.map(task => ({
      ...task,
      status: 'idle' as const,
      progress: 0,
      itemsIndexed: 0,
      totalItems: 0,
      lastIndexed: null,
      error: undefined,
      retryCount: 0
    })));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'indexing': return 'text-blue-600';
      case 'error': return 'text-red-600';
      case 'paused': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="p-6 w-full min-h-screen bg-gray-50 animate-fade-in">
      {/* Header */}
      <div className="mb-6 animate-slide-up">
        <h1 className="text-2xl font-bold gradient-text mb-2">
          Indexing Management
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400">
          Manage search indexing for all data sources
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 hover-lift animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Total Tasks
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {tasks.length}
              </p>
            </div>
            <Database className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card p-6 hover-lift animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Active Indexing
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {tasks.filter(t => t.status === 'indexing').length}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="card p-6 hover-lift animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Completed
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="card p-6 hover-lift animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                Errors
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {tasks.filter(t => t.status === 'error').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card p-6 mb-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={startAllIndexing}
              disabled={loading || tasks.every(t => t.status === 'indexing' || t.status === 'completed')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="mr-2 h-4 w-4" />
              Start All
            </button>
            <button
              onClick={stopAllIndexing}
              disabled={!tasks.some(t => t.status === 'indexing')}
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause All
            </button>
            <button
              onClick={refreshAll}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset All
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-secondary-600 dark:text-secondary-400">
                Auto-refresh
              </span>
            </label>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-3 py-2 text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-100 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Indexing Tasks */}
      <div className="space-y-4">
        {tasks.map((task, index) => {
          const Icon = task.icon;
          return (
            <div key={task.id} className="card p-6 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${task.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                    <Icon className={`h-6 w-6 ${task.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                      {task.name}
                    </h3>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      {task.description}
                    </p>
                  </div>
                </div>
                <StatusBadge status={task.status} />
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                  <span>Progress: {task.progress.toFixed(1)}%</span>
                  <span>{formatNumber(task.itemsIndexed)} / {formatNumber(task.totalItems)} items</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2 dark:bg-secondary-700">
                  <div 
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      task.status === 'completed' ? 'bg-green-600' :
                      task.status === 'error' ? 'bg-red-600' :
                      task.status === 'indexing' ? 'bg-blue-600' :
                      'bg-secondary-400'
                    )}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>

              {/* Task Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-secondary-600 dark:text-secondary-400">Last Indexed:</span>
                  <p className="font-medium">{formatDate(task.lastIndexed)}</p>
                </div>
                <div>
                  <span className="text-secondary-600 dark:text-secondary-400">Retry Count:</span>
                  <p className="font-medium">{task.retryCount}</p>
                </div>
                <div>
                  <span className="text-secondary-600 dark:text-secondary-400">Status:</span>
                  <p className={cn('font-medium', getStatusColor(task.status))}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {task.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800 dark:text-red-200">{task.error}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center space-x-2">
                {task.status === 'idle' && (
                  <button
                    onClick={() => startIndexing(task.id)}
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 transition-colors"
                  >
                    <Play className="mr-1 h-4 w-4" />
                    Start
                  </button>
                )}
                
                {task.status === 'indexing' && (
                  <>
                    <button
                      onClick={() => pauseIndexing(task.id)}
                      className="inline-flex items-center px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 transition-colors"
                    >
                      <Pause className="mr-1 h-4 w-4" />
                      Pause
                    </button>
                    <button
                      onClick={() => stopIndexing(task.id)}
                      className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors"
                    >
                      <Square className="mr-1 h-4 w-4" />
                      Stop
                    </button>
                  </>
                )}

                {task.status === 'paused' && (
                  <button
                    onClick={() => startIndexing(task.id)}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <Play className="mr-1 h-4 w-4" />
                    Resume
                  </button>
                )}

                {(task.status === 'error' || task.status === 'completed') && (
                  <button
                    onClick={() => retryIndexing(task.id)}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Retry
                  </button>
                )}

                <button
                  onClick={() => resetIndexing(task.id)}
                  className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  <RotateCcw className="mr-1 h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
