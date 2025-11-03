const CACHE_NAME = "roha-expense-cache-v1";
const urlsToCache = ["./", "./index.html", "./style.css", "./app.js"];

self.addEventListener("install", (event) => {
  console.log("💾 Service Worker installed");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => resp || fetch(event.request))
  );
});
