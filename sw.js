// Masala Rush offline cache. The version changes whenever any game file changes.
const CACHE = 'masala-rush-v20261011-rotate';
const ASSETS = ["./", "index.html", "manifest.webmanifest", "icons/favicon-64.png", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "fonts/baloo-2-latin-wght-normal.woff2", "fonts/baloo-2-latin-ext-wght-normal.woff2", "fonts/baloo-2-devanagari-wght-normal.woff2", "fonts/baloo-thambi-2-latin-wght-normal.woff2", "fonts/baloo-thambi-2-tamil-wght-normal.woff2"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('masala-rush-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Serve from the cache straight away (works offline), and refresh the cache in the background when online.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const key = req.mode === 'navigate' ? 'index.html' : req;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(key, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res && res.ok && res.type === 'basic') cache.put(key, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || new Response('Offline', { status: 503 });
  }));
});
