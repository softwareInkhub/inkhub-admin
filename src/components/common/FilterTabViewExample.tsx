'use client';
import React, { useState } from 'react';
import FilterTabViewContainer from './FilterTabViewContainer';
import { User, ShoppingCart, Palette, Settings } from 'lucide-react';

export default function FilterTabViewExample() {
  const [activeTabId, setActiveTabId] = useState('all');
  const [viewType, setViewType] = useState<'table' | 'grid' | 'card' | 'list'>('table');

  // Sample filter tabs data
  const filterTabs = [
    {
      id: 'pratham',
      name: 'pratham',
      type: 'filter' as const,
      active: false,
      count: 25,
      icon: <User size={14} />
    },
    {
      id: 'yash',
      name: 'yash',
      type: 'filter' as const,
      active: false,
      count: 18,
      icon: <ShoppingCart size={14} />
    },
    {
      id: 'designs',
      name: 'Designs',
      type: 'category' as const,
      active: false,
      count: 42,
      icon: <Palette size={14} />
    },
    {
      id: 'settings',
      name: 'Settings',
      type: 'view' as const,
      active: false,
      count: 5,
      icon: <Settings size={14} />
    }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
    console.log('Active tab changed to:', tabId);
    
    if (tabId === 'all') {
      console.log('Showing ALL items');
    } else {
      const selectedTab = filterTabs.find(tab => tab.id === tabId);
      console.log('Showing items for:', selectedTab?.name);
    }
  };

  const handleViewTypeChange = (newViewType: 'table' | 'grid' | 'card' | 'list') => {
    setViewType(newViewType);
    console.log('View type changed to:', newViewType);
  };

  const handleFilterClick = () => {
    console.log('Filter button clicked');
  };

  const handleSettingsClick = () => {
    console.log('Settings button clicked');
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Filter Tab View Container Examples
      </h2>
      
      {/* Basic Example with ALL Button */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Basic Filter Tab Container with ALL Button
        </h3>
        <FilterTabViewContainer
          tabs={filterTabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChange}
          viewType={viewType}
          onViewTypeChange={handleViewTypeChange}
          onFilterClick={handleFilterClick}
          showAllButton={true}
          allButtonText="ALL"
        />
      </div>

      {/* Advanced Example with Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Advanced Filter Tab Container with Settings
        </h3>
        <FilterTabViewContainer
          tabs={filterTabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChange}
          viewType={viewType}
          onViewTypeChange={handleViewTypeChange}
          showViewButtons={true}
          showFilterButton={true}
          showSettingsButton={true}
          showAllButton={true}
          allButtonText="ALL ITEMS"
          onFilterClick={handleFilterClick}
          onSettingsClick={handleSettingsClick}
          className="border-2 border-blue-200"
        />
      </div>

      {/* Custom ALL Button Text */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Custom ALL Button Text
        </h3>
        <FilterTabViewContainer
          tabs={filterTabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChange}
          viewType={viewType}
          onViewTypeChange={handleViewTypeChange}
          showViewButtons={true}
          showFilterButton={true}
          showAllButton={true}
          allButtonText="SHOW ALL"
          onFilterClick={handleFilterClick}
        />
      </div>

      {/* Without ALL Button */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Without ALL Button
        </h3>
        <FilterTabViewContainer
          tabs={filterTabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChange}
          viewType={viewType}
          onViewTypeChange={handleViewTypeChange}
          showViewButtons={true}
          showFilterButton={true}
          showAllButton={false}
          onFilterClick={handleFilterClick}
        />
      </div>

      {/* View Buttons Only */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          View Buttons Only
        </h3>
        <FilterTabViewContainer
          tabs={[]}
          viewType={viewType}
          onViewTypeChange={handleViewTypeChange}
          showViewButtons={true}
          showFilterButton={false}
          showSettingsButton={false}
          showAllButton={false}
        />
      </div>

      {/* Status Display */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Current State:
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Active Tab: <span className="font-medium">{activeTabId}</span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          View Type: <span className="font-medium">{viewType}</span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total Items: <span className="font-medium">{filterTabs.reduce((sum, tab) => sum + (tab.count || 0), 0)}</span>
        </p>
      </div>
    </div>
  );
} 