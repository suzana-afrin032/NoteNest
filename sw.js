
const CACHE_NAME = "notenest-v1";

const STATIC_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/picc.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_FILES);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Do not cache API requests or other websites.
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.includes("/api/")
  ) {
    return;
  }

  // Use network first for HTML pages.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
  }
});
