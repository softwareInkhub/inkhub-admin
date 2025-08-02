'use client';
import React from 'react';
import ImageCell from '@/components/common/ImageCell';

export default function DesignCard({ design }: { design: any }) {
  // Helper function to check if a value is an image URL
  const isImageUrl = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const url = value.toLowerCase();
    return imageExtensions.some(ext => url.includes(ext)) || 
           url.includes('s3.amazonaws.com') || 
           url.includes('cdn.shopify.com');
  };

  return (
    <div className="p-4 rounded-lg border bg-white shadow flex flex-col gap-3">
      {/* Design Image */}
      {design.designImageUrl && isImageUrl(design.designImageUrl) ? (
        <div className="flex justify-center mb-3">
          <ImageCell src={design.designImageUrl} alt={design.designName || 'Design Image'} />
        </div>
      ) : (
        <div className="flex justify-center mb-3">
          <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        </div>
      )}
      
      {/* Design Title */}
      <div className="font-bold text-lg text-gray-900 mb-2">
        {design.designName || 'Untitled Design'}
      </div>
      
      {/* Design Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Price:</span>
          <span className="text-gray-800">{design.designPrice ? `₹${design.designPrice}` : 'N/A'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Size:</span>
          <span className="text-gray-800">{design.designSize || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            design.designStatus === 'active' 
              ? 'bg-green-100 text-green-800' 
              : design.designStatus === 'draft'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {design.designStatus || 'N/A'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Type:</span>
          <span className="text-gray-800">{design.designType || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Order:</span>
          <span className="text-gray-800">{design.orderName || 'N/A'}</span>
        </div>
        
        {design.designTags && design.designTags.length > 0 && (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-600 mb-1">Tags:</span>
            <div className="flex flex-wrap gap-1">
              {design.designTags.slice(0, 3).map((tag: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {tag}
                </span>
              ))}
              {design.designTags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{design.designTags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Created Date */}
      <div className="text-xs text-gray-400 mt-2">
        Created: {design.designCreatedAt ? new Date(design.designCreatedAt).toLocaleDateString() : 'N/A'}
      </div>
    </div>
  );
} 