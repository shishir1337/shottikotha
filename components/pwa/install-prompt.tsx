"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function InstallPWAPrompt() {
  const [isOpen, setIsOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)

      // Show the install prompt after 30 seconds if user hasn't dismissed it
      const hasPromptBeenShown = localStorage.getItem("pwaPromptShown")
      if (!hasPromptBeenShown) {
        setTimeout(() => {
          setIsOpen(true)
          localStorage.setItem("pwaPromptShown", "true")
        }, 30000)
      }
    })

    // Listen for successful installation
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      console.log("PWA was installed")
    })
  }, [])

  const handleInstallClick = () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }
      setDeferredPrompt(null)
    })

    setIsOpen(false)
  }

  if (isInstalled || !deferredPrompt) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Install Shotti Kotha</DialogTitle>
          <DialogDescription>Install our app on your home screen for a better experience.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-primary p-2">
              <Download className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Benefits of installing:</p>
              <ul className="text-sm text-muted-foreground">
                <li>• Works offline</li>
                <li>• Faster loading</li>
                <li>• Full-screen experience</li>
                <li>• Home screen icon</li>
              </ul>
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Maybe later
          </Button>
          <Button onClick={handleInstallClick}>Install Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
