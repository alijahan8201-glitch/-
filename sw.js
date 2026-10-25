const CACHE_NAME = 'rahneshan-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/logo.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        urlsToCache.map(url => cache.add(url).catch(err => console.warn('Failed to cache', url)))
      );
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  // ⚠️ نکته مهم: درخواست‌های API رو به هیچ وجه کش نمی‌کنیم و مستقیم به سرور می‌فرستیم
  if (event.request.url.includes('/api/')) {
    return; 
  }
  
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // اگر آفلاین بودیم، صفحه اصلی رو نشون بده
        return caches.match('/index.html');
      });
    })
  );
});
