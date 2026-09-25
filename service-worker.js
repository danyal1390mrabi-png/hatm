const CACHE_NAME = 'chat-doostaneh-v1';
const CORE_ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for everything (chat needs live data); fall back to cache only when offline,
// and if there's nothing cached either, return a real error Response instead of undefined
// (returning undefined from respondWith throws "Failed to convert value to 'Response'").
// نکته‌ی مهم: فقط درخواست‌های هم‌مبدأ (خود سایت) رو مدیریت کن؛ فایل‌های خارجی
// (عکس/صدا/ویدیو/فایل روی Supabase Storage) رو دست‌نخورده به خود مرورگر بسپار،
// وگرنه گاهی به‌جای عکس واقعی یه پاسخ خالی/سیاه برمی‌گرده.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      return new Response('', {
        status: 503,
        statusText: 'Service Unavailable (offline, not cached)'
      });
    })
  );
});
