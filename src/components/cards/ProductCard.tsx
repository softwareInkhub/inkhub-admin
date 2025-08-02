'use client';
import React from 'react';
import ImageCell from '@/components/common/ImageCell';

export default function ProductCard({ product }: { product: any }) {
  // Helper function to check if a value is an image URL
  const isImageUrl = (value: any): boolean => {
    if (typeof value !== 'string') return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const url = value.toLowerCase();
    return imageExtensions.some(ext => url.includes(ext)) || url.includes('cdn.shopify.com');
  };

  // Helper function to safely render cell values
  const renderCellValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      // Don't display JSON objects - just show a placeholder
      return '[Object]';
    }
    return String(value);
  };

  // Check for image in multiple possible locations based on actual API structure
  let imageSrc = null;
  
  // First, check if the image field is a JSON string that needs to be parsed
  if (product.image && typeof product.image === 'string') {
    try {
      const parsedImage = JSON.parse(product.image);
      imageSrc = parsedImage.src || parsedImage.url;
    } catch (e) {
      // If it's not valid JSON, treat it as a direct URL
      imageSrc = product.image;
    }
  } else if (product.image && typeof product.image === 'object') {
    imageSrc = product.image.src || product.image.url;
  } else if (product.images && Array.isArray(product.images) && product.images[0]) {
    if (typeof product.images[0] === 'string') {
      try {
        const parsedImage = JSON.parse(product.images[0]);
        imageSrc = parsedImage.src || parsedImage.url;
      } catch (e) {
        imageSrc = product.images[0];
      }
    } else if (typeof product.images[0] === 'object') {
      imageSrc = product.images[0].src || product.images[0].url;
    } else {
      imageSrc = product.images[0];
    }
  } else if (product.Item?.image && typeof product.Item.image === 'string') {
    try {
      const parsedImage = JSON.parse(product.Item.image);
      imageSrc = parsedImage.src || parsedImage.url;
    } catch (e) {
      imageSrc = product.Item.image;
    }
  } else if (product.Item?.image && typeof product.Item.image === 'object') {
    imageSrc = product.Item.image.src || product.Item.image.url;
  } else if (product.Item?.images && Array.isArray(product.Item.images) && product.Item.images[0]) {
    if (typeof product.Item.images[0] === 'string') {
      try {
        const parsedImage = JSON.parse(product.Item.images[0]);
        imageSrc = parsedImage.src || parsedImage.url;
      } catch (e) {
        imageSrc = product.Item.images[0];
      }
    } else if (typeof product.Item.images[0] === 'object') {
      imageSrc = product.Item.images[0].src || product.Item.images[0].url;
    } else {
      imageSrc = product.Item.images[0];
    }
  } else {
    // Fallback to direct properties
    imageSrc = product.image?.src || product.images?.[0]?.src || product.Item?.image?.src || product.Item?.images?.[0]?.src ||
              product.src || product.Item?.src || product.featured_image || product.Item?.featured_image;
  }

  return (
    <div className="p-4 rounded-lg border bg-white shadow flex flex-col gap-3">
      {/* Product Image */}
      {imageSrc && isImageUrl(imageSrc) && (
        <div className="flex justify-center mb-3">
          <ImageCell src={imageSrc} alt={product.title || 'Product Image'} />
        </div>
      )}
      
      {/* Product Title */}
      <div className="font-bold text-lg text-gray-900 mb-2">
        {product.title || 'Untitled Product'}
      </div>
      
      {/* Product Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Product ID:</span>
          <span className="text-gray-800">{product.id}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Vendor:</span>
          <span className="text-gray-800">{product.vendor || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Type:</span>
          <span className="text-gray-800">{product.product_type || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-semibold text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            product.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {product.status || 'N/A'}
          </span>
        </div>
        
        {product.tags && (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-600 mb-1">Tags:</span>
            <div className="flex flex-wrap gap-1">
              {product.tags.split(',').slice(0, 3).map((tag: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {tag.trim()}
                </span>
              ))}
              {product.tags.split(',').length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{product.tags.split(',').length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Created Date */}
      <div className="text-xs text-gray-400 mt-2">
        Created: {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
      </div>
    </div>
  );
} 