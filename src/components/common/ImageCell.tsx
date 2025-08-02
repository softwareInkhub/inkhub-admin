import React, { useState } from 'react';
import Image from 'next/image';

interface ImageCellProps {
  src?: string;
  alt?: string;
  viewType?: 'table' | 'grid' | 'card' | 'list';
}

const ImageCell: React.FC<ImageCellProps> = ({ src, alt = '', viewType }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const size = viewType === 'table' ? 40 : viewType === 'grid' ? 120 : viewType === 'card' ? 120 : viewType === 'list' ? 60 : 40;
  const radius = viewType === 'table' ? 4 : 8;
  
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
    setIsLoading(false);
  };
  
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    setIsLoading(false);
  };

  // If no src, show placeholder
  if (!src) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 rounded"
        style={{ width: size, height: size }}
      >
        <span className="text-gray-400 text-xs">No Image</span>
      </div>
    );
  }

  // If image failed to load, show error placeholder
  if (imageError) {
    return (
      <div 
        className="flex items-center justify-center bg-red-50 border border-red-200 rounded"
        style={{ width: size, height: size }}
      >
        <span className="text-red-400 text-xs">Failed to load</span>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-center bg-gray-100 rounded overflow-hidden relative"
      style={{ width: size, height: size }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        style={{ 
          objectFit: 'cover', 
          borderRadius: radius 
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        unoptimized={true} // For external URLs like S3
        priority={viewType === 'card'} // Load card images with higher priority
      />
    </div>
  );
};

export default ImageCell; 