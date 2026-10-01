const CACHE = 'ayvin-shell-v9';
const SHELL = ["./", "index.html", "manifest.json", "icon-192.png", "css/app.css", "css/meet-panel.css", "js/00-config.js", "js/01-core.js", "js/02-realtime.js", "js/03-block-report.js", "js/04-ai-bots.js", "js/05-rooms.js", "js/06-home-tabs.js", "js/07-auth.js", "js/08-chat-switch.js", "js/09-msg-tools.js", "js/10-backend-bridge.js", "js/11-send-media.js", "js/12-roles-invite.js", "js/13-profile-keyboard.js", "js/14-channels.js", "js/meet-config.js", "js/15-meet-panel.js", "js/16-jitsi-call.js", "js/99-guard.js"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// شبکه اول، در صورت آفلاین بودن از کش
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); return res;
  }).catch(() => caches.match(r).then(m => m || caches.match('./'))));
});

self.addEventListener('push', e => {
  let d = {}; try { d = e.data.json(); } catch (_) {}
  e.waitUntil(self.registration.showNotification(d.title || 'آیوین', {
    body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag, data: { url: d.url || './' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if ('focus' in c) return c.focus();
    return clients.openWindow(e.notification.data.url);
  }));
});
