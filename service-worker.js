const IV_CACHE = 'iv-gestao-v1';
const IV_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './IV.png',
  './auth-upgrade.js',
  './mobile-upgrade.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(IV_CACHE)
      .then(cache => cache.addAll(IV_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== IV_CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(IV_CACHE).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
