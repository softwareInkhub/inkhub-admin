'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Server, Database, Cloud, Clock, Cpu, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockFetchHealth = async () => {
  // Simulate API call
  await new Promise(res => setTimeout(res, 500));
  // Return mock health data
  return {
    system: { status: 'healthy', uptime: 123456, lastChecked: new Date().toISOString() },
    api: { status: 'healthy', latency: 120, lastChecked: new Date().toISOString() },
    database: { status: 'warning', latency: 350, lastChecked: new Date().toISOString(), error: 'Slow query detected' },
    storage: { status: 'healthy', usage: 0.42, lastChecked: new Date().toISOString() },
    cpu: { status: 'healthy', usage: 0.18, lastChecked: new Date().toISOString() },
    memory: { status: 'healthy', usage: 0.33, lastChecked: new Date().toISOString() },
  };
};

const statusConfig = {
  healthy: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  warning: { color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
  error: { color: 'bg-red-100 text-red-700', icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.error;
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.color)}>
      <Icon className="h-4 w-4" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function SystemHealthCheckPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Add tab for this page
  useEffect(() => {
    const path = window.location.pathname;
    const { addTab } = require('@/lib/store').useAppStore.getState();
    addTab({
      title: 'Health Check',
      path,
      pinned: false,
      closable: true,
    });
  }, []);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mockFetchHealth();
      setHealth(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError('Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(fetchHealth, 10000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [autoRefresh]);

  return (
    <div className="p-6 w-full min-h-screen bg-white animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">System Health</h1>
          <p className="text-gray-600">Live status and diagnostics for your system</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchHealth}
            className="flex items-center gap-1 px-3 py-2 border rounded-lg text-blue-600 hover:bg-blue-50"
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </button>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              className="accent-blue-600"
            />
            <span className="text-gray-700 text-sm">Auto-refresh</span>
          </label>
          <span className="text-xs text-gray-500">Last checked: {lastChecked}</span>
        </div>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* System */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">System</span>
            {health && <StatusBadge status={health.system.status} />}
          </div>
          <div className="text-gray-600 text-sm">Uptime: {health ? (health.system.uptime / 3600).toFixed(1) : '--'} hrs</div>
          <div className="text-gray-500 text-xs">Last checked: {health ? new Date(health.system.lastChecked).toLocaleTimeString() : '--'}</div>
        </div>
        {/* API */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="h-5 w-5 text-indigo-600" />
            <span className="font-semibold text-gray-900">API</span>
            {health && <StatusBadge status={health.api.status} />}
          </div>
          <div className="text-gray-600 text-sm">Latency: {health ? health.api.latency : '--'} ms</div>
          <div className="text-gray-500 text-xs">Last checked: {health ? new Date(health.api.lastChecked).toLocaleTimeString() : '--'}</div>
        </div>
        {/* Database */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-gray-900">Database</span>
            {health && <StatusBadge status={health.database.status} />}
          </div>
          <div className="text-gray-600 text-sm">Latency: {health ? health.database.latency : '--'} ms</div>
          {health && health.database.error && (
            <div className="text-yellow-700 text-xs bg-yellow-50 rounded px-2 py-1 mt-1">{health.database.error}</div>
          )}
          <div className="text-gray-500 text-xs">Last checked: {health ? new Date(health.database.lastChecked).toLocaleTimeString() : '--'}</div>
        </div>
        {/* Storage */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border">
          <div className="flex items-center gap-2 mb-2">
            <Server className="h-5 w-5 text-orange-600" />
            <span className="font-semibold text-gray-900">Storage</span>
            {health && <StatusBadge status={health.storage.status} />}
          </div>
          <div className="text-gray-600 text-sm">Usage: {health ? (health.storage.usage * 100).toFixed(1) : '--'}%</div>
          <div className="text-gray-500 text-xs">Last checked: {health ? new Date(health.storage.lastChecked).toLocaleTimeString() : '--'}</div>
        </div>
        {/* CPU */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-5 w-5 text-pink-600" />
            <span className="font-semibold text-gray-900">CPU</span>
            {health && <StatusBadge status={health.cpu.status} />}
          </div>
          <div className="text-gray-600 text-sm">Usage: {health ? (health.cpu.usage * 100).toFixed(1) : '--'}%</div>
          <div className="text-gray-500 text-xs">Last checked: {health ? new Date(health.cpu.lastChecked).toLocaleTimeString() : '--'}</div>
        </div>
        {/* Memory */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border">
          <div className="flex items-center gap-2 mb-2">
            <Server className="h-5 w-5 text-teal-600" />
            <span className="font-semibold text-gray-900">Memory</span>
            {health && <StatusBadge status={health.memory.status} />}
          </div>
          <div className="text-gray-600 text-sm">Usage: {health ? (health.memory.usage * 100).toFixed(1) : '--'}%</div>
          <div className="text-gray-500 text-xs">Last checked: {health ? new Date(health.memory.lastChecked).toLocaleTimeString() : '--'}</div>
        </div>
      </div>
    </div>
  );
}
