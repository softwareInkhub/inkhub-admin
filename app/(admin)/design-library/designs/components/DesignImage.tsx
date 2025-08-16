import { useState, useEffect, useRef } from 'react';
import { getOptimizedImageUrl } from '../utils';

interface DesignImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DesignImage = ({ src, alt, size = 'md', className = '' }: DesignImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-12',
    md: 'w-24 h-16',
    lg: 'w-full h-32'
  };

  const optimizedSrc = getOptimizedImageUrl(src, size === 'sm' ? 64 : size === 'md' ? 96 : 400, size === 'sm' ? 48 : size === 'md' ? 64 : 128);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  if (hasError) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 rounded flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-xs">Failed to load</span>
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 rounded animate-pulse flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {isInView && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          className={`w-full h-full object-cover rounded transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
};
