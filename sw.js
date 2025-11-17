// Service Worker مبسط وسهل
const CACHE_NAME = 'wacel-play-simple-v1';

self.addEventListener('install', (event) => {
  console.log('🟢 Service Worker: جاري التثبيت...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🟢 Service Worker: مفعل وجاهز للعمل');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // بسيط - لا كاش معقد
  event.respondWith(fetch(event.request));
});
