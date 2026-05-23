/**
 * sw.js
 * Service Worker para performance e cache inteligente.
 * Estratégia: Network First com Fallback para Cache.
 */

const CACHE_NAME = 'ygor-premium-v1.0.2';

// Arquivos críticos para o primeiro carregamento
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/tokens.css',
  '/assets/css/base.css',
  '/assets/css/components.css',
  '/assets/css/sections.css',
  '/assets/css/animations.css',
  '/assets/js/lenis-init.js',
  '/assets/js/theme-switcher.js',
  '/assets/js/interactions.js',
  '/assets/js/cursor.js',
  '/assets/js/magnetic.js',
  '/assets/js/animations.js'
];

// INSTALAÇÃO: Faz o cache dos arquivos principais e força a instalação imediata
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Não espera as abas fecharem para atualizar
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// ATIVAÇÃO: Limpa qualquer cache de uma versão antiga (se houver)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Assume o controle da página imediatamente
});

// FETCH: Tenta buscar na internet primeiro (para garantir site atualizado).
// Se falhar (offline), puxa do Cache instantaneamente.
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam http/https (como extensões de navegador)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se a internet respondeu, atualizamos o cache com a versão mais nova
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        // Se a internet cair, busca no cache
        return caches.match(event.request);
      })
  );
});
