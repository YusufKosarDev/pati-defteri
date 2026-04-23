const CACHE_NAME = "patidefteri-v2";
const STATIC_CACHE = "patidefteri-static-v2";

const STATIC_ASSETS = [
  "/",
  "/app",
  "/index.html",
  "/favicon.svg",
  "/manifest.json",
];

// Install — static dosyaları cache'le
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate — eski cache'leri temizle
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener("fetch", (event) => {
  // POST isteklerini cache'leme
  if (event.request.method !== "GET") return;

  // API isteklerini cache'leme
  if (event.request.url.includes("/api/")) return;

  // External URL'leri cache'leme
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Başarılı response'u cache'e kaydet
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network yoksa cache'den sun
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Cache'de de yoksa index.html döndür (SPA routing)
          return caches.match("/index.html");
        });
      })
  );
});

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "PatiDefteri";
  const options = {
    body: data.body || "Yeni bir hatırlatıcınız var!",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/app" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || "/app")
  );
});