import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, ArrowPathIcon, BoltIcon, ServerStackIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/solid';

interface SystemLoadStatusProps {
  resources: {
    key: string;
    label: string;
    status: string;
    progress: number;
    dataCount: number;
    error?: string | null;
    // Optionally, add lastUpdated, latency, etc.
  }[];
  onRefresh?: () => void;
}

interface TotalCounts {
  [key: string]: number | { error: string };
}

const resourceIcons: Record<string, React.ReactNode> = {
  orders: <BoltIcon className="w-6 h-6 text-blue-500" />,
  products: <ServerStackIcon className="w-6 h-6 text-green-500" />,
  pins: <BoltIcon className="w-6 h-6 text-red-400" />,
  boards: <ServerStackIcon className="w-6 h-6 text-pink-400" />,
  designs: <BoltIcon className="w-6 h-6 text-indigo-500" />,
};

function getStatusColor(status: string) {
  if (status === 'Complete') return 'bg-green-100 text-green-700 border-green-300';
  if (status === 'Fetching...') return 'bg-blue-100 text-blue-700 border-blue-300 animate-pulse';
  if (status === 'Error') return 'bg-red-100 text-red-700 border-red-300';
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

export default function SystemLoadStatus({ resources, onRefresh }: SystemLoadStatusProps) {
  const [totalCounts, setTotalCounts] = useState<TotalCounts>({});
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [priority, setPriority] = useState<string[]>([]);
  const [savingPriority, setSavingPriority] = useState(false);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [liveProgress, setLiveProgress] = useState<Record<string, any>>({});
  const [paused, setPaused] = useState(false);
  const [resourcePaused, setResourcePaused] = useState<Record<string, boolean>>({});
  const [clearing, setClearing] = useState<Record<string, boolean>>({});

  const fetchCounts = async (refresh = false) => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/system-load/total-counts${refresh ? '?refresh=true' : ''}`);
      const data = await response.json();
      setTotalCounts(data);
    } catch (error) {
      console.error('Error fetching total counts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCounts(false);
  }, []);

  useEffect(() => {
    fetch('/api/system-load/metrics')
      .then(res => res.json())
      .then(setMetrics)
      .catch(() => setMetrics(null));
  }, []);

  // Fetch priority list on mount (via API)
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/system-load/priority');
      const data = await res.json();
      if (data.priority && data.priority.length) setPriority(data.priority);
      else setPriority(resources.map(r => r.key));
    })();
  }, [resources]);

  // Poll for live progress every 1s
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/system-load/progress');
      const data = await res.json();
      setLiveProgress(data);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check paused state on mount and poll
  useEffect(() => {
    const checkPaused = async () => {
      const res = await fetch('/api/system-load/pause', { method: 'GET' });
      const data = await res.json();
      setPaused(!!data.paused);
    };
    checkPaused();
    const interval = setInterval(checkPaused, 2000);
    return () => clearInterval(interval);
  }, []);

  // Poll per-resource paused state
  useEffect(() => {
    const pollPaused = async () => {
      const updates: Record<string, boolean> = {};
      for (const key of priority) {
        const res = await fetch(`/api/system-load/pause/${key}`);
        const data = await res.json();
        updates[key] = !!data.paused;
      }
      setResourcePaused(updates);
    };
    pollPaused();
    const interval = setInterval(pollPaused, 2000);
    return () => clearInterval(interval);
  }, [priority]);

  const totalResources = resources.length;
  const completedResources = resources.filter(r => r.status === 'Complete').length;
  const hasError = resources.some(r => r.status === 'Error');
  // Calculate overall progress based on all resources
  const totalLoaded = resources.reduce((sum, r) => sum + r.dataCount, 0);
  const totalPossible = resources.reduce((sum, r) => sum + (typeof totalCounts[r.key] === 'number' ? totalCounts[r.key] as number : 0), 0);
  const overallPercent = totalPossible > 0 ? Math.round((totalLoaded / totalPossible) * 100) : 0;
  const globalStatus = hasError
    ? 'Degraded'
    : completedResources === totalResources
    ? 'All Systems Operational'
    : 'Loading';
  const globalStatusColor = hasError
    ? 'bg-red-100 text-red-700'
    : completedResources === totalResources
    ? 'bg-green-100 text-green-700'
    : 'bg-blue-100 text-blue-700';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Complete':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'Error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'Fetching...':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getTotalCount = (key: string) => {
    const count = totalCounts[key];
    if (typeof count === 'number') {
      return count;
    }
    return 0;
  };

  function formatUptime(seconds: number) {
    if (!seconds) return '--';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [
      d ? `${d}d` : '',
      h ? `${h}h` : '',
      m ? `${m}m` : '',
      `${s}s`
    ].filter(Boolean).join(' ');
  }

  // Drag-and-drop handlers
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    e.dataTransfer.setData('dragIndex', idx.toString());
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'));
    if (dragIndex === idx) return;
    const newPriority = [...priority];
    const [removed] = newPriority.splice(dragIndex, 1);
    newPriority.splice(idx, 0, removed);
    setPriority(newPriority);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Save priority order (via API)
  const savePriority = async () => {
    setSavingPriority(true);
    await fetch('/api/system-load/priority', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority }),
    });
    setSavingPriority(false);
    window.location.reload();
  };

  // Fetch all handler
  const fetchAll = async () => {
    setFetchingAll(true);
    await fetch('/api/system-load/fetch-all?refresh=true');
    setFetchingAll(false);
    window.location.reload();
  };

  const handlePauseResume = async () => {
    if (paused) {
      await fetch('/api/system-load/resume', { method: 'POST' });
      setPaused(false);
    } else {
      await fetch('/api/system-load/pause', { method: 'POST' });
      setPaused(true);
    }
  };

  // Per-resource pause/resume handler
  const handleResourcePauseResume = async (key: string) => {
    if (resourcePaused[key]) {
      await fetch(`/api/system-load/resume/${key}`, { method: 'POST' });
    } else {
      await fetch(`/api/system-load/pause/${key}`, { method: 'POST' });
    }
    // Optimistically update state
    setResourcePaused(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearCache = async (key: string) => {
    if (clearing[key] || fetchingAll) return;
  
    setClearing(prev => ({ ...prev, [key]: true }));
  
    try {
      const res = await fetch(`/api/system-load/clear-cache/${key}`, {
        method: 'POST',
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        console.error(`Failed to clear cache for ${key}:`, errorData.details);
        alert(`Error: Could not clear cache for ${key}.`);
      }
    } catch (error) {
      console.error('Error in clear cache request:', error);
      alert(`An unexpected error occurred while clearing cache for ${key}.`);
    } finally {
      window.location.reload();
    }
  };

  return (
    <div className="w-full min-h-screen p-6 pb-24 md:p-12 md:pb-32 bg-white animate-fade-in">
      {/* Engine Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BoltIcon className="w-8 h-8 text-blue-500 animate-pulse" />
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">System Engine Dashboard</h2>
        </div>
        <div className="flex gap-2 items-center">
          <button
            className={`flex items-center gap-1 px-3 py-1 rounded-lg ${paused ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-blue-50 text-blue-700 border-blue-200'} font-semibold text-xs border shadow-sm transition-colors disabled:opacity-60`}
            onClick={handlePauseResume}
            title={paused ? "Resume Fetching" : "Pause Fetching"}
            disabled={fetchingAll}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-xs border border-green-200 shadow-sm transition-colors disabled:opacity-60"
            onClick={fetchAll}
            title="Fetch All Data"
            disabled={fetchingAll || paused}
          >
            {fetchingAll ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ArrowPathIcon className="w-4 h-4" />} Fetch All
          </button>
          <div className={`px-3 py-1 rounded-full font-semibold text-sm border ${globalStatusColor} flex items-center gap-2`}>
            {hasError ? <ExclamationCircleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
            {globalStatus}
          </div>
        </div>
      </div>
      {/* Refresh & Metrics */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4 items-center">
          <span className="text-sm text-gray-700">{completedResources} of {totalResources} resources loaded <span className="text-gray-400 ml-2">(Engine v1.0)</span></span>
        </div>
        <button
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 shadow-sm transition-colors disabled:opacity-60"
          onClick={() => fetchCounts(true)}
          title="Refresh System Status"
          disabled={refreshing}
        >
          <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>
      {/* Overall Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
        <div className="h-4 rounded-full bg-green-500 transition-all duration-500" style={{ width: `${overallPercent}%` }}></div>
      </div>
      <div className="flex justify-end mb-6">
        <span className="text-sm text-gray-600">Overall Progress: {overallPercent}%</span>
      </div>
      {/* System Metrics (real data) */}
      <div className="flex gap-6 mb-6">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Uptime</span>
          <span className="font-bold text-green-700">{metrics ? formatUptime(metrics.uptime) : '--'}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">API Latency</span>
          <span className="font-bold text-blue-700">{metrics ? `${metrics.apiLatency}ms` : '--'}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Cache Hit Rate</span>
          <span className="font-bold text-indigo-700">{metrics && metrics.cacheHitRate !== null ? `${metrics.cacheHitRate}%` : '--'}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">Memory Usage</span>
          <span className="font-bold text-pink-700">{metrics ? `${metrics.memoryUsage.toFixed(2)}MB` : '--'}</span>
        </div>
      </div>
      {/* Priority Drag-and-Drop UI */}
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Set Fetch Priority (Drag to reorder):</h4>
        <div className="flex flex-wrap gap-2 mb-2">
          {priority.map((key, idx) => {
            const resource = resources.find(r => r.key === key);
            if (!resource) return null;
            return (
              <div
                key={key}
                className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold border border-blue-300 cursor-move select-none"
                draggable
                onDragStart={e => onDragStart(e, idx)}
                onDrop={e => onDrop(e, idx)}
                onDragOver={onDragOver}
              >
                {resource.label}
              </div>
            );
          })}
        </div>
        <button
          className="px-4 py-1 rounded bg-blue-600 text-white font-bold disabled:opacity-60"
          onClick={savePriority}
          disabled={savingPriority}
        >
          {savingPriority ? 'Saving...' : 'Save Priority'}
        </button>
      </div>
      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {priority
          .map(key => resources.find(r => r.key === key))
          .filter(Boolean)
          .map((resource, idx) => {
            if (!resource) return null;
            const key = resource.key;
            const total = getTotalCount(key);
            const currentProgress = liveProgress[key] ?? {};
            const count = currentProgress.count ?? resource.dataCount;
            const percentage = total > 0 ? Math.min(Math.round((count / total) * 100), 100) : resource.progress;
            const status = percentage === 100 ? 'Complete' : resource.status;
            const isPaused = resourcePaused[key];

            return (
              <div
                key={key}
                className="relative rounded-xl border bg-white p-6 shadow-sm transition-all duration-300"
                draggable
                onDragStart={e => onDragStart(e, idx)}
                onDrop={e => onDrop(e, idx)}
                onDragOver={onDragOver}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    {resourceIcons[key] || <BoltIcon className="w-6 h-6 text-gray-400" />}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{resource.label}</h3>
                      <p className="text-sm text-gray-500">
                        {count} of {total} items loaded ({percentage}%)
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    {getStatusIcon(status)}
                    <span
                      className={`text-xs font-semibold ${
                        status === 'Complete'
                          ? 'text-green-600'
                          : status === 'Error'
                          ? 'text-red-600'
                          : isPaused
                          ? 'text-yellow-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {isPaused ? 'Paused' : status}
                    </span>
                  </div>
                </div>

                {/* Progress bar and controls */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        status === 'Complete'
                          ? 'bg-green-500'
                          : status === 'Error'
                          ? 'bg-red-500'
                          : isPaused
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-500">Page: {currentProgress.page ?? 1}</p>
                    <div className="flex items-center gap-2">
                      {(['Fetching...', 'Waiting...'].includes(status) || isPaused) && (
                        <button
                          className={`w-8 h-8 flex items-center justify-center rounded-full border shadow-sm transition-colors ${
                            isPaused
                              ? 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200'
                              : 'bg-blue-100 border-blue-300 hover:bg-blue-200'
                          }`}
                          onClick={e => {
                            e.stopPropagation();
                            handleResourcePauseResume(key);
                          }}
                          title={isPaused ? 'Resume' : 'Pause'}
                        >
                          {isPaused ? (
                            <PlayIcon className="w-5 h-5 text-yellow-700" />
                          ) : (
                            <PauseIcon className="w-5 h-5 text-blue-700" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleClearCache(key)}
                        disabled={clearing[key]}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-600 font-semibold text-xs border border-red-200 shadow-sm hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {clearing[key] ? (
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          <ExclamationCircleIcon className="w-4 h-4" />
                        )}
                        {clearing[key] ? 'Clearing...' : 'Clear Cache'}
                      </button>
                    </div>
                  </div>
                </div>

                {resource.error && <p className="text-sm text-red-500 mt-2">{resource.error}</p>}
              </div>
            );
          })}
      </div>
       {paused && (
        <div className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-sm border border-yellow-200 flex items-center gap-2 mt-2">
          ⏸️ Paused
        </div>
      )} 
    </div>
  );
} 