self.addEventListener("install", event => {
  console.log("💾 Service Worker installed");
  event.waitUntil(
    caches.open("expense-cache").then(cache => {
      return cache.addAll([
        "./",
        "index.html",
        "app.js",
        "style.css",
        "manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
