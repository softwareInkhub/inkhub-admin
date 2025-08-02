'use client';
import React from 'react';
import FilterTabViewExample from '@/components/common/FilterTabViewExample';

export default function FilterTabDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Filter Tab View Container Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            A separate container component for filter tab view buttons with modern styling and functionality.
          </p>
        </div>
        
        <FilterTabViewExample />
      </div>
    </div>
  );
} 