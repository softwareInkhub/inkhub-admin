'use client';
import React, { useEffect, useState } from 'react';
import DataView from '@/components/common/DataView';

const RESOURCES = [
  { key: 'orders', label: 'Shopify Orders', fetchAllApi: '/api/shopify/orders/fetch-all', columns: [
    { header: 'Order #', accessor: 'order_number' },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Total', accessor: 'total_price' },
    { header: 'Status', accessor: 'financial_status' },
    { header: 'Created', accessor: 'created_at' },
  ] },
  { key: 'products', label: 'Shopify Products', fetchAllApi: '/api/shopify/products/fetch-all', columns: [
    { header: 'ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
    { header: 'Vendor', accessor: 'vendor' },
    { header: 'Type', accessor: 'product_type' },
    { header: 'Status', accessor: 'status' },
    { header: 'Created', accessor: 'created_at' },
  ] },
  { key: 'pins', label: 'Pinterest Pins', fetchAllApi: '/api/pinterest/pins/fetch-all', columns: [
    { header: 'ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
    { header: 'Board', accessor: 'board' },
    { header: 'Created', accessor: 'created_at' },
    { header: 'Link', accessor: 'link' },
  ] },
  { key: 'boards', label: 'Pinterest Boards', fetchAllApi: '/api/pinterest/boards/fetch-all', columns: [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Owner', accessor: 'owner' },
    { header: 'Created', accessor: 'created_at' },
    { header: 'Pin Count', accessor: 'pin_count' },
  ] },
  { key: 'designs', label: 'Design Library Designs', fetchAllApi: '/api/design-library/designs/fetch-all', columns: [
    { header: 'UID', accessor: 'uid' },
    { header: 'Title', accessor: 'title' },
    { header: 'Type', accessor: 'designType' },
    { header: 'Status', accessor: 'designStatus' },
    { header: 'Created', accessor: 'createdAt' },
  ] },
];

export default function SettingsPage() {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<Record<string, string>>({});
  const [data, setData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [showDataView, setShowDataView] = useState<Record<string, boolean>>({});
  const [polling, setPolling] = useState<Record<string, boolean>>({});

  // Generalized polling logic for all resources
  useEffect(() => {
    const intervals: Record<string, NodeJS.Timeout> = {};
    RESOURCES.forEach(resource => {
      const fetchResource = async () => {
        setLoading(prev => ({ ...prev, [resource.key]: true }));
        setStatus(prev => ({ ...prev, [resource.key]: 'Fetching...' }));
        const res = await fetch(resource.fetchAllApi);
        const result = await res.json();
        setData(prev => ({ ...prev, [resource.key]: result.items || [] }));
        setProgress(prev => ({ ...prev, [resource.key]: result.progress || 0 }));
        setStatus(prev => ({ ...prev, [resource.key]: result.status === 'complete' ? 'Complete' : 'Fetching...' }));
        setLoading(prev => ({ ...prev, [resource.key]: result.status !== 'complete' }));
        if (result.status !== 'complete' && !polling[resource.key]) {
          setPolling(prev => ({ ...prev, [resource.key]: true }));
          intervals[resource.key] = setInterval(fetchResource, 2000);
        } else if (result.status === 'complete') {
          setPolling(prev => ({ ...prev, [resource.key]: false }));
          if (intervals[resource.key]) clearInterval(intervals[resource.key]);
        }
      };
      fetchResource();
    });
    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
      {RESOURCES.map((resource) => (
        <div key={resource.key} className="bg-white rounded shadow p-5 flex flex-col justify-between h-40 border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-lg">{resource.label}</span>
            <span className="text-sm text-gray-500">{status[resource.key] || 'Waiting...'}</span>
          </div>
          <div className="text-xs text-blue-600 mb-2">
            {status[resource.key] === 'complete'
              ? 'Loaded from cache'
              : status[resource.key] === 'Fetching...'
                ? 'Loading from DynamoDB...'
                : ''}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress[resource.key] || 0}%` }}
              ></div>
            </div>
            <div className="text-right text-xs text-gray-400 mt-1">
              {progress[resource.key] || 0}%
            </div>
            <button
              className="mt-4 px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
              onClick={() => setShowDataView((prev) => ({ ...prev, [resource.key]: true }))}
              disabled={loading[resource.key] || !data[resource.key] || data[resource.key]?.length === 0}
            >
              View Data
            </button>
          </div>
        </div>
      ))}
      {/* DataViews for each resource */}
      {RESOURCES.map(resource => (
        showDataView[resource.key] && (
          <div key={resource.key + '-dataview'} className="col-span-1 sm:col-span-2 bg-white rounded shadow p-4 mt-4">
            <DataView data={data[resource.key] || []} columns={resource.columns} />
          </div>
        )
      ))}
    </div>
  );
} 