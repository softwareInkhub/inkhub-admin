import React from 'react';

interface ImageCellProps {
  src?: string;
  alt?: string;
  viewType?: 'table' | 'grid' | 'card';
}

const ImageCell: React.FC<ImageCellProps> = ({ src, alt = '', viewType }) => {
  const size = viewType === 'table' ? 18 : viewType === 'grid' ? 64 : viewType === 'card' ? 64 : 10;
  const radius = viewType === 'table' ? 2 : 8;
  console.log('ImageCell render:', { viewType, size });
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{ width: size, height: size, objectFit: 'cover', borderRadius: radius }}
        />
      ) : (
        <span>No Image</span>
      )}
    </div>
  );
};

export default ImageCell; 