// Service Worker لوسيل بلاي
const CACHE_NAME = 'wacel-play-v3.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles/style.css',
  '/js/app.js',
  '/js/auth.js',
  '/js/firebase-config.js'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('🟢 Service Worker: جاري التثبيت...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('🟢 Service Worker: جاري تخزين الملفات');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('🟢 Service Worker: التثبيت مكتمل');
        return self.skipWaiting();
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('🟢 Service Worker: جاري التفعيل...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🟢 Service Worker: جاري حذف الكاش القديم', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🟢 Service Worker: التفعيل مكتمل');
      return self.clients.claim();
    })
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إذا وجد في الكاش
        if (response) {
          return response;
        }

        // إذا لم يوجد، اجلب من الشبكة
        return fetch(event.request)
          .then((response) => {
            // تحقق من صحة الاستجابة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // استنسخ الاستجابة للتخزين
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
      })
  );
});
