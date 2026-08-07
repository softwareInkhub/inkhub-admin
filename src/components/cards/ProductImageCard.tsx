'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ProductImageCardProps {
  product: any;
}

interface ProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

// Product Modal Component
function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  if (!isOpen) return null;

  const getImageUrl = (item: any) => {
    // Handle different image field names
    if (item.image) {
      // Check if the image field is a JSON string that needs to be parsed
      if (typeof item.image === 'string') {
        try {
          const parsedImage = JSON.parse(item.image);
          return parsedImage.src || parsedImage.url;
        } catch (e) {
          // If it's not valid JSON, treat it as a direct URL
          return item.image;
        }
      } else if (typeof item.image === 'object') {
        return item.image.src || item.image.url;
      }
    }
    
    if (item.images && Array.isArray(item.images) && item.images[0]) {
      if (typeof item.images[0] === 'string') {
        try {
          const parsedImage = JSON.parse(item.images[0]);
          return parsedImage.src || parsedImage.url;
        } catch (e) {
          return item.images[0];
        }
      } else if (typeof item.images[0] === 'object') {
        return item.images[0].src || item.images[0].url;
      } else {
        return item.images[0];
      }
    }
    
    if (item.Item?.media?.images?.['600x']?.url) return item.Item.media.images['600x'].url;
    if (item.Item?.media?.image_cover_url) return item.Item.media.image_cover_url;
    if (item.designImageUrl) return item.designImageUrl;
    if (item.Item?.image) {
      if (typeof item.Item.image === 'string') {
        try {
          const parsedImage = JSON.parse(item.Item.image);
          return parsedImage.src || parsedImage.url;
        } catch (e) {
          return item.Item.image;
        }
      } else if (typeof item.Item.image === 'object') {
        return item.Item.image.src || item.Item.image.url;
      }
    }
    if (item.Item?.images && Array.isArray(item.Item.images) && item.Item.images[0]) {
      if (typeof item.Item.images[0] === 'string') {
        try {
          const parsedImage = JSON.parse(item.Item.images[0]);
          return parsedImage.src || parsedImage.url;
        } catch (e) {
          return item.Item.images[0];
        }
      } else if (typeof item.Item.images[0] === 'object') {
        return item.Item.images[0].src || item.Item.images[0].url;
      } else {
        return item.Item.images[0];
      }
    }
    
    // Fallback to direct properties
    return item.image?.src || item.images?.[0]?.src || item.Item?.image?.src || item.Item?.images?.[0]?.src ||
           item.src || item.Item?.src || item.featured_image || item.Item?.featured_image;
  };

  const getTitle = (item: any) => {
    return item.title || item.name || item.Item?.title || item.Item?.name || item.designName || item.product_title || item.Item?.product_title || 'Untitled';
  };

  const getDescription = (item: any) => {
    return item.description || item.Item?.description || item.designDescription || item.body_html || item.Item?.body_html || item.product_description || item.Item?.product_description || 'No description available';
  };

  const getVendor = (item: any) => {
    return item.vendor || item.Item?.vendor || item.seller || item.Item?.seller || '—';
  };

  const getProductType = (item: any) => {
    return item.product_type || item.Item?.product_type || item.type || item.Item?.type || '—';
  };

  const getTags = (item: any) => {
    const tags = item.tags || item.Item?.tags || '';
    if (typeof tags === 'string') {
      return tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    }
    return Array.isArray(tags) ? tags : [];
  };

  const imageUrl = getImageUrl(product);
  const title = getTitle(product);
  const description = getDescription(product);
  const vendor = getVendor(product);
  const productType = getProductType(product);
  const tags = getTags(product);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Image Section */}
            <div className="space-y-4">
              {imageUrl ? (
                <div className="flex justify-center">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
                  <span className="text-gray-400">No Image Available</span>
                </div>
              )}
            </div>
            
            {/* Details Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.id && (
                  <div>
                    <span className="font-medium text-gray-700">Product ID:</span>
                    <span className="ml-2 text-gray-600">{product.id}</span>
                  </div>
                )}
                {vendor && (
                  <div>
                    <span className="font-medium text-gray-700">Vendor:</span>
                    <span className="ml-2 text-gray-600">{vendor}</span>
                  </div>
                )}
                {productType && (
                  <div>
                    <span className="font-medium text-gray-700">Product Type:</span>
                    <span className="ml-2 text-gray-600">{productType}</span>
                  </div>
                )}
                {product.status && (
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      product.status === 'active' ? 'bg-green-100 text-green-800' :
                      product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                )}
                {product.created_at && (
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {product.updated_at && (
                  <div>
                    <span className="font-medium text-gray-700">Updated:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(product.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              {tags.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductImageCard({ product }: ProductImageCardProps) {
  const [showModal, setShowModal] = useState(false);

  const getImageUrl = (item: any) => {
    // Handle different image field names
    if (item.image) {
      // Check if the image field is a JSON string that needs to be parsed
      if (typeof item.image === 'string') {
        try {
          const parsedImage = JSON.parse(item.image);
          return parsedImage.src || parsedImage.url;
        } catch (e) {
          // If it's not valid JSON, treat it as a direct URL
          return item.image;
        }
      } else if (typeof item.image === 'object') {
        return item.image.src || item.image.url;
      }
    }
    
    if (item.images && Array.isArray(item.images) && item.images[0]) {
      if (typeof item.images[0] === 'string') {
        try {
          const parsedImage = JSON.parse(item.images[0]);
          return parsedImage.src || parsedImage.url;
        } catch (e) {
          return item.images[0];
        }
      } else if (typeof item.images[0] === 'object') {
        return item.images[0].src || item.images[0].url;
      } else {
        return item.images[0];
      }
    }
    
    if (item.Item?.media?.images?.['600x']?.url) return item.Item.media.images['600x'].url;
    if (item.Item?.media?.image_cover_url) return item.Item.media.image_cover_url;
    if (item.designImageUrl) return item.designImageUrl;
    if (item.Item?.image) {
      if (typeof item.Item.image === 'string') {
        try {
          const parsedImage = JSON.parse(item.Item.image);
          return parsedImage.src || parsedImage.url;
        } catch (e) {
          return item.Item.image;
        }
      } else if (typeof item.Item.image === 'object') {
        return item.Item.image.src || item.Item.image.url;
      }
    }
    if (item.Item?.images && Array.isArray(item.Item.images) && item.Item.images[0]) {
      if (typeof item.Item.images[0] === 'string') {
        try {
          const parsedImage = JSON.parse(item.Item.images[0]);
          return parsedImage.src || parsedImage.url;
        } catch (e) {
          return item.Item.images[0];
        }
      } else if (typeof item.Item.images[0] === 'object') {
        return item.Item.images[0].src || item.Item.images[0].url;
      } else {
        return item.Item.images[0];
      }
    }
    
    // Fallback to direct properties
    return item.image?.src || item.images?.[0]?.src || item.Item?.image?.src || item.Item?.images?.[0]?.src ||
           item.src || item.Item?.src || item.featured_image || item.Item?.featured_image;
  };

  const imageUrl = getImageUrl(product);
  const title = product.title || product.name || product.Item?.title || product.Item?.name || 'Product';

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
        onClick={() => setShowModal(true)}
      >
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={product}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
} 