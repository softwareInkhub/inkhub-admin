'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PinterestBoardImageCardProps {
  board: any;
}

interface PinterestBoardModalProps {
  board: any;
  isOpen: boolean;
  onClose: () => void;
}

// Pinterest Board Modal Component
function PinterestBoardModal({ board, isOpen, onClose }: PinterestBoardModalProps) {
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
    return item.title || item.name || item.Item?.title || item.Item?.name || item.boardName || item.Item?.boardName || 'Untitled';
  };

  const getDescription = (item: any) => {
    return item.description || item.Item?.description || item.boardDescription || item.Item?.boardDescription || 'No description available';
  };

  const getOwner = (item: any) => {
    return item.owner || item.Item?.owner || item.username || item.Item?.username || '—';
  };

  const getPrivacy = (item: any) => {
    return item.privacy || item.Item?.privacy || '—';
  };

  const getPinCount = (item: any) => {
    return item.pin_count || item.Item?.pin_count || item.pins || item.Item?.pins || 0;
  };

  const getTags = (item: any) => {
    const tags = item.tags || item.Item?.tags || '';
    if (typeof tags === 'string') {
      return tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    }
    return Array.isArray(tags) ? tags : [];
  };

  const imageUrl = getImageUrl(board);
  const title = getTitle(board);
  const description = getDescription(board);
  const owner = getOwner(board);
  const privacy = getPrivacy(board);
  const pinCount = getPinCount(board);
  const tags = getTags(board);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Board Details</h2>
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
                {board.id && (
                  <div>
                    <span className="font-medium text-gray-700">Board ID:</span>
                    <span className="ml-2 text-gray-600">{board.id}</span>
                  </div>
                )}
                {owner && (
                  <div>
                    <span className="font-medium text-gray-700">Owner:</span>
                    <span className="ml-2 text-gray-600">{owner}</span>
                  </div>
                )}
                {privacy && (
                  <div>
                    <span className="font-medium text-gray-700">Privacy:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      privacy === 'PUBLIC' ? 'bg-green-100 text-green-800' :
                      privacy === 'PRIVATE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {privacy}
                    </span>
                  </div>
                )}
                {pinCount && (
                  <div>
                    <span className="font-medium text-gray-700">Pins:</span>
                    <span className="ml-2 text-gray-600">{pinCount}</span>
                  </div>
                )}
                {board.created_at && (
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(board.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {board.updated_at && (
                  <div>
                    <span className="font-medium text-gray-700">Updated:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(board.updated_at).toLocaleDateString()}
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
                        className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
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

export default function PinterestBoardImageCard({ board }: PinterestBoardImageCardProps) {
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

  const imageUrl = getImageUrl(board);
  const title = board.title || board.name || board.Item?.title || board.Item?.name || board.boardName || board.Item?.boardName || 'Board';

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

      {/* Pinterest Board Modal */}
      <PinterestBoardModal
        board={board}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
} 