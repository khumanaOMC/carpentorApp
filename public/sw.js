self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("kkc-shell-v1").then((cache) =>
      cache.addAll(["/", "/jobs", "/bookings", "/profile", "/manifest.json"])
    )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          const cloned = response.clone();
          caches.open("kkc-runtime-v1").then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => caches.match("/"));
    })
  );
});
