const CACHE_NAME = 'offline-cache-v1';
const OFFLINE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png',
  './styles.css',
  './request.html',
  // დავამატოთ ყველა საჭირო რესურსი
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(OFFLINE_URLS);
      })
  );
  self.skipWaiting(); // დავამატოთ ეს ხაზი
});

// დავამატოთ activate ივენთი
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // დავამატოთ ეს ხაზი
});

// განვაახლოთ fetch ივენთი
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        // ინტერნეტთან კავშირის შემთხვევაში
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200) {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // თუ ოფლაინშია და რესურსი არ არის ქეშში
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            return new Response('Offline content not available');
          });
      })
  );
});