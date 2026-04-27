const CACHE_NAME = 'neuro-dome-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './css/styles.css',
  './css/features.css',
  './js/app.js',
  './js/features.js',
  './js/env.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
