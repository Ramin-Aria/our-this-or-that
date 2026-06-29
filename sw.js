const CACHE_NAME = 'are-we-a-match-v5.4.0';
const ASSETS = [
  '.', // روت اصلی برای هماهنگی کامل با start_url در مانیفست
  'index.html',
  'style.css',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
];

// نصب سرویس ورکر و کش کردن فایل‌های اصلی ظاهر برنامه
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('PWA Cache: در حال کش کردن فایل‌های اصلی...');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// فعال‌سازی و پاکسازی کش‌های قدیمی نسخه‌های قبل
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('PWA Cache: در حال حذف کش قدیمی:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// پاسخ‌دهی سریع به درخواست‌ها از طریق کش (آفلاین و آنلاین)
self.addEventListener('fetch', (e) => {
  // درخواست‌های مربوط به فایربیس نیازی به کش شدن در Service Worker ندارند
  if (e.request.url.includes('firebaseio.com') || e.request.url.includes('googleapis.com/v1')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // اگر فایل در کش بود آن را برگردان، در غیر این صورت از شبکه بگیر
      return cachedResponse || fetch(e.request);
    })
  );
});
