// Service Worker for PWA functionality
// Basic offline support and caching

const CACHE_NAME = 'aas-v1'
const urlsToCache = [
  '/',
  '/archive',
  '/blog',
  '/about',
  '/Favicon Logo AAS.jpeg',
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.error('Service Worker install failed:', err))
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip API routes and external resources
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('googleapis.com') ||
    event.request.url.includes('supabase.co')
  ) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache)
            })

          return response
        })
      })
      .catch(() => {
        // Return offline page if available
        return caches.match('/offline')
      })
  )
})














