#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Performance Optimization Setup...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Install required dependencies
console.log('📦 Installing performance dependencies...');
try {
  execSync('npm install react-window @next/bundle-analyzer', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create performance monitoring script
const performanceScript = `
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
`;

// Create .env.local with performance settings
const envContent = `
# Performance Optimization Settings
NEXT_PUBLIC_PERFORMANCE_MODE=true
NEXT_PUBLIC_CACHE_ENABLED=true
NEXT_PUBLIC_COMPRESSION_ENABLED=true

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# DynamoDB Configuration
AWS_REGION=us-east-1
SHOPIFY_ORDERS_TABLE=your_orders_table
SHOPIFY_PRODUCTS_TABLE=your_products_table
DESIGN_TABLE=your_design_table
`;

// Create optimization checklist
const checklistContent = `
# Performance Optimization Checklist

## Frontend Optimizations
- [ ] VirtualizedDataView component implemented
- [ ] Performance utilities imported and used
- [ ] Debouncing applied to search inputs
- [ ] Memory cache implemented for expensive operations
- [ ] Component memoization applied

## Backend Optimizations
- [ ] Optimized API routes implemented
- [ ] Redis caching configured
- [ ] Data compression enabled
- [ ] Batch processing implemented
- [ ] Performance monitoring active

## Network Optimizations
- [ ] Next.js compression enabled
- [ ] Caching headers configured
- [ ] Image optimization enabled
- [ ] Bundle analysis completed
- [ ] Middleware optimizations applied

## Testing
- [ ] Performance metrics collected
- [ ] Memory usage monitored
- [ ] Load times measured
- [ ] Cache hit rates verified
- [ ] User experience tested

## Deployment
- [ ] Environment variables configured
- [ ] Redis instance deployed
- [ ] Monitoring tools set up
- [ ] Performance alerts configured
- [ ] Documentation updated
`;

// Write files
try {
  // Create scripts directory if it doesn't exist
  if (!fs.existsSync('scripts')) {
    fs.mkdirSync('scripts');
  }

  // Write performance script
  fs.writeFileSync('scripts/performance-monitor.js', performanceScript);
  console.log('✅ Performance monitoring script created');

  // Write environment file
  if (!fs.existsSync('.env.local')) {
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Environment file created');
  } else {
    console.log('⚠️  .env.local already exists - please add performance settings manually');
  }

  // Write checklist
  fs.writeFileSync('PERFORMANCE_CHECKLIST.md', checklistContent);
  console.log('✅ Performance checklist created');

} catch (error) {
  console.error('❌ Error creating files:', error.message);
}

// Update package.json scripts
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (!packageJson.scripts.analyze) {
    packageJson.scripts.analyze = 'ANALYZE=true npm run build';
  }
  
  if (!packageJson.scripts.performance) {
    packageJson.scripts.performance = 'npm run build && npm run start';
  }
  
  if (!packageJson.scripts.monitor) {
    packageJson.scripts.monitor = 'node scripts/performance-monitor.js';
  }
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Package.json scripts updated');
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
}

console.log('\n🎉 Performance optimization setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Review PERFORMANCE_CHECKLIST.md');
console.log('2. Update your components to use VirtualizedDataView');
console.log('3. Implement performance utilities in your code');
console.log('4. Configure Redis/Valkey for caching');
console.log('5. Test performance improvements');
console.log('\n📚 For detailed instructions, see PERFORMANCE_OPTIMIZATION.md');

// Check for common issues
console.log('\n🔍 Checking for common issues...');

const issues = [];

// Check if Redis is running
try {
  execSync('redis-cli ping', { stdio: 'ignore' });
  console.log('✅ Redis is running');
} catch (error) {
  issues.push('Redis is not running - start with: docker-compose up valkey');
}

// Check bundle size
try {
  const stats = fs.statSync('package.json');
  const packageSize = stats.size;
  if (packageSize > 10000) {
    issues.push('Large package.json detected - consider removing unused dependencies');
  }
} catch (error) {
  issues.push('Could not check package.json size');
}

if (issues.length > 0) {
  console.log('\n⚠️  Issues found:');
  issues.forEach(issue => console.log(`  - ${issue}`));
} else {
  console.log('✅ No issues detected');
}

console.log('\n🚀 Ready to optimize! Run "npm run analyze" to check bundle size.'); 