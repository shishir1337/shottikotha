"use client"

import { useOffline } from "@/hooks/use-offline"
import { WifiOff } from "lucide-react"

export function OfflineIndicator() {
  const isOffline = useOffline()

  if (!isOffline) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">You are offline</span>
    </div>
  )
}
