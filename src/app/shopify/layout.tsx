"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ShopifyAnalyticsBar, { OrdersAnalyticsOptions, ProductsAnalyticsOptions } from "./ShopifyAnalyticsBar";
import ShopifyOperationBar from "./ShopifyOperationBar";
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchOrders, fetchProducts } from '@/store/slices/shopifySlice';

interface Tab {
  name: string;
  key: string;
  path: string;
}

const SHOPIFY_TABS = [
  { name: "Orders", key: "orders", path: "/shopify/orders" },
  { name: "Products", key: "products", path: "/shopify/products" },
];

export default function ShopifyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [ordersAnalytics, setOrdersAnalytics] = useState<OrdersAnalyticsOptions>({
    filter: 'all',
    groupBy: 'none',
    aggregate: 'count',
  });
  const [productsAnalytics, setProductsAnalytics] = useState<ProductsAnalyticsOptions>({
    filter: 'all',
    groupBy: 'none',
    aggregate: 'count',
  });

  const dispatch = useDispatch<AppDispatch>();
  const { orders, products } = useSelector((state: RootState) => state.shopify);
  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchProducts());
  }, [dispatch]);

  // Open/focus tab when route changes
  useEffect(() => {
    const found = SHOPIFY_TABS.find((tab) => pathname.startsWith(tab.path));
    if (found) {
      setTabs((prev) => {
        if (prev.find((t) => t.key === found.key)) return prev;
        return [...prev, found];
      });
      setActiveTab(found.key);
    }
  }, [pathname]);

  // Handle tab click
  const handleTabClick = (key: string, path: string) => {
    setActiveTab(key);
    router.push(path);
  };

  // Handle tab close
  const handleTabClose = (key: string) => {
    setTabs((prev) => prev.filter((t) => t.key !== key));
    if (activeTab === key) {
      // If closing the active tab, switch to the last tab or default
      const remaining = tabs.filter((t) => t.key !== key);
      if (remaining.length > 0) {
        setActiveTab(remaining[remaining.length - 1].key);
        router.push(remaining[remaining.length - 1].path);
      } else {
        setActiveTab("");
        router.push("/shopify");
      }
    }
  };

  // Define columns for each tab
  const ordersColumns = [
    { header: 'Order ID', accessor: 'id' },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Total', accessor: 'total_price' },
    { header: 'Status', accessor: 'financial_status' },
    { header: 'Created At', accessor: 'created_at' },
  ];
  const productsColumns = [
    { header: 'Product ID', accessor: 'id' },
    { header: 'Title', accessor: 'title' },
    { header: 'Type', accessor: 'type' },
    { header: 'Vendor', accessor: 'vendor' },
    { header: 'Status', accessor: 'status' },
    { header: 'Inventory', accessor: 'inventory' },
  ];
  // Select data/columns/analytics for the active tab
  let data = [];
  let columns = [];
  let analytics = {};
  if (activeTab === 'orders') {
    data = orders;
    columns = ordersColumns;
    analytics = ordersAnalytics;
  } else if (activeTab === 'products') {
    data = products;
    columns = productsColumns;
    analytics = productsAnalytics;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Bar */}
      <div className="flex-none flex space-x-2 border-b bg-white px-4 pt-4">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`flex items-center px-4 py-2 rounded-t-md border-t border-l border-r border-b-0 cursor-pointer mr-2 bg-gray-50 ${
              activeTab === tab.key ? "border-primary-600 bg-white" : "border-gray-200"
            }`}
            style={{ marginBottom: "-1px" }}
            onClick={() => handleTabClick(tab.key, tab.path)}
          >
            <span className="mr-2">{tab.name}</span>
            <button
              className="ml-1 text-gray-400 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                handleTabClose(tab.key);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {/* Analytics Bar */}
      <div className="flex-none">
        <ShopifyAnalyticsBar
          openTabs={tabs}
          activeTab={activeTab}
          onOrdersAnalyticsChange={setOrdersAnalytics}
          onProductsAnalyticsChange={setProductsAnalytics}
        />
        <ShopifyOperationBar
          activeTab={activeTab}
          analytics={analytics}
        />
      </div>
      {/* Tab Content */}
      <div className="flex-1 min-h-0 p-4">
        {activeTab === 'orders'
          ? React.cloneElement(children as any, { analytics: ordersAnalytics })
          : activeTab === 'products'
          ? React.cloneElement(children as any, { analytics: productsAnalytics })
          : children}
      </div>
    </div>
  );
} 