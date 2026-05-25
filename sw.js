/**
 * sw.js
 * Service Worker — Network First com cache fallback.
 * Paths relativos para compatibilidade com qualquer deploy.
 */

const CACHE_NAME = 'ygor-premium-v1.4.0';

const urlsToCache = [
  './',
  './index.html',
  './assets/css/tokens.css',
  './assets/css/base.css',
  './assets/css/components.css',
  './assets/css/sections.css',
  './assets/css/animations.css',
  './assets/js/lenis-init.js',
  './assets/js/theme-switcher.js',
  './assets/js/interactions.js',
  './assets/js/cursor.js',
  './assets/js/magnetic.js',
  './assets/js/animations.js',
  './assets/js/carousel.js',
  './img/ygorimagem.png',
  './img/igormobile.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  // CDN resources: cache-first (fontes, libs nao mudam com frequencia)
  if (event.request.url.includes('cdn.jsdelivr.net') ||
      event.request.url.includes('fonts.googleapis.com') ||
      event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // App resources: network-first
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
