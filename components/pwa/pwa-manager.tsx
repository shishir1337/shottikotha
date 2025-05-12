"use client"

import { useEffect } from "react"
import InstallPWAPrompt from "./install-prompt"
import UpdatePrompt from "./update-prompt"
import SplashScreen from "./splash-screen"
import BackgroundSyncIndicator from "./background-sync-indicator"

export default function PWAManager() {
  useEffect(() => {
    if (typeof window === "undefined") return

    // Register for periodic background sync if supported
    const registerPeriodicSync = async () => {
      if ("serviceWorker" in navigator && "periodicSync" in navigator.serviceWorker) {
        try {
          const registration = await navigator.serviceWorker.ready

          // Check if periodic background sync is available
          const status = await navigator.permissions.query({
            name: "periodic-background-sync" as any,
          })

          if (status.state === "granted") {
            // Register for periodic background sync
            await (registration as any).periodicSync.register("update-content", {
              minInterval: 24 * 60 * 60 * 1000, // Once per day
            })
            console.log("Periodic background sync registered")
          }
        } catch (error) {
          console.error("Error registering periodic background sync:", error)
        }
      }
    }

    // Register for app badge if supported
    const registerBadge = async () => {
      if ("setAppBadge" in navigator) {
        try {
          // Clear any existing badges
          await (navigator as any).clearAppBadge()
        } catch (error) {
          console.error("Error clearing app badge:", error)
        }
      }
    }

    registerPeriodicSync()
    registerBadge()

    // Listen for online/offline events
    const handleOnline = () => {
      // Notify service worker that we're back online
      navigator.serviceWorker.controller?.postMessage({
        type: "ONLINE_STATUS_CHANGE",
        online: true,
      })
    }

    const handleOffline = () => {
      // Notify service worker that we're offline
      navigator.serviceWorker.controller?.postMessage({
        type: "ONLINE_STATUS_CHANGE",
        online: false,
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <>
      <InstallPWAPrompt />
      <UpdatePrompt />
      <SplashScreen />
      <BackgroundSyncIndicator />
    </>
  )
}
