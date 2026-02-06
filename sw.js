// PATA Service Worker - v1.2.0
// Estratégia: Cache-First para assets estáticos, Network-First para HTML, Stale-While-Revalidate para imagens

const VERSION = 'pata-v1.2.0';
const CACHE_NAME = `${VERSION}-static`;
const CACHE_RUNTIME = `${VERSION}-runtime`;
const CACHE_IMAGES = `${VERSION}-images`;

// Recursos críticos para pre-cache (carregados durante instalação)
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/src/css/styles.min.css',
  '/src/js/function.min.js',
  '/src/js/custom-select.min.js',
  '/src/js/lenis.min.js',
  '/src/img/icons/logo.svg',
  '/src/img/icons/logo_signature.svg',
  '/src/img/icons/rato_pata.svg',
  '/src/img/icons/BONE.svg',
  '/src/img/images/header_image1.webp',
  '/src/img/images/header_image1-1440.webp',
  '/src/img/images/header_image1-768.webp',
  '/manifest.json',
  '/offline.html'
];

// CDN resources (opcional - cache apenas se usado)
const CDN_RESOURCES = [
  'https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.5/dist/dotlottie-wc.js',
  'https://unpkg.com/splitting/dist/splitting.min.js',
  'https://unpkg.com/splitting/dist/splitting.css',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js'
];

// Limites de cache
const MAX_CACHE_SIZE = 50; // Máximo de items no runtime cache
const MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000; // 30 dias em millisegundos

// ============================================
// INSTALL EVENT - Pre-cache critical assets
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching critical assets');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => {
        console.log('[SW] Critical assets cached successfully');
        // Force activation imediata (skip waiting)
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Pre-caching failed:', error);
      })
  );
});

// ============================================
// ACTIVATE EVENT - Limpar caches antigas
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', VERSION);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Remove caches de versões antigas
              return cacheName.startsWith('pata-') && cacheName !== CACHE_NAME &&
                     cacheName !== CACHE_RUNTIME && cacheName !== CACHE_IMAGES;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        // Tomar controle de todas as páginas imediatamente
        return self.clients.claim();
      })
  );
});

// ============================================
// FETCH EVENT - Estratégias de cache
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests não-GET
  if (request.method !== 'GET') return;

  // Ignorar chrome-extension e outras URLs especiais
  if (!url.protocol.startsWith('http')) return;

  // Estratégia baseada no tipo de recurso
  if (request.destination === 'document') {
    // HTML: Network-First (sempre tenta buscar versão mais recente)
    event.respondWith(networkFirstStrategy(request));
  }
  else if (request.destination === 'image') {
    // Imagens: Stale-While-Revalidate (usa cache mas atualiza em background)
    event.respondWith(staleWhileRevalidateStrategy(request, CACHE_IMAGES));
  }
  else if (url.origin === location.origin || CDN_RESOURCES.some(cdn => request.url.startsWith(cdn))) {
    // CSS, JS, Fonts: Cache-First (cache tem prioridade)
    event.respondWith(cacheFirstStrategy(request));
  }
  else {
    // Outros recursos externos: Network-First
    event.respondWith(networkFirstStrategy(request));
  }
});

// ============================================
// ESTRATÉGIA: Cache-First
// Usa cache se disponível, senão busca da rede
// ============================================
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      console.log('[SW] Cache hit:', request.url);
      return cachedResponse;
    }

    console.log('[SW] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);

    // Cache apenas respostas OK
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_RUNTIME);
      cache.put(request, networkResponse.clone());
      await trimCache(CACHE_RUNTIME, MAX_CACHE_SIZE);
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-First failed:', error);
    return await caches.match('/offline.html') || new Response('Offline', { status: 503 });
  }
}

// ============================================
// ESTRATÉGIA: Network-First
// Tenta rede primeiro, fallback para cache
// ============================================
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_RUNTIME);
      cache.put(request, networkResponse.clone());
      await trimCache(CACHE_RUNTIME, MAX_CACHE_SIZE);
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback para offline page se for documento HTML
    if (request.destination === 'document') {
      return await caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }

    return new Response('Network error', { status: 503 });
  }
}

// ============================================
// ESTRATÉGIA: Stale-While-Revalidate
// Retorna cache imediatamente, atualiza em background
// ============================================
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      trimCache(cacheName, MAX_CACHE_SIZE);
    }
    return networkResponse;
  }).catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// ============================================
// HELPER: Limitar tamanho do cache
// ============================================
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxItems) {
    // Remove os mais antigos (FIFO)
    const itemsToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(itemsToDelete.map(key => cache.delete(key)));
    console.log(`[SW] Trimmed ${itemsToDelete.length} items from ${cacheName}`);
  }
}

// ============================================
// HELPER: Limpar cache expirado
// ============================================
async function cleanExpiredCache() {
  const cacheNames = await caches.keys();
  const now = Date.now();

  for (const cacheName of cacheNames) {
    if (!cacheName.startsWith('pata-')) continue;

    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      const dateHeader = response.headers.get('date');

      if (dateHeader) {
        const cacheDate = new Date(dateHeader).getTime();
        if (now - cacheDate > MAX_CACHE_AGE) {
          await cache.delete(request);
          console.log('[SW] Deleted expired cache:', request.url);
        }
      }
    }
  }
}

// Executar limpeza de cache expirado periodicamente
self.addEventListener('message', (event) => {
  if (event.data === 'CLEAN_CACHE') {
    event.waitUntil(cleanExpiredCache());
  }

  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================
// BACKGROUND SYNC (opcional - para formulários)
// ============================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-waitlist') {
    event.waitUntil(syncWaitlistData());
  }
});

async function syncWaitlistData() {
  // Implementar sincronização de dados do formulário quando voltar online
  console.log('[SW] Background sync triggered');
}

// ============================================
// PUSH NOTIFICATIONS (preparação futura)
// ============================================
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Nova notificação PATA',
    icon: '/src/img/icons/logo.svg',
    badge: '/src/img/icons/logo.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('PATA', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[SW] Service Worker loaded successfully', VERSION);

