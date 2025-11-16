// sw.js - Service Worker للتطبيق
const CACHE_NAME = 'wacel-play-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  '/share.html',
  '/styles/style.css',
  '/styles/admin.css',
  '/js/app.js',
  '/js/admin.js',
  '/js/auth.js',
  '/js/firebase-config.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching Files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// اعتراض الطلبات
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching', event.request.url);
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // نسخ الاستجابة للتخزين المؤقت
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseClone);
          });
        return response;
      })
      .catch(() => caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          // إذا لم تكن الصفحة موجودة في التخزين المؤقت، عرض صفحة غير متصل
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        })
      )
  );
});
