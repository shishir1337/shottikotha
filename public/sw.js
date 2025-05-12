importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js")

// Set debug to false in production
workbox.setConfig({ debug: false })

const CACHE_NAME = "shotti-kotha-v1"
const HTML_CACHE_NAME = "shotti-kotha-html-v1"
const STATIC_CACHE_NAME = "shotti-kotha-static-v1"
const API_CACHE_NAME = "shotti-kotha-api-v1"
const IMAGE_CACHE_NAME = "shotti-kotha-images-v1"

// Default page to serve when offline and page isn't in cache
const FALLBACK_HTML_URL = "/offline"

// Register route for offline fallback
workbox.routing.registerRoute(
  ({ request }) => request.mode === "navigate",
  new workbox.strategies.NetworkFirst({
    cacheName: HTML_CACHE_NAME,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      {
        handlerDidError: async () => {
          return caches.match(FALLBACK_HTML_URL)
        },
      },
    ],
  }),
)

// Cache static assets with a Cache First strategy
workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === "style" || request.destination === "script" || request.destination === "font",
  new workbox.strategies.CacheFirst({
    cacheName: STATIC_CACHE_NAME,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  }),
)

// Cache images with a Cache First strategy
workbox.routing.registerRoute(
  ({ request }) => request.destination === "image",
  new workbox.strategies.CacheFirst({
    cacheName: IMAGE_CACHE_NAME,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 14 * 24 * 60 * 60, // 14 days
      }),
    ],
  }),
)

// Cache API responses with a Network First strategy
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new workbox.strategies.NetworkFirst({
    cacheName: API_CACHE_NAME,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 2 * 60 * 60, // 2 hours
      }),
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
)

// Background sync for offline form submissions
workbox.routing.registerRoute(
  ({ url }) =>
    url.pathname.startsWith("/api/stories") &&
    (url.pathname.includes("/like") || url.pathname.includes("/dislike") || url.pathname.includes("/comments")),
  new workbox.strategies.NetworkOnly({
    plugins: [
      new workbox.backgroundSync.BackgroundSyncPlugin("interactions-queue", {
        maxRetentionTime: 24 * 60, // Retry for up to 24 hours (specified in minutes)
      }),
    ],
  }),
  "POST",
)

// Background sync for story submissions
workbox.routing.registerRoute(
  ({ url }) => url.pathname === "/api/stories",
  new workbox.strategies.NetworkOnly({
    plugins: [
      new workbox.backgroundSync.BackgroundSyncPlugin("story-submissions-queue", {
        maxRetentionTime: 24 * 60, // Retry for up to 24 hours
      }),
    ],
  }),
  "POST",
)

// Cache the Google Fonts stylesheets with a Cache First strategy.
workbox.routing.registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new workbox.strategies.CacheFirst({
    cacheName: "google-fonts-stylesheets",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 5,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  }),
)

// Cache the Google Fonts webfont files with a Cache First strategy.
workbox.routing.registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new workbox.strategies.CacheFirst({
    cacheName: "google-fonts-webfonts",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  }),
)

// Handle service worker updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// Listen for push notifications
self.addEventListener("push", (event) => {
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const url = event.notification.data.url

      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus()
        }
      }

      // If no window/tab is open with the URL, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    }),
  )
})

// Periodic background sync for content updates
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "update-content") {
    event.waitUntil(updateContent())
  }
})

async function updateContent() {
  try {
    // Fetch latest stories
    const response = await fetch("/api/stories?limit=10")
    const data = await response.json()

    // Update cache with new stories
    const cache = await caches.open(API_CACHE_NAME)
    await cache.put("/api/stories?limit=10", new Response(JSON.stringify(data)))

    // Notify the client that new content is available
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({
        type: "CONTENT_UPDATED",
        stories: data.stories.length,
      })
    })
  } catch (error) {
    console.error("Background sync failed:", error)
  }
}

// Create a badge-specific icon
self.addEventListener("install", (event) => {
  // Create a small notification badge icon
  const createBadgeIcon = async () => {
    const cache = await caches.open(STATIC_CACHE_NAME)
    const canvas = new OffscreenCanvas(72, 72)
    const ctx = canvas.getContext("2d")

    // Draw a simple badge
    ctx.fillStyle = "#6366f1"
    ctx.beginPath()
    ctx.arc(36, 36, 36, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = "white"
    ctx.font = "bold 40px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("SK", 36, 36)

    const blob = await canvas.convertToBlob()
    const response = new Response(blob)

    return cache.put("/icons/badge-72x72.png", response)
  }

  event.waitUntil(createBadgeIcon())
})
