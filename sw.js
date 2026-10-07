// Cache-first service worker: the app works offline once visited.
// Bump CACHE when shipping changes so clients drop the old files.
const CACHE = "running-tool-v1";
const ASSETS = [
    "./",
    "index.html",
    "css/style.css",
    "js/app.js",
    "js/calc.js",
    "js/i18n.js",
    "img/logo.png",
    "manifest.json",
];

self.addEventListener("install", (e) => {
    e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim()),
    );
});

self.addEventListener("fetch", (e) => {
    if (e.request.method !== "GET") return;
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
