// Service Worker dla Web Push Notifications
// WAŻNE: Zmień wersję cache przy każdym deploymencie!
const CACHE_VERSION = '1.0.0';
const CACHE_NAME = `restauracja-v${CACHE_VERSION}`;
const STATIC_CACHE_URLS = [
  '/',
  '/assets/',
  '/favicon.ico'
];

// Powiadom aplikację o dostępnej aktualizacji
function notifyClientsAboutUpdate() {
  self.clients.matchAll({ type: 'window' }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'NEW_VERSION_AVAILABLE',
        version: CACHE_VERSION
      });
    });
  });
}

// Instalacja Service Workera
self.addEventListener('install', (event) => {
  console.log(`[Service Worker] Installing version ${CACHE_VERSION}...`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((err) => {
        console.error('[Service Worker] Cache error:', err);
      })
  );
  // NIE wywołuj skipWaiting() automatycznie - poczekaj na sygnał od użytkownika
  // Powiadom klientów o dostępnej aktualizacji
  notifyClientsAboutUpdate();
});

// Aktywacja Service Workera
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Przejmij kontrolę nad wszystkimi klientami
  return self.clients.claim();
});

// Obsługa push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);

  let notificationData = {
    title: 'Nowa rezerwacja',
    body: 'Masz nową rezerwację do sprawdzenia',
    icon: '/assets/icons/icon-192x192.svg',
    badge: '/assets/icons/badge-72x72.svg',
    tag: 'reservation',
    requireInteraction: false,
    data: {
      url: '/admin/reservations'
    }
  };

  // Jeśli payload zawiera dane, użyj ich
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        tag: payload.tag || notificationData.tag,
        requireInteraction: payload.requireInteraction !== undefined ? payload.requireInteraction : notificationData.requireInteraction,
        data: payload.data || notificationData.data,
        timestamp: payload.timestamp || Date.now()
      };
    } catch (e) {
      console.error('[Service Worker] Error parsing push payload:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      timestamp: notificationData.timestamp
    })
  );
});

// Obsługa kliknięcia w powiadomienie
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);

  event.notification.close();

  const notificationData = event.notification.data || {};
  const urlToOpen = notificationData.url || '/admin/reservations';

  // Jeśli jest reservationId w data, dodaj jako query param
  let finalUrl = urlToOpen;
  if (notificationData.reservationId) {
    const separator = urlToOpen.includes('?') ? '&' : '?';
    finalUrl = `${urlToOpen}${separator}reservationId=${notificationData.reservationId}`;
  }

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Sprawdź czy jest już otwarte okno z tą aplikacją
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          // Otwórz w istniejącym oknie
          return client.navigate(finalUrl).then((client) => client.focus());
        }
      }
      // Jeśli nie ma otwartego okna, otwórz nowe
      if (clients.openWindow) {
        return clients.openWindow(finalUrl);
      }
    })
  );
});

// Obsługa komunikacji z aplikacją (opcjonalnie)
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
