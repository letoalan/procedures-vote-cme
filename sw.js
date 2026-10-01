// Service Worker — Mode déconnecté PWA & Nettoyage automatique en développement

const CACHE_NAME = 'cme-elections-v2';

self.addEventListener('install', (event) => {
  // En développement local (Vite), forcer la prise en charge immédiate
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      // Vider tous les anciens caches
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

// En mode local Vite, ne pas intercepter les modules HMR ou scripts dynamiques
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Laisser Vite gérer en direct les styles, le HMR et les scripts
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.port === '5173') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((res) => {
      return res || fetch(event.request).catch(() => caches.match('./index.html'));
    })
  );
});
