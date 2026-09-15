// Service Worker para Mona Gestão Acadêmica
const CACHE_NAME = 'mona-academic-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './supabase-config.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignora requisições de API para o Supabase ou CDNs externos no cache estático direto
  if (event.request.url.includes('supabase.co') || event.request.url.includes('googleapis') || event.request.url.includes('cdnjs')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        return caches.match('./index.html');
      });
    })
  );
});
