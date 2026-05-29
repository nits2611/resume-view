const VERSION = "v1.0.0.8";
const BASE_PATH = "/resume-view/";
const CACHE_NAME = `nh-resume-${VERSION}`;

const APP_SHELL = [
  BASE_PATH,
  BASE_PATH + "index.html",
  BASE_PATH + "offline.html",
  BASE_PATH + "manifest.webmanifest",

  BASE_PATH + "resources/css/style.min.css",
  BASE_PATH + "resources/js/app.js",

  BASE_PATH + "assets/icons/nh-logo-192p.webp",
  BASE_PATH + "assets/icons/nh-logo-512p.webp",
  BASE_PATH + "assets/icons/svg/nh-logo-left.svg",
  BASE_PATH + "assets/icons/svg/nh-logo-right.svg",

  BASE_PATH + "assets/images/hero/Nit-300p.png",
  BASE_PATH + "case-studies/ota-integration.html",
  BASE_PATH + "assets/documents/Nitesh-Harjilawala_Full-Stack-Developer_Canada.pdf"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      for (const asset of APP_SHELL) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn("[SW] failed to cache:", asset, err);
        }
      }

      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const currentCache = await caches.open(CACHE_NAME);
      const offlinePage = await currentCache.match(BASE_PATH + "offline.html");
      const indexPage = await currentCache.match(BASE_PATH + "index.html");

      // Safety: only delete old caches if new important pages are cached
      if (offlinePage && indexPage) {
        const keys = await caches.keys();

        await Promise.all(
          keys
            .filter((key) => key.startsWith("nh-resume-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        );
      } else {
        console.warn("[SW] New cache incomplete. Keeping old cache.");
      }

      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  // HTML navigation
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(req);

          const cache = await caches.open(CACHE_NAME);
          cache.put(req, networkResponse.clone());

          return networkResponse;
        } catch (err) {
          return (
            await caches.match(req) ||
            await caches.match(BASE_PATH) ||
            await caches.match(BASE_PATH + "index.html") ||
            await caches.match(BASE_PATH + "offline.html") ||
            new Response("You are offline.", {
              status: 200,
              headers: { "Content-Type": "text/plain" }
            })
          );
        }
      })()
    );

    return;
  }

  // Static assets: cache first
  event.respondWith(
    (async () => {
      const cached = await caches.match(req);

      if (cached) return cached;

      try {
        const networkResponse = await fetch(req);

        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, networkResponse.clone());
        }

        return networkResponse;
      } catch (err) {
        return new Response("", { status: 504 });
      }
    })()
  );
});