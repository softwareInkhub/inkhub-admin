'use client';
import React from 'react';
import ImageCell from '@/components/common/ImageCell';

export default function PinCard({ pin }: { pin: any }) {
  // Helper function to check if a value is an image URL
  const isImageUrl = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const url = value.toLowerCase();
    return imageExtensions.some(ext => url.includes(ext)) || url.includes('cdn.shopify.com');
  };

  return (
    <div className="p-4 rounded-lg border bg-white shadow flex flex-col gap-3">
      {/* Pin Image */}
      {pin.Item?.media?.image_original_url && isImageUrl(pin.Item.media.image_original_url) && (
        <div className="flex justify-center mb-3">
          <ImageCell src={pin.Item.media.image_original_url} alt={pin.Item?.title || 'Pin Image'} />
        </div>
      )}
      
      {/* Pin Title */}
      <div className="font-bold text-lg text-gray-900 mb-2">
        {pin.Item?.title || 'Untitled Pin'}
      </div>
      
      {/* Pin Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Pin ID:</span>
          <span className="text-gray-800">{pin.Item?.id}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Board:</span>
          <span className="text-gray-800">{pin.Item?.board?.name || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Owner:</span>
          <span className="text-gray-800">{pin.Item?.owner?.username || 'N/A'}</span>
        </div>
        
        {pin.Item?.description && (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-600 mb-1">Description:</span>
            <span className="text-gray-800 text-xs line-clamp-2">
              {pin.Item.description}
            </span>
          </div>
        )}
        
        {pin.Item?.link && (
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Link:</span>
            <a 
              href={pin.Item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs truncate"
            >
              View Link
            </a>
          </div>
        )}
      </div>
      
      {/* Created Date */}
      <div className="text-xs text-gray-400 mt-2">
        Created: {pin.Item?.created_at ? new Date(pin.Item.created_at).toLocaleDateString() : 'N/A'}
      </div>
    </div>
  );
} 