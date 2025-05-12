"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function UpdatePrompt() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    // Check for service worker updates
    const checkForUpdates = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg) {
          setRegistration(reg)

          // Check if there's a waiting service worker
          if (reg.waiting) {
            setIsUpdateAvailable(true)
            setIsOpen(true)
          }

          // Listen for new service workers
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing
            if (!newWorker) return

            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setIsUpdateAvailable(true)
                setIsOpen(true)
              }
            })
          })
        }
      } catch (error) {
        console.error("Error checking for service worker updates:", error)
      }
    }

    // Listen for update messages from the service worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "CONTENT_UPDATED") {
        // Show a notification that new content is available
        setIsUpdateAvailable(true)
        setIsOpen(true)
      }
    })

    checkForUpdates()

    // Check for updates periodically
    const interval = setInterval(checkForUpdates, 60 * 60 * 1000) // Check every hour

    return () => clearInterval(interval)
  }, [])

  const handleUpdate = () => {
    if (!registration || !registration.waiting) return

    // Send a message to the waiting service worker to skip waiting
    registration.waiting.postMessage({ type: "SKIP_WAITING" })

    // Reload the page to activate the new service worker
    window.location.reload()
    setIsOpen(false)
  }

  if (!isUpdateAvailable) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Available</DialogTitle>
          <DialogDescription>
            A new version of Shotti Kotha is available. Update now for the latest features and improvements.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-4 py-4">
          <div className="rounded-full bg-primary p-2">
            <RefreshCw className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">What's new:</p>
            <ul className="text-sm text-muted-foreground">
              <li>• Improved performance</li>
              <li>• Bug fixes</li>
              <li>• New features</li>
            </ul>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Later
          </Button>
          <Button onClick={handleUpdate}>Update Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
