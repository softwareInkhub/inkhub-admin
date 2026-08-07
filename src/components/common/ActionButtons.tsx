'use client';
import React, { useState } from 'react';
import { Eye, Edit, Trash2, X } from 'lucide-react';

interface ActionButtonsProps {
  item: any;
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  className?: string;
}

interface ViewModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
}

interface EditModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedItem: any) => void;
}

// View Modal Component
function ViewModal({ item, isOpen, onClose }: ViewModalProps) {
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

  const imageUrl = getImageUrl(item);
  const title = getTitle(item);
  const description = getDescription(item);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">View Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="space-y-4">
            {imageUrl && (
              <div className="flex justify-center">
                <img
                  src={imageUrl}
                  alt={title}
                  className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                />
              </div>
            )}
            
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              </div>
              
              <div>
                <p className="text-gray-600">{description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {item.id && (
                  <div>
                    <span className="font-medium text-gray-700">ID:</span>
                    <span className="ml-2 text-gray-600">{item.id}</span>
                  </div>
                )}
                {item.created_at && (
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {item.updated_at && (
                  <div>
                    <span className="font-medium text-gray-700">Updated:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {item.status && (
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="ml-2 text-gray-600">{item.status}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Modal Component
function EditModal({ item, isOpen, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState({
    title: item.title || item.name || item.Item?.title || item.Item?.name || item.designName || '',
    description: item.description || item.Item?.description || item.designDescription || '',
    status: item.status || item.Item?.status || 'active',
    price: item.price || item.designPrice || '',
    tags: item.tags || item.designTags || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedItem = {
      ...item,
      ...formData
    };
    onSave(updatedItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Edit Item</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            
            {formData.price && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                />
              </div>
            )}
            
            {formData.tags && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Comma separated tags"
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ActionButtons({
  item,
  onView,
  onEdit,
  onDelete,
  showView = true,
  showEdit = true,
  showDelete = true,
  className = ''
}: ActionButtonsProps) {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleView = () => {
    setShowViewModal(true);
    onView?.(item);
  };

  const handleEdit = () => {
    setShowEditModal(true);
    onEdit?.(item);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      onDelete?.(item);
    }
  };

  const handleSaveEdit = (updatedItem: any) => {
    // Here you would typically make an API call to update the item
    console.log('Saving updated item:', updatedItem);
    // For now, we'll just show a success message
    alert('Item updated successfully!');
  };

  return (
    <>
      <div className={`flex items-center space-x-2 ${className}`}>
        {showView && (
          <button
            onClick={handleView}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="View details"
          >
            <Eye size={16} />
          </button>
        )}
        
        {showEdit && (
          <button
            onClick={handleEdit}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="Edit item"
          >
            <Edit size={16} />
          </button>
        )}
        
        {showDelete && (
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete item"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* View Modal */}
      <ViewModal
        item={item}
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
      />

      {/* Edit Modal */}
      <EditModal
        item={item}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
      />
    </>
  );
} 