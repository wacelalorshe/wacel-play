// sw.js - Service Worker للتطبيق
const CACHE_NAME = 'wacel-play-v3.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html', 
  '/share.html',
  '/styles/style.css',
  '/styles/admin.css',
  '/js/app.js',
  '/js/auth.js',
  '/js/admin.js',
  '/js/firebase-config.js',
  '/js/simple-auth.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js'
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
  console.log('🔄 تثبيت Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('✅ تم فتح الذاكرة المؤقتة');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('❌ خطأ في التثبيت:', error);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', function(event) {
  console.log('🚀 تفعيل Service Worker...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ حذف الذاكرة المؤقتة القديمة:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// استرجاع الطلبات من الذاكرة المؤقتة
self.addEventListener('fetch', function(event) {
  // تجاهل طلبات Firebase وطلبات POST
  if (event.request.url.includes('firebase') || event.request.method === 'POST') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // إذا وجد الملف في الذاكرة المؤقتة، نعيده
        if (response) {
          return response;
        }

        // إذا لم نجده، نحمله من الشبكة
        return fetch(event.request).then(
          function(response) {
            // نتحقق من أن الاستجابة صالحة
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // ننسخ الاستجابة لأنها تستخدم مرة واحدة
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                // نتجنب تخزين البيانات الديناميكية
                if (!event.request.url.includes('firebase') && 
                    !event.request.url.includes('googleapis') &&
                    responseToCache.type === 'basic') {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        ).catch(function() {
          // في حالة فشل التحميل، نعيد صفحة أوفلاين
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// استقبال الرسائل من الصفحة الرئيسية
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// التعامل مع المزامنة في الخلفية
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('🔄 مزامنة في الخلفية...');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // يمكن إضافة مهام المزامنة هنا
  console.log('✅ تمت المزامنة في الخلفية');
}
