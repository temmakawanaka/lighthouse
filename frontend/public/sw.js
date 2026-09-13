const CACHE = "lighthouse-field-guide-v5";
const APP_SHELL = ["/", "/map/", "/stamps/", "/trip/", "/my-lighthouses/", "/manifest.webmanifest", "/icon.svg", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) await (await caches.open(CACHE)).put(request, response.clone());
        return response;
      } catch {
        return await caches.match(request) || await caches.match("/") || Response.error();
      }
    })());
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await (await caches.open(CACHE)).put(request, response.clone());
      return response;
    })());
    return;
  }

  if (/\.(?:jpg|png|svg|webp)$/.test(url.pathname)) {
    const refresh = fetch(request).then(async (response) => {
      if (response.ok) await (await caches.open(CACHE)).put(request, response.clone());
      return response;
    });
    event.respondWith(caches.match(request).then((cached) => cached || refresh));
    event.waitUntil(refresh.then(() => undefined).catch(() => undefined));
  }
});
