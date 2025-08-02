import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, BoltIcon, ServerStackIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

interface SystemLoadStatusProps {
  resources: {
    key: string;
    label: string;
    status: string;
    progress: number;
    dataCount: number;
    error?: string | null;
  }[];
  onRefresh?: () => void;
  onStart?: (resourceKey: string) => void;
}

const resourceIcons: Record<string, React.ReactNode> = {
  orders: <BoltIcon className="w-6 h-6 text-blue-500" />,
  products: <ServerStackIcon className="w-6 h-6 text-green-500" />,
  pins: <BoltIcon className="w-6 h-6 text-red-400" />,
  boards: <ServerStackIcon className="w-6 h-6 text-pink-400" />,
  designs: <BoltIcon className="w-6 h-6 text-indigo-500" />,
};

const tableMap: Record<string, string> = {
  orders: "shopify-inkhub-get-orders",
  products: "shopify-inkhub-get-products",
  pins: "pinterest_inkhub_get_pins",
  boards: "pinterest_inkhub_get_boards",
  designs: "admin-design-image"
};

function formatTTL(seconds: number | null | undefined) {
  if (!seconds || seconds < 0) return 'N/A';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getCacheHealth(ttl: number | null | undefined) {
  if (ttl == null) return { status: 'unknown', color: 'text-red-600' };
  if (ttl > 3600) return { status: 'good', color: 'text-green-600' };
  if (ttl > 600) return { status: 'warning', color: 'text-yellow-600' };
  return { status: 'critical', color: 'text-red-600' };
}

export default function SystemLoadStatus({ resources, onRefresh, onStart }: SystemLoadStatusProps) {
  const [dataCounts, setDataCounts] = useState<Record<string, number>>({});
  const [cacheStats, setCacheStats] = useState<Record<string, any>>({});
  const [chunkCounts, setChunkCounts] = useState<Record<string, { loaded: number; total: number }>>({});
  const [loading, setLoading] = useState(false);

  // Fetch all cache keys and cache stats for each resource
  useEffect(() => {
    let isMounted = true;
    async function fetchAllData() {
      setLoading(true);
      const counts: Record<string, number> = {};
      const stats: Record<string, any> = {};
      const chunkInfo: Record<string, { loaded: number; total: number }> = {};
      for (const resource of resources) {
        const table = tableMap[resource.key];
        if (table) {
          try {
            // Fetch cache keys
            const res = await axios.get('http://localhost:5001/cache/data', {
              params: { project: 'my-app', table }
            });
            const keys = res.data.keys || [];
            counts[resource.key] = Array.isArray(keys) ? keys.length : 0;
            // Fetch cache stats
            const statsRes = await axios.get('http://localhost:5001/cache/stats', {
              params: { project: 'my-app', table }
            });
            stats[resource.key] = statsRes.data.stats || {};
            // Chunks: loaded = keys.length, total = stats.totalKeys (if available) or keys.length
            const totalChunks = stats[resource.key].totalKeys || keys.length;
            chunkInfo[resource.key] = { loaded: keys.length, total: totalChunks };
          } catch (e) {
            counts[resource.key] = 0;
            stats[resource.key] = {};
            chunkInfo[resource.key] = { loaded: 0, total: 0 };
          }
        }
      }
      if (isMounted) {
        setDataCounts(counts);
        setCacheStats(stats);
        setChunkCounts(chunkInfo);
      }
      setLoading(false);
    }
    fetchAllData();
    return () => { isMounted = false; };
  }, [resources]);

  // Calculate loaded resources and progress
  const totalResources = resources.length;
  const loadedResources = resources.filter(r => (dataCounts[r.key] || 0) > 0).length;
  const overallPercent = totalResources > 0 ? Math.round((loadedResources / totalResources) * 100) : 0;

  return (
    <div className="w-full min-h-screen p-6 pb-24 md:p-12 md:pb-32 bg-white animate-fade-in">
      {/* Header and Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BoltIcon className="w-8 h-8 text-blue-500 animate-pulse" />
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">System Engine Dashboard</h2>
        </div>
        <div className="flex gap-2 items-center">
          <div className={`px-3 py-1 rounded-full font-semibold text-sm border bg-green-100 text-green-700 flex items-center gap-2`}>
            <CheckCircleIcon className="w-5 h-5" />
            {loadedResources} of {totalResources} resources loaded
          </div>
        </div>
      </div>
      {/* Overall Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
        <div className="h-4 rounded-full bg-green-500 transition-all duration-500" style={{ width: `${overallPercent}%` }}></div>
      </div>
      <div className="flex justify-end mb-6">
        <span className="text-sm text-gray-600">Overall Progress: {overallPercent}%</span>
      </div>
      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {resources.map((resource, idx) => {
          const count = dataCounts[resource.key] || 0;
          const stats = cacheStats[resource.key] || {};
          let ttl: number | null = null;
          if (stats.sampleTTLs && stats.sampleTTLs.length > 0) {
            ttl = Math.min(...stats.sampleTTLs.map((s: any) => s.ttl));
          }
          const health = getCacheHealth(ttl);
          const chunk = chunkCounts[resource.key] || { loaded: 0, total: 0 };
          const percent = chunk.total > 0 ? Math.round((chunk.loaded / chunk.total) * 100) : 0;
          const isComplete = chunk.loaded === chunk.total && chunk.total > 0;
          return (
            <div
              key={resource.key}
              className="relative rounded-xl border bg-white p-6 shadow-sm transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {resourceIcons[resource.key] || <BoltIcon className="w-6 h-6 text-gray-400" />}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{resource.label}</h3>
                    <p className="text-sm text-gray-500">
                      {count} items loaded
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  {isComplete ? (
                    <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      Complete
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-blue-600">Loading...</span>
                  )}
                </div>
              </div>
              {/* Blue Progress Bar */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              {/* Cache Health */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Cache Health:</span>
                <span className={`font-semibold ${health.color}`}>{health.status}</span>
                <span>({formatTTL(ttl)})</span>
                </div>
                {/* Start Button */}
                <button
                  className="px-2.5 py-1.5 border border-blue-500 bg-white text-blue-500 rounded-md hover:bg-blue-50 transition-colors duration-200 font-medium text-sm"
                  onClick={() => {
                    if (typeof onStart === 'function') onStart(resource.key);
                  }}
                >
                  Start
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 