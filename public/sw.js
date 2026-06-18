const CACHE_NAME = 'casa-nova-pos-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.origin !== location.origin) return;
  
  if (url.pathname === '/' || url.pathname.startsWith('/inventory') || 
      url.pathname.startsWith('/pos') || url.pathname.startsWith('/sales') ||
      url.pathname.startsWith('/purchases') || url.pathname.startsWith('/reports') ||
      url.pathname.startsWith('/settings')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});