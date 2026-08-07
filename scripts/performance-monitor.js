
// Performance monitoring script
const performanceMonitor = {
  metrics: new Map(),
  
  startTimer(name) {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      this.metrics.get(name).push(duration);
      return duration;
    };
  },
  
  getMetrics() {
    const result = {};
    for (const [name, times] of this.metrics) {
      result[name] = {
        average: times.reduce((sum, time) => sum + time, 0) / times.length,
        count: times.length,
        min: Math.min(...times),
        max: Math.max(...times),
      };
    }
    return result;
  }
};

// Log performance metrics on page unload
window.addEventListener('beforeunload', () => {
  const metrics = performanceMonitor.getMetrics();
  console.log('Performance Metrics:', metrics);
});
