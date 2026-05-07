/**
 * @file sw.js
 * @description Service Worker con estrategia de caché restrictiva (Solo GET local).
 */

const CACHE_NAME = 'neurodome-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icono_neurodome.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 1. SOLO procesar requests GET
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. SOLO procesar requests del mismo dominio (evita APIs externas como Gemini)
  if (!event.request.url.startsWith(self.location.origin)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retornar versión en caché si existe
      if (response) return response;

      // Si no está en caché, ir a la red
      return fetch(event.request).then((networkResponse) => {
        // Validar respuesta válida de la red
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Clonar y guardar en caché la nueva respuesta válida
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback offline si la red falla
        return new Response('Modo Offline Activo. Verifica tu conexión.', { 
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      });
    })
  );
});
