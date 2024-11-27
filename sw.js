const CACHE_NAME = 'site-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/request.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // დაამატეთ ყველა სტატიკური ფაილი რაც გჭირდებათ
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // თუ რესურსი ნაპოვნია ქეშში, დავაბრუნოთ ის
        if (response) {
          return response;
        }

        // თუ არ არის ქეშში, მოვითხოვოთ ქსელიდან
        return fetch(event.request)
          .then((response) => {
            // შევამოწმოთ არის თუ არა ვალიდური პასუხი
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // დავაქეშოთ ახალი რესურსი
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // თუ ქსელი არ არის, დავაბრუნოთ offline გვერდი
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
