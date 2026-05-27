/**
 * sw.js
 * Service Worker — Network First com fallback para cache.
 * Auto-cleanup de caches antigos.
 */

const CACHE_VERSION = 'v3.0.0-nasa-mobile-first';
const CACHE_NAME = `ygor-premium-${CACHE_VERSION}`;

const urlsToCache = [
  './',
  './index.html',
  './assets/css/tokens.css',
  './assets/css/base.css',
  './assets/css/components.css',
  './assets/css/sections.css',
  './assets/css/animations.css',
  './assets/js/interactions.js',
  './assets/js/animations.js',
  './assets/js/carousel.js',
  './assets/js/magnetic.js',
  './assets/js/cursor.js',
  './assets/js/lenis-init.js',
  './img/ygorimagem.png',
  './img/igormobile.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        urlsToCache.map((url) => cache.add(url).catch(() => null))
      )
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n.startsWith('ygor-premium-') && n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;
  if (event.request.method !== 'GET') return;

  // CDN: cache-first
  if (event.request.url.includes('cdn.jsdelivr.net') ||
      event.request.url.includes('fonts.googleapis.com') ||
      event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // App resources: network-first com fallback cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
