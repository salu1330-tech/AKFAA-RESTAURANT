// ============================================
// AKFAA COFFEE SHOP - SERVICE WORKER
// ============================================

const CACHE_NAME = "akfaa-v2";

const STATIC_ASSETS = [
    "/",
    "/static/css/style.css",
    "/static/js/menu-data.js",
    "/static/js/script.js",
    "/static/images/logo.png",
    "/static/manifest.json",
    "/menu-pdf"
];

// ============================================
// INSTALL - Cache static assets
// ============================================

self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log("[SW] Caching static assets");
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// ============================================
// ACTIVATE - Clean old caches
// ============================================

self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames
                    .filter(function(name) { return name !== CACHE_NAME; })
                    .map(function(name) { return caches.delete(name); })
            );
        })
    );
    self.clients.claim();
});

// ============================================
// FETCH - Network first, fallback to cache
// ============================================

self.addEventListener("fetch", function(event) {

    // Skip non-GET requests (POST orders, etc.)
    if (event.request.method !== "GET") return;

    // Skip API calls - always go to network
    if (event.request.url.includes("/api/") ||
        event.request.url.includes("/place-order") ||
        event.request.url.includes("/update-status") ||
        event.request.url.includes("/delete-order") ||
        event.request.url.includes("/set-time")) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                // Cache successful responses
                if (response.status === 200) {
                    var responseClone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(function() {
                // Offline - serve from cache
                return caches.match(event.request).then(function(cached) {
                    return cached || new Response("Offline", {
                        status: 503,
                        statusText: "Offline"
                    });
                });
            })
    );
});
