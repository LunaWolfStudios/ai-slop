const CACHE_NAME = 'ireland-map-v2';

// Use relative paths for core assets to work in subdirectories
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // We use .map and Promise.allSettled to ensure one missing asset doesn't break the whole install
      // (e.g. if index.html is served from a different path in some envs)
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
          console.warn('Failed to cache some assets during install', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-http schemes (like chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // Strategy 1: Stale-while-revalidate for Map Tiles and External Images
  // We want these to be fast (from cache) but update eventually
  if (url.hostname.includes('cartocdn') || url.hostname.includes('weserv.nl') || url.hostname.includes('openstreetmap')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // Swallow errors if offline
            });

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Strategy 2: Network First, then Cache (Fallthrough) for local assets
  // This ensures we always try to get the latest app code, but save it for offline/later
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If successful response and it's a same-origin request (or local script), cache it
        // IMPORTANT: We check networkResponse.ok to avoid caching 404s (like missing index.css)
        if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails (offline), try cache
        return caches.match(event.request);
      })
  );
});