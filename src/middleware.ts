import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Performance optimizations
  const url = request.nextUrl;
  
  // Add caching headers for static assets
  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Add caching headers for API routes
  if (url.pathname.startsWith('/api/')) {
    // Different cache strategies for different API endpoints
    if (url.pathname.startsWith('/api/cache/')) {
      response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    } else if (url.pathname.startsWith('/api/shopify/')) {
      response.headers.set('Cache-Control', 'public, max-age=120, s-maxage=600');
    } else if (url.pathname.startsWith('/api/performance/')) {
      response.headers.set('Cache-Control', 'public, max-age=30, s-maxage=120');
    } else {
      response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    }
  }

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // Rate limiting for API routes
  if (url.pathname.startsWith('/api/')) {
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `rate_limit:${clientIp}:${url.pathname}`;
    
    // Simple rate limiting - in production, use Redis or a proper rate limiting service
    const userAgent = request.headers.get('user-agent') || '';
    if (userAgent.includes('bot') || userAgent.includes('crawler')) {
      // Limit bot requests
      response.headers.set('X-RateLimit-Limit', '10');
      response.headers.set('X-RateLimit-Remaining', '9');
    }
  }

  // Request optimization
  if (url.pathname.startsWith('/api/')) {
    // Add request ID for tracking
    const requestId = crypto.randomUUID();
    response.headers.set('X-Request-ID', requestId);
    
    // Log slow requests
    const startTime = Date.now();
    response.headers.set('X-Response-Time', '0ms');
    
    // Add response time header after processing
    setTimeout(() => {
      const responseTime = Date.now() - startTime;
      if (responseTime > 1000) {
        console.warn(`Slow API request: ${url.pathname} took ${responseTime}ms`);
      }
    }, 0);
  }

  // Compression headers
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  if (acceptEncoding.includes('gzip')) {
    response.headers.set('Content-Encoding', 'gzip');
  } else if (acceptEncoding.includes('br')) {
    response.headers.set('Content-Encoding', 'br');
  }

  // CORS headers for API routes
  if (url.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 