/* Offline-cache: na één keer openen werkt de app ook zonder internet. */
const CACHE = 'sf-dnd-v1';
const FILES = [
  './', 'index.html', 'manifest.json', 'css/style.css',
  'js/data.js', 'js/core.js', 'js/pim.js', 'js/charlie.js', 'js/flow.js', 'js/views.js', 'js/main.js',
  'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* Eerst het netwerk (altijd de nieuwste versie), anders de cache. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
