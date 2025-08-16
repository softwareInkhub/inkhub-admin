import { useEffect, useRef } from 'react'

export const useImagePreloader = (imageUrls: string[]) => {
  const preloadedImages = useRef<Set<string>>(new Set())

  useEffect(() => {
    const preloadImage = (url: string) => {
      if (preloadedImages.current.has(url)) return

      const img = new Image()
      img.onload = () => {
        preloadedImages.current.add(url)
      }
      img.onerror = () => {
        // Silently handle errors for preloading
        console.warn(`Failed to preload image: ${url}`)
      }
      img.src = url
    }

    // Preload images with a small delay to avoid blocking initial render
    const timeoutId = setTimeout(() => {
      imageUrls.forEach(preloadImage)
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [imageUrls])

  return preloadedImages.current
}
