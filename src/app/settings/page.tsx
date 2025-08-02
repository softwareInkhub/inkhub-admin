'use client';
import React, { useEffect, useState } from 'react';
import SystemLoadStatus from '@/components/common/SystemLoadStatus';
import { fetchCacheStats } from '@/utils/cache';
import { Dialog } from '@headlessui/react';

const RESOURCES = [
  { key: 'orders', label: 'Shopify Orders', table: 'shopify-inkhub-get-orders', columns: [
    { header: 'Order #', accessor: 'order_number' },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Total', accessor: 'total_price' },
    { header: 'Status', accessor: 'financial_status' },
    { header: 'Created', accessor: 'created_at' },
  ] },
  { key: 'products', label: 'Shopify Products', table: 'shopify-inkhub-get-products', columns: [
    { header: 'ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
    { header: 'Vendor', accessor: 'vendor' },
    { header: 'Type', accessor: 'product_type' },
    { header: 'Status', accessor: 'status' },
    { header: 'Created', accessor: 'created_at' },
  ] },
  { key: 'pins', label: 'Pinterest Pins', table: 'pinterest_inkhub_get_pins', columns: [
    { header: 'ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
    { header: 'Board', accessor: 'board' },
    { header: 'Created', accessor: 'created_at' },
    { header: 'Link', accessor: 'link' },
  ] },
  { key: 'boards', label: 'Pinterest Boards', table: 'pinterest_inkhub_get_boards', columns: [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Owner', accessor: 'owner' },
    { header: 'Created', accessor: 'created_at' },
    { header: 'Pin Count', accessor: 'pin_count' },
  ] },
  { key: 'designs', label: 'Design Library Designs', table: 'admin-design-image', columns: [
    { header: 'UID', accessor: 'uid' },
    { header: 'Title', accessor: 'title' },
    { header: 'Type', accessor: 'designType' },
    { header: 'Status', accessor: 'designStatus' },
    { header: 'Created', accessor: 'createdAt' },
  ] },
];

export default function SettingsPage() {
  const [resourceData, setResourceData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalResource, setModalResource] = useState<{ key: string; label: string; table: string } | null>(null);

  // Fetch cache statistics for all resources
  useEffect(() => {
    let isMounted = true;
    async function fetchCacheData() {
      setLoading(true);
      try {
        const data: Record<string, any> = {};
        
        // Fetch cache stats for each resource
        for (const resource of RESOURCES) {
          try {
            const stats = await fetchCacheStats(resource.table);
            data[resource.key] = {
              status: 'Complete',
              progress: 100,
              items: [], // We don't need actual items for the dashboard
              totalKeys: stats.totalKeys || 0,
              cacheStats: stats
            };
          } catch (error) {
            console.error(`Error fetching cache stats for ${resource.key}:`, error);
            data[resource.key] = {
              status: 'Error',
              progress: 0,
              items: [],
              error: 'Failed to fetch cache stats'
            };
          }
        }
        
        if (isMounted) setResourceData(data);
      } catch (e) {
        console.error('Error fetching cache data:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchCacheData();
    return () => { isMounted = false; };
  }, []);

  // Prepare resource status data for SystemLoadStatus
  const resourceStatus = RESOURCES.map(resource => ({
    key: resource.key,
    label: resource.label,
    status: resourceData[resource.key]?.status || 'Waiting...',
    progress: resourceData[resource.key]?.progress || 0,
    dataCount: resourceData[resource.key]?.totalKeys || 0,
    error: resourceData[resource.key]?.error || null,
  }));

  // Handler to open modal for a resource
  const handleStart = (resourceKey: string) => {
    const resource = RESOURCES.find(r => r.key === resourceKey);
    if (resource) {
      setModalResource(resource);
      setModalOpen(true);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <SystemLoadStatus resources={resourceStatus} onStart={handleStart} />
      {/* Cache Table Modal */}
      {modalOpen && modalResource && (
        <CacheTableModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          resource={modalResource}
            />
      )}
    </div>
  );
} 

// Modal for cache table form
function CacheTableModal({ open, onClose, resource }: { open: boolean; onClose: () => void; resource: { key: string; label: string; table: string } }) {
  const [project, setProject] = useState('my-app');
  const [table, setTable] = useState(resource.table);
  const [recordsPerKey, setRecordsPerKey] = useState(2000);
  const [ttl, setTtl] = useState(86400);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5001/cache/table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, table, recordsPerKey, ttl }),
      });
      if (!res.ok) throw new Error('Failed to cache table');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-40" aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto z-50">
        <Dialog.Title className="text-lg font-bold mb-4">Cache Table: {resource.label}</Dialog.Title>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Project</label>
            <input className="w-full border rounded px-3 py-2" value={project} onChange={e => setProject(e.target.value)} required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Table</label>
            <input className="w-full border rounded px-3 py-2" value={table} onChange={e => setTable(e.target.value)} required />
          </div>
          <div>
            <label className="block font-semibold mb-1">Records Per Key</label>
            <input type="number" className="w-full border rounded px-3 py-2" value={recordsPerKey} onChange={e => setRecordsPerKey(Number(e.target.value))} min={1} required />
          </div>
          <div>
            <label className="block font-semibold mb-1">TTL (seconds)</label>
            <input type="number" className="w-full border rounded px-3 py-2" value={ttl} onChange={e => setTtl(Number(e.target.value))} min={1} required />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
          </div>
        </form>
      </div>
    </Dialog>
  );
} 