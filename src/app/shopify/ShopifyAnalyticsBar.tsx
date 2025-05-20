import { useState, useEffect } from 'react';

interface ShopifyAnalyticsBarProps {
  openTabs: { key: string; name: string }[];
  activeTab: string;
  onOrdersAnalyticsChange?: (options: OrdersAnalyticsOptions) => void;
  onProductsAnalyticsChange?: (options: ProductsAnalyticsOptions) => void;
  onCollectionsAnalyticsChange?: (options: CollectionsAnalyticsOptions) => void;
}

export interface OrdersAnalyticsOptions {
  filter: string;
  groupBy: string;
  aggregate: string;
}
export interface ProductsAnalyticsOptions {
  filter: string;
  groupBy: string;
  aggregate: string;
}
export interface CollectionsAnalyticsOptions {
  filter: string;
  groupBy: string;
  aggregate: string;
}

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Partially Refunded', value: 'partially_refunded' },
  { label: 'Voided', value: 'voided' }
];
const groupByOptions = [
  { label: 'None', value: 'none' },
  { label: 'Status', value: 'financial_status' },
  { label: 'Customer', value: 'customer.email' },
  { label: 'Date', value: 'created_at' }
];
const aggregateOptions = [
  { label: 'Count', value: 'count' },
  { label: 'Sum Total', value: 'sum' },
  { label: 'Average Order Value', value: 'average' }
];

const productFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
];
const productGroupByOptions = [
  { label: 'None', value: 'none' },
  { label: 'Type', value: 'type' },
  { label: 'Vendor', value: 'vendor' },
];
const productAggregateOptions = [
  { label: 'Count', value: 'count' },
  { label: 'Sum Inventory', value: 'sum_inventory' },
];

const collectionFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Manual', value: 'manual' },
  { label: 'Automated', value: 'automated' },
];
const collectionGroupByOptions = [
  { label: 'None', value: 'none' },
  { label: 'Type', value: 'type' },
];
const collectionAggregateOptions = [
  { label: 'Count', value: 'count' },
];

export default function ShopifyAnalyticsBar({ openTabs, activeTab, onOrdersAnalyticsChange, onProductsAnalyticsChange, onCollectionsAnalyticsChange }: ShopifyAnalyticsBarProps) {
  // State for Orders tab analytics
  const [ordersOptions, setOrdersOptions] = useState<OrdersAnalyticsOptions>({
    filter: 'all',
    groupBy: 'none',
    aggregate: 'count',
  });
  // State for Products tab analytics
  const [productsOptions, setProductsOptions] = useState<ProductsAnalyticsOptions>({
    filter: 'all',
    groupBy: 'none',
    aggregate: 'count',
  });
  // State for Collections tab analytics
  const [collectionsOptions, setCollectionsOptions] = useState<CollectionsAnalyticsOptions>({
    filter: 'all',
    groupBy: 'none',
    aggregate: 'count',
  });

  useEffect(() => {
    if (activeTab === 'orders' && onOrdersAnalyticsChange) {
      onOrdersAnalyticsChange(ordersOptions);
    }
    if (activeTab === 'products' && onProductsAnalyticsChange) {
      onProductsAnalyticsChange(productsOptions);
    }
    if (activeTab === 'collections' && onCollectionsAnalyticsChange) {
      onCollectionsAnalyticsChange(collectionsOptions);
    }
  }, [ordersOptions, productsOptions, collectionsOptions, activeTab, onOrdersAnalyticsChange, onProductsAnalyticsChange, onCollectionsAnalyticsChange]);

  return (
    <div className="bg-gray-50 border-b px-4 py-3 flex space-x-6 items-center min-h-[56px]">
      {activeTab === 'orders' && (
        <div className="flex flex-col font-bold text-primary-700">
          <span>Orders Analytics</span>
          <div className="flex space-x-2 mt-1">
            <select
              className="input"
              value={ordersOptions.filter}
              onChange={e => setOrdersOptions(o => ({ ...o, filter: e.target.value }))}
            >
              {filterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select
              className="input"
              value={ordersOptions.groupBy}
              onChange={e => setOrdersOptions(o => ({ ...o, groupBy: e.target.value }))}
            >
              {groupByOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select
              className="input"
              value={ordersOptions.aggregate}
              onChange={e => setOrdersOptions(o => ({ ...o, aggregate: e.target.value }))}
            >
              {aggregateOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      )}
      {activeTab === 'products' && (
        <div className="flex flex-col font-bold text-primary-700">
          <span>Products Analytics</span>
          <div className="flex space-x-2 mt-1">
            <select
              className="input"
              value={productsOptions.filter}
              onChange={e => setProductsOptions(o => ({ ...o, filter: e.target.value }))}
            >
              {productFilterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select
              className="input"
              value={productsOptions.groupBy}
              onChange={e => setProductsOptions(o => ({ ...o, groupBy: e.target.value }))}
            >
              {productGroupByOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select
              className="input"
              value={productsOptions.aggregate}
              onChange={e => setProductsOptions(o => ({ ...o, aggregate: e.target.value }))}
            >
              {productAggregateOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      )}
      {activeTab === 'collections' && (
        <div className="flex flex-col font-bold text-primary-700">
          <span>Collections Analytics</span>
          <div className="flex space-x-2 mt-1">
            <select
              className="input"
              value={collectionsOptions.filter}
              onChange={e => setCollectionsOptions(o => ({ ...o, filter: e.target.value }))}
            >
              {collectionFilterOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select
              className="input"
              value={collectionsOptions.groupBy}
              onChange={e => setCollectionsOptions(o => ({ ...o, groupBy: e.target.value }))}
            >
              {collectionGroupByOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select
              className="input"
              value={collectionsOptions.aggregate}
              onChange={e => setCollectionsOptions(o => ({ ...o, aggregate: e.target.value }))}
            >
              {collectionAggregateOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
      )}
      {/* Placeholder for future: filters, grouping, aggregation, etc. */}
      <div className="ml-auto flex space-x-2">
        <button className="btn btn-secondary">Filter</button>
        <button className="btn btn-secondary">Group</button>
        <button className="btn btn-secondary">Aggregate</button>
      </div>
    </div>
  );
} 