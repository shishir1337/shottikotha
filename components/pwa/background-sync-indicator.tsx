"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function BackgroundSyncIndicator() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingItems, setPendingItems] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "BACKGROUND_SYNC_STARTED") {
        setIsSyncing(true)
        setPendingItems(event.data.pendingItems || 0)
      } else if (event.data && event.data.type === "BACKGROUND_SYNC_COMPLETED") {
        setIsSyncing(false)
        setPendingItems(0)

        // Show a success toast
        toast({
          title: "Sync Complete",
          description: "Your offline actions have been synchronized.",
          duration: 3000,
        })
      } else if (event.data && event.data.type === "BACKGROUND_SYNC_FAILED") {
        setIsSyncing(false)

        // Show an error toast
        toast({
          title: "Sync Failed",
          description: "We'll try again when you're back online.",
          variant: "destructive",
          duration: 5000,
        })
      }
    })

    // Check for pending sync on load
    const checkPendingSyncs = async () => {
      try {
        const reg = await navigator.serviceWorker.ready

        // Check if backgroundSync is supported
        if ("sync" in reg) {
          // Request the service worker to check pending items
          navigator.serviceWorker.controller?.postMessage({
            type: "CHECK_PENDING_SYNCS",
          })
        }
      } catch (error) {
        console.error("Error checking pending syncs:", error)
      }
    }

    checkPendingSyncs()
  }, [toast])

  if (!isSyncing || pendingItems === 0) return null

  return (
    <div className="fixed bottom-20 right-4 z-40 flex items-center rounded-full bg-primary px-3 py-2 text-primary-foreground shadow-lg">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      <span className="text-xs font-medium">
        Syncing {pendingItems} {pendingItems === 1 ? "item" : "items"}...
      </span>
    </div>
  )
}
