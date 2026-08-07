'use client';
import React from 'react';

export default function NewTabPage() {
  return (
    <div className="p-6 w-full h-[100vh] min-h-screen bg-white animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New Tab</h1>
          <p className="text-gray-600">Welcome to a new tab! Use the sidebar to navigate to different sections.</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to Get Started</h3>
          <p className="text-gray-500">Click on any item in the sidebar to open it in a new tab.</p>
        </div>
      </div>
    </div>
  );
} 