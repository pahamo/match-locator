// Simple service worker - NETWORK FIRST strategy for fresh content
const CACHE_NAME = 'match-locator-v4'; // Increment version to clear old cache
const urlsToCache = [
  '/logo.svg',
  '/favicon.png',
  '/manifest.json'
  // Note: Don't cache HTML or JS/CSS - they need to be fresh
];

// Install event - cache core assets only
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Service worker install failed:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - NETWORK FIRST, then cache fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip API requests - always go to network
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase')) {
    return;
  }

  event.respondWith(
    // Try network first
    fetch(event.request)
      .then((response) => {
        // Don't cache HTML files or API responses
        const url = new URL(event.request.url);
        const shouldCache = !url.pathname.endsWith('.html') &&
                          !url.pathname.includes('/static/js/') &&
                          !url.pathname.includes('/static/css/');

        // Clone the response before caching
        if (shouldCache && response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((response) => {
          if (response) {
            console.log('SW: Network failed, serving from cache:', event.request.url);
            return response;
          }
          // No cache either, return error
          return new Response('Offline and no cached version available', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});
