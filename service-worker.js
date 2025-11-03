self.addEventListener("install", e => {
  console.log("💾 Service Worker installed");
  e.waitUntil(caches.open("v1").then(cache => cache.addAll(["/", "/index.html", "/style.css", "/app.js"])));
});

self.addEventListener("fetch", e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
