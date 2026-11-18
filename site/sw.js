/* Offline cache: after opening once, the app also works without internet. */
const CACHE = 'sf-dnd-v14';
const FILES = [
  './', 'index.html', 'manifest.json', 'css/style.css',
  'js/data.js', 'js/core.js', 'js/pim.js', 'js/flow.js', 'js/views.js', 'js/main.js',
  'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png',
  'charlie/', 'charlie/index.html', 'charlie/manifest.json', 'charlie/charlie.css',
  'charlie/surge.js', 'charlie/data.js', 'charlie/logic.js', 'charlie/ui.js',
  'charlie/icon.svg', 'charlie/icon-180.png', 'charlie/icon-192.png', 'charlie/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* Network first, always revalidated with the server (GitHub Pages caches 10 min), cache when offline. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
