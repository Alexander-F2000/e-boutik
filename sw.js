// ============================================================
// e-boutik Service Worker — Cache statique + offline
// ============================================================
const CACHE_NAME = 'eboutik-v1';
const ASSETS = [
    '/e-boutik/',
    '/e-boutik/index.html',
    '/e-boutik/catalog.html',
    '/e-boutik/cart.html',
    '/e-boutik/about.html',
    '/e-boutik/contact.html',
    '/e-boutik/account.html',
    '/e-boutik/admin.html',
    '/e-boutik/product.html',
    '/e-boutik/css/style.css',
    '/e-boutik/js/app.js',
    '/e-boutik/js/admin.js',
    '/e-boutik/js/supabase.js',
    '/e-boutik/js/nav.js',
    '/e-boutik/js/catalog.js',
    '/e-boutik/js/product.js',
    '/e-boutik/js/account.js',
    '/e-boutik/img/favicon.svg',
    '/e-boutik/img/banner.jpg',
    '/e-boutik/img/og-image.jpg'
];

// Install: cache static assets
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(names) {
            return Promise.all(
                names.filter(function(n) { return n !== CACHE_NAME; })
                    .map(function(n) { return caches.delete(n); })
            );
        })
    );
    self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', function(event) {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Skip Supabase API calls
    if (event.request.url.includes('supabase.co')) return;

    // Skip non-HTTP(S) URLs
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                // Cache successful responses
                if (response.status === 200) {
                    var copy = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, copy);
                    });
                }
                return response;
            })
            .catch(function() {
                // Offline: serve from cache
                return caches.match(event.request).then(function(cached) {
                    return cached || new Response('Offline', { status: 503 });
                });
            })
    );
});
