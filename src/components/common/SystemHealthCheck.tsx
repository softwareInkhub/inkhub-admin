import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

function statusIcon(status: string) {
  if (status === 'ok') return <CheckCircleIcon className="w-7 h-7 text-green-500" />;
  if (status === 'error') return <XCircleIcon className="w-7 h-7 text-red-500" />;
  return <ExclamationTriangleIcon className="w-7 h-7 text-yellow-500" />;
}

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

export default function SystemHealthCheck() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/system-load/health');
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000); // auto-refresh every 60s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex items-center gap-2 text-gray-500"><ArrowPathIcon className="w-5 h-5 animate-spin" /> Loading health checks...</div>;

  return (
    <div className="w-full h-[100vh] min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 animate-fade-in flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="w-full h-full rounded-none shadow-none bg-white/90 p-8 flex flex-col gap-8 border-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
              <span className="inline-block bg-blue-100 rounded-full p-2"><CheckCircleIcon className="w-8 h-8 text-blue-500" /></span>
              System Health Check
            </h2>
            <button onClick={fetchHealth} disabled={refreshing} className="px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold border border-blue-200 disabled:opacity-60 flex items-center gap-2 shadow">
              <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
          {/* Core Services Section */}
          <div>
            <div className="text-lg font-bold text-gray-800 mb-3">Core Services</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2 p-5 rounded-2xl border bg-white shadow-sm">
                {statusIcon(health?.api?.status)}
                <span className="font-semibold text-lg">API/Server</span>
                <span className={`text-base ${health?.api?.status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{health?.api?.status === 'ok' ? 'Healthy' : 'Error'}</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-5 rounded-2xl border bg-white shadow-sm">
                {statusIcon(health?.dynamodb?.status)}
                <span className="font-semibold text-lg">DynamoDB</span>
                <span className={`text-base ${health?.dynamodb?.status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{health?.dynamodb?.status === 'ok' ? 'Connected' : 'Error'}</span>
                {health?.dynamodb?.error && <span className="text-xs text-red-500 mt-1">{health.dynamodb.error}</span>}
              </div>
              <div className="flex flex-col items-center gap-2 p-5 rounded-2xl border bg-white shadow-sm">
                {statusIcon(health?.redis?.status)}
                <span className="font-semibold text-lg">Redis/Valkey</span>
                <span className={`text-base ${health?.redis?.status === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{health?.redis?.status === 'ok' ? 'Connected' : 'Error'}</span>
                {health?.redis?.error && <span className="text-xs text-red-500 mt-1">{health.redis.error}</span>}
              </div>
            </div>
          </div>
          {/* System Metrics Section */}
          <div>
            <div className="text-lg font-bold text-gray-800 mb-3">System Metrics</div>
            <div className="flex flex-row gap-12 justify-center">
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">Uptime</span>
                <span className="font-bold text-green-700 text-lg">{health ? formatUptime(health.uptime) : '--'}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">Memory Usage</span>
                <span className="font-bold text-pink-700 text-lg">{health ? `${health.memoryUsage.toFixed(2)}MB` : '--'}</span>
              </div>
            </div>
          </div>
          {/* Recent Errors Section (placeholder) */}
          <div>
            <div className="text-lg font-bold text-gray-800 mb-3">Recent Errors</div>
            <div className="text-gray-400 italic text-center">No recent errors.</div>
          </div>
        </div>
      </div>
    </div>
  );
} 