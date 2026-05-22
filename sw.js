const CACHE_NAME = 'pintintin-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => { if(key !== CACHE_NAME) return caches.delete(key); })))
  );
});