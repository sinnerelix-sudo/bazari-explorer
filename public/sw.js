/* Modamall Service Worker - PWA + Push Notifications */

const CACHE_NAME = 'modamall-v1';
const STATIC_ASSETS = [
  '/',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json'
];

/* ── Install ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Ignore cache failures for dynamic content
      });
    })
  );
  self.skipWaiting();
});

/* ── Activate ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch - Network first, cache fallback ── */
self.addEventListener('fetch', (event) => {
  // Skip non-GET and API requests
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone).catch(() => {});
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // For navigation requests, return cached index
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

/* ── Push Notification ── */
self.addEventListener('push', (event) => {
  let data = { title: 'Modamall', body: 'Yeni bildiriş!', icon: '/icon-192x192.png' };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = {
        title: payload.title || 'Modamall',
        body: payload.body || payload.message || '',
        icon: payload.icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: payload.tag || 'modamall-notification',
        data: {
          url: payload.url || payload.link || '/',
          ...payload.data
        },
        actions: payload.actions || [
          { action: 'open', title: 'Bax' },
          { action: 'dismiss', title: 'Bağla' }
        ],
        vibrate: [200, 100, 200],
        requireInteraction: false
      };
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      data: data.data,
      actions: data.actions,
      vibrate: data.vibrate,
      requireInteraction: data.requireInteraction
    })
  );
});

/* ── Notification Click ── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  if (event.action === 'dismiss') return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing tab if open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new tab
      return self.clients.openWindow(url);
    })
  );
});
