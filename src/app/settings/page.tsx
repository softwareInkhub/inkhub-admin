'use client';
import React, { useEffect, useState } from 'react';
import DataView from '@/components/common/DataView';
import UniversalOperationBar from '@/components/common/UniversalOperationBar';
import SystemLoadStatus from '@/components/common/SystemLoadStatus';

const RESOURCES = [
  { key: 'orders', label: 'Shopify Orders', columns: [
    { header: 'Order #', accessor: 'order_number' },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Total', accessor: 'total_price' },
    { header: 'Status', accessor: 'financial_status' },
    { header: 'Created', accessor: 'created_at' },
  ] },
  { key: 'products', label: 'Shopify Products', columns: [
    { header: 'ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
    { header: 'Vendor', accessor: 'vendor' },
    { header: 'Type', accessor: 'product_type' },
    { header: 'Status', accessor: 'status' },
    { header: 'Created', accessor: 'created_at' },
  ] },
  { key: 'pins', label: 'Pinterest Pins', columns: [
    { header: 'ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
    { header: 'Board', accessor: 'board' },
    { header: 'Created', accessor: 'created_at' },
    { header: 'Link', accessor: 'link' },
  ] },
  { key: 'boards', label: 'Pinterest Boards', columns: [
    { header: 'ID', accessor: 'id' },
    { header: 'Name', accessor: 'name' },
    { header: 'Owner', accessor: 'owner' },
    { header: 'Created', accessor: 'created_at' },
    { header: 'Pin Count', accessor: 'pin_count' },
  ] },
  { key: 'designs', label: 'Design Library Designs', columns: [
    { header: 'UID', accessor: 'uid' },
    { header: 'Title', accessor: 'title' },
    { header: 'Type', accessor: 'designType' },
    { header: 'Status', accessor: 'designStatus' },
    { header: 'Created', accessor: 'createdAt' },
  ] },
];

export default function SettingsPage() {
  const [resourceData, setResourceData] = useState<Record<string, any>>({});
  const [showDataView, setShowDataView] = useState<Record<string, boolean>>({});
  const [selectedRowsData, setSelectedRowsData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);

  // Fetch all resources from the new system-load API
  useEffect(() => {
    let isMounted = true;
    async function fetchAll() {
      setLoading(true);
      try {
        const res = await fetch('/api/system-load/fetch-all');
        const data = await res.json();
        if (isMounted) setResourceData(data);
      } catch (e) {
        // Optionally handle global error
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchAll();
    // Optionally, add polling here if you want auto-refresh
    return () => { isMounted = false; };
  }, []);

  // Prepare resource status data for SystemLoadStatus
  const resourceStatus = RESOURCES.map(resource => ({
    key: resource.key,
    label: resource.label,
    status: resourceData[resource.key]?.status || 'Waiting...',
    progress: resourceData[resource.key]?.progress || 0,
    dataCount: resourceData[resource.key]?.items?.length || 0,
    error: resourceData[resource.key]?.error || null,
  }));

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <SystemLoadStatus resources={resourceStatus} />
      {/* DataViews for each resource */}
      {RESOURCES.map(resource => (
        showDataView[resource.key] && (
          <div key={resource.key + '-dataview'} className="mt-8 bg-white rounded shadow p-4">
            <DataView
              data={resourceData[resource.key]?.items || []}
              columns={resource.columns}
              onSelectionChange={rows => setSelectedRowsData(prev => ({ ...prev, [resource.key]: rows }))}
            />
            <UniversalOperationBar
              section={resource.key}
              tabKey={resource.label}
              analytics={{}}
              data={resourceData[resource.key]?.items || []}
              selectedData={selectedRowsData[resource.key] || []}
            />
          </div>
        )
      ))}
    </div>
  );
} 