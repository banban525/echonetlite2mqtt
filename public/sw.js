var CACHE_NAME = 'echonetlite2mqtt-cache-v1';
var urlsToCache = [
  // キャッシュ化したいコンテンツ
];

self.addEventListener('install', function(event) {

  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {

  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      return response ? response : fetch(event.request);
    })
  );  
});

self.addEventListener('push', function(event){

  var notificationDataObj = event.data.json();
  var content = {
    body: notificationDataObj.body,
  };
  event.waitUntil(
    self.registration.showNotification(notificationDataObj.title, content)
  );
});