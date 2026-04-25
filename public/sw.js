/* Bazari Service Worker - PWA + Push Notifications */

const CACHE_NAME = "bazari-v1";
const STATIC_ASSETS = [
  "/",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Ignore cache failures for dynamic content.
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone).catch(() => {});
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("Offline", { status: 503 });
        });
      })
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "Bazari", body: "Yeni bildiriş!", icon: "/icon-192x192.png" };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = {
        title: payload.title || "Bazari",
        body: payload.body || payload.message || "",
        icon: payload.icon || "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: payload.tag || "bazari-notification",
        data: {
          url: payload.url || payload.link || "/",
          ...payload.data,
        },
        actions: payload.actions || [
          { action: "open", title: "Bax" },
          { action: "dismiss", title: "Bağla" },
        ],
        vibrate: [200, 100, 200],
        requireInteraction: false,
      };
    }
  } catch (error) {
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
      requireInteraction: data.requireInteraction,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  if (event.action === "dismiss") return;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
