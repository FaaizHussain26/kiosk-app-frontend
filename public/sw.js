const CACHE_NAME = "posta-cache-v2";
const STATIC_ASSETS = ["/", "/offline.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;

  // Never intercept API calls or non-GET requests — re-fetching a POST/FormData
  // request in a service worker can yield an empty/truncated body and cause
  // multer/busboy "Unexpected end of form" on the backend.
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  e.respondWith(
    caches
      .match(request)
      .then((cached) => cached || fetch(request))
      .catch(() => caches.match("/offline.html"))
  );
});
