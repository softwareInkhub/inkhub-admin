import { useEffect, useRef } from 'react';

export const useImagePreloader = (imageUrls: string[], maxConcurrent: number = 3) => {
  const preloadedImages = useRef<Set<string>>(new Set());
  const loadingImages = useRef<Set<string>>(new Set());

  useEffect(() => {
    const preloadImage = (url: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (preloadedImages.current.has(url)) {
          resolve();
          return;
        }

        if (loadingImages.current.has(url)) {
          resolve();
          return;
        }

        loadingImages.current.add(url);

        const img = new Image();
        img.onload = () => {
          preloadedImages.current.add(url);
          loadingImages.current.delete(url);
          resolve();
        };
        img.onerror = () => {
          loadingImages.current.delete(url);
          reject(new Error(`Failed to preload image: ${url}`));
        };
        img.src = url;
      });
    };

    const preloadImages = async () => {
      const urlsToPreload = imageUrls.filter(url => 
        !preloadedImages.current.has(url) && !loadingImages.current.has(url)
      );

      // Preload images in batches to avoid overwhelming the browser
      for (let i = 0; i < urlsToPreload.length; i += maxConcurrent) {
        const batch = urlsToPreload.slice(i, i + maxConcurrent);
        await Promise.allSettled(batch.map(url => preloadImage(url)));
      }
    };

    preloadImages();
  }, [imageUrls, maxConcurrent]);

  return {
    isPreloaded: (url: string) => preloadedImages.current.has(url),
    isPreloading: (url: string) => loadingImages.current.has(url),
  };
};
