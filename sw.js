// Service Worker مبسط
const CACHE_NAME = 'wacel-play-v1';

self.addEventListener('install', (event) => {
  console.log('🟢 Service Worker: جاري التثبيت...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🟢 Service Worker: مفعل');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
