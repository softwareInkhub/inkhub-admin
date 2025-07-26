// Performance utilities for optimizing the application

// Debounce function to limit function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function to limit function execution rate
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memory cache for expensive operations
class MemoryCache {
  private cache = new Map<string, { value: any; timestamp: number; ttl: number }>();

  set(key: string, value: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, { value, timestamp: Date.now(), ttl });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const memoryCache = new MemoryCache();

// Batch processing utility
export function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  return new Promise((resolve, reject) => {
    const results: R[] = [];
    let currentIndex = 0;

    function processBatch() {
      const batch = items.slice(currentIndex, currentIndex + batchSize);
      if (batch.length === 0) {
        resolve(results);
        return;
      }

      Promise.all(batch.map(processor))
        .then((batchResults) => {
          results.push(...batchResults);
          currentIndex += batchSize;
          // Use setTimeout to prevent blocking the main thread
          setTimeout(processBatch, 0);
        })
        .catch(reject);
    }

    processBatch();
  });
}

// Lazy loading utility
export function createLazyLoader<T>(
  loader: () => Promise<T[]>,
  pageSize: number = 50
) {
  let allData: T[] = [];
  let loadedPages = 0;
  let isLoading = false;
  let isFullyLoaded = false;

  return {
    async loadNextPage(): Promise<T[]> {
      if (isLoading || isFullyLoaded) return [];

      isLoading = true;
      try {
        if (allData.length === 0) {
          allData = await loader();
        }

        const startIndex = loadedPages * pageSize;
        const endIndex = startIndex + pageSize;
        const pageData = allData.slice(startIndex, endIndex);

        loadedPages++;
        isFullyLoaded = endIndex >= allData.length;

        return pageData;
      } finally {
        isLoading = false;
      }
    },

    reset() {
      allData = [];
      loadedPages = 0;
      isLoading = false;
      isFullyLoaded = false;
    },

    get isFullyLoaded() {
      return isFullyLoaded;
    },

    get isLoading() {
      return isLoading;
    },
  };
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
    ...options,
  });
}

// Request animation frame wrapper for smooth scrolling
export function smoothScrollTo(element: HTMLElement, target: number, duration: number = 300): Promise<void> {
  return new Promise((resolve) => {
    const start = element.scrollTop;
    const distance = target - start;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      element.scrollTop = start + distance * easeOut;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTimer(name: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      this.metrics.get(name)!.push(duration);
    };
  }

  getAverageTime(name: string): number {
    const times = this.metrics.get(name);
    if (!times || times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getMetrics(): Record<string, { average: number; count: number; min: number; max: number }> {
    const result: Record<string, { average: number; count: number; min: number; max: number }> = {};
    
    for (const [name, times] of this.metrics) {
      result[name] = {
        average: this.getAverageTime(name),
        count: times.length,
        min: Math.min(...times),
        max: Math.max(...times),
      };
    }
    
    return result;
  }

  clear(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Web Worker utility for heavy computations
export function createWorker(workerFunction: Function): Worker {
  const blob = new Blob([`
    self.onmessage = function(e) {
      const result = (${workerFunction.toString()})(e.data);
      self.postMessage(result);
    };
  `], { type: 'application/javascript' });
  
  return new Worker(URL.createObjectURL(blob));
}

// Optimized array operations
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

// Optimized object operations
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

// Optimized string operations
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

// Optimized number operations
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Optimized date operations
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return d.toLocaleTimeString();
  } else if (diffInHours < 168) { // 7 days
    return d.toLocaleDateString();
  } else {
    return d.toLocaleDateString();
  }
} 