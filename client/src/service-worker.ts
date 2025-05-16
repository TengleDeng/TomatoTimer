// Enhanced service worker for offline PWA capabilities
declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'pomodoro-app-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/logo.svg',
  '/assets/icon-192x192.png',
  '/assets/icon-512x512.png'
];

// Install event - cache all static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Service Worker: clearing old cache', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Improved fetch strategy - Cache First, then Network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests with network first (but don't cache them)
  if (event.request.url.includes('/api/')) {
    // For API calls, we use network first and don't cache
    // since we're using localStorage for offline data storage
    event.respondWith(
      fetch(event.request)
        .catch(error => {
          console.log('Fetch failed for API; returning offline response', error);
          return new Response(JSON.stringify({ 
            error: 'You are offline. Using local data storage.',
            offline: true 
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // For non-API requests (static assets, HTML, CSS, JS), use Cache First strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached response
          return cachedResponse;
        }
        
        // If not in cache, fetch from network
        return fetch(event.request)
          .then(response => {
            // Cache the fetched response
            // We clone the response because it's a stream and can only be consumed once
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                // Only cache successful responses
                if (response.status === 200) {
                  cache.put(event.request, responseToCache);
                }
              });
              
            return response;
          })
          .catch(() => {
            // When even the fallback is unavailable (completely offline)
            // Return a generic fallback for HTML pages
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/');
            }
            
            // Otherwise, let the failure pass through
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' },
            });
          });
      })
  );
});