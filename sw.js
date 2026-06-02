// ============================================
// Service Worker para Dominó Pintintín
// Autor: Ricardo Castillo Valdés (Richard)
// Contacto: 3sayricardo@gmail.com | +53 55031725
// La Demajagua, Isla de la Juventud, Cuba
// Versión: 5.2.0
// ============================================
const CACHE_NAME = 'pintintin-v5.2.0';
const urlsToCache = [
  './',
  './index.html',
  './admin.html',
  './estadisticas_graficas.html',
  './ver_machs_por_dia.html',
  './manual_pintintin.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './sw.js',
  './actualizar_tiempos.html',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
  'https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Instalando v5.2.0...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Cacheando archivos...');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('[Service Worker] Error al cachear:', err))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request)
          .then(fetchResponse => {
            if (event.request.url.startsWith(self.location.origin)) {
              const copy = fetchResponse.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
            }
            return fetchResponse;
          });
      })
      .catch(() => new Response('⚠️ Sin conexión. La app funciona offline después de la primera carga.'))
  );
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activando v5.2.0...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando cache antigua:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});
