const CACHE_NAME = "offline-cache";
const FILES_TO_CACHE = [
  '/vote/',
  '/vote/index.html',
  '/vote/app.js',
  '/vote/style.css',
  '/vote/favicon.ico',
  '/vote/favicon_32x32.png',
  '/vote/favicon_64x64.png',
  '/vote/favicon_192x192.png',
  '/vote/favicon_512x512.png',
  '/vote/apple-touch-icon.png'
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
