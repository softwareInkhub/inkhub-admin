'use client';
import React from 'react';
import ImageCell from '@/components/common/ImageCell';

export default function BoardCard({ board }: { board: any }) {
  // Helper function to check if a value is an image URL
  const isImageUrl = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const url = value.toLowerCase();
    return imageExtensions.some(ext => url.includes(ext)) || url.includes('cdn.shopify.com');
  };

  return (
    <div className="p-4 rounded-lg border bg-white shadow flex flex-col gap-3">
      {/* Board Cover Image */}
      {board.Item?.media?.image_cover_url && isImageUrl(board.Item.media.image_cover_url) && (
        <div className="flex justify-center mb-3">
          <ImageCell src={board.Item.media.image_cover_url} alt={board.Item?.name || 'Board Cover'} />
        </div>
      )}
      
      {/* Board Name */}
      <div className="font-bold text-lg text-gray-900 mb-2">
        {board.Item?.name || 'Untitled Board'}
      </div>
      
      {/* Board Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Board ID:</span>
          <span className="text-gray-800">{board.Item?.id}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Owner:</span>
          <span className="text-gray-800">{board.Item?.owner?.username || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Privacy:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            board.Item?.privacy === 'public' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {board.Item?.privacy || 'N/A'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Pins:</span>
          <span className="text-gray-800">{board.Item?.pin_count || 0}</span>
        </div>
        
        {board.Item?.description && (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-600 mb-1">Description:</span>
            <span className="text-gray-800 text-xs line-clamp-2">
              {board.Item.description}
            </span>
          </div>
        )}
        
        {board.Item?.url && (
          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">URL:</span>
            <a 
              href={board.Item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs truncate"
            >
              View Board
            </a>
          </div>
        )}
      </div>
      
      {/* Created Date */}
      <div className="text-xs text-gray-400 mt-2">
        Created: {board.Item?.created_at ? new Date(board.Item.created_at).toLocaleDateString() : 'N/A'}
      </div>
    </div>
  );
} 