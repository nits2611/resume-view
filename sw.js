const VERSION   = 'v1.0.0.3';                          // version
const BASE_PATH = '.';                     // path in case change
const CACHE_NAME = `nh-resume-${VERSION}`;

const ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/resources/css/style.css`,
  `${BASE_PATH}/assets/icons/icon-192.png`,
  `${BASE_PATH}/assets/icons/icon-512.png`,
  `${BASE_PATH}/assets/images/banners/preview-banner-1200x630.jpg`,
  `${BASE_PATH}/offline.html`,
  `${BASE_PATH}/assets/documents/Nitesh-Harjilawala_Full-Stack-Developer_Canada.pdf`,
];

// --- Install: precache the app shell ---
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const base = self.registration.scope;
    const failures = [];

    for (const path of ASSETS) {
      const url = new URL(path, base);
      try {
        const req = new Request(url, { cache: 'reload' });
        const res = await fetch(req);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        await cache.put(req, res.clone());
      } catch (err) {
        failures.push(path);
        console.warn('[SW] skip precache ->', path, err.message);
      }
    }

    await self.skipWaiting();
    if (failures.length) {
      console.warn('[SW] Missing or blocked assets:', failures);
    }
  })());
});

// --- Activate: clean old caches + claim clients + enable nav preload ---
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch(e) {}
    }
    await self.clients.claim();
  })());
});

// --- Fetch: network-first for navigations, SWR for same-origin GETs ---
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // Handle navigations (HTML pages)
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // If the browser did a navigation preload, use it
        const preload = await event.preloadResponse;
        if (preload) return preload;

        // Network first
        const networkResp = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, networkResp.clone()).catch(()=>{});
        return networkResp;
      } catch (err) {
        // Offline fallback
        const cache = await caches.open(CACHE_NAME);
        const offline = await cache.match(`${BASE_PATH}/offline.html`);
        return offline || new Response('<h1>Offline</h1><p>Try again when you’re back online.</p>', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }
    })());
    return;
  }

  // For other GET requests: same-origin only, stale-while-revalidate
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then((resp) => {
        if (resp && resp.status === 200) {
          cache.put(req, resp.clone());
        }
        return resp;
      }).catch(() => undefined);
      return cached || fetchPromise || new Response('', { status: 504 });
    })());
  }
});

// Optional: allow page code to trigger immediate activation after update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
