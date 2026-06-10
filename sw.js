const CACHE_NAME = 'pintintin-v6.0.6';
const urlsToCache = [
  './',
  './index.html',
  './admin.html',
  './analisis_jugador.html',
  './estadisticas_graficas.html',
  './actualizar_tiempos.html',
  './ver_machs_por_dia.html',
  './reparar_db.html',
  './manual_pintintin.html',
  './app.js',
  './styles.css',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  console.log('?? Service Worker instalando... v6.0.6');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('?? Archivos cacheados correctamente');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('? Error al cachear:', err))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});

self.addEventListener('activate', event => {
  console.log('?? Service Worker activado - v6.0.6');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('??? Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
