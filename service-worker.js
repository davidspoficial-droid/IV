const IV_CACHE = 'iv-gestao-v4';
const IV_ASSETS = [
  './manifest.json',
  './IV.png',
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

  const url = new URL(event.request.url);
  const isHtml = event.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
  const isScript = url.pathname.endsWith('.js');

  if (isHtml || isScript) {
    event.respondWith(
      fetch(event.request)
        .then(response => response)
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(IV_CACHE).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
