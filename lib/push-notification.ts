export async function subscribeToPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications are not supported in this browser")
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready

    // Check if we already have a subscription
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      // Get the server's public key
      const response = await fetch("/api/push/vapid-public-key")
      const vapidPublicKey = await response.text()

      // Convert the key to a Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

      // Subscribe the user
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })
    }

    // Send the subscription to the server
    await fetch("/api/push/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    })

    return true
  } catch (error) {
    console.error("Error subscribing to push notifications:", error)
    return false
  }
}

export async function unsubscribeFromPushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      // Unsubscribe from push notifications
      await subscription.unsubscribe()

      // Notify the server
      await fetch("/api/push/unregister", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })
    }

    return true
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error)
    return false
  }
}

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
