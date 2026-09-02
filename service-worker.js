/* Bloom service worker: receives push while the page is closed. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) { event.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { body: event.data.text() }; }
  var title = data.title || 'Bloom 阅读更新';
  var options = {
    body: data.body || 'The Economist 有新一期内容可查看。',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    tag: data.tag || 'bloom-economist-update',
    renotify: false,
    data: { url: data.url || './?module=english' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var target = new URL((event.notification.data && event.notification.data.url) || './', self.location.href).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clients) {
    for (var i = 0; i < clients.length; i++) {
      if ('focus' in clients[i]) {
        clients[i].navigate(target);
        return clients[i].focus();
      }
    }
    return self.clients.openWindow ? self.clients.openWindow(target) : null;
  }));
});
