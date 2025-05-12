"use client"

import type React from "react"

import { RefreshCw } from "lucide-react"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { cn } from "@/lib/utils"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  className?: string
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const { pullDistance, isRefreshing, isPulling } = usePullToRefresh({
    onRefresh,
  })

  return (
    <div className={cn("relative", className)}>
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          "absolute left-0 right-0 flex justify-center transition-transform",
          isPulling || isRefreshing ? "opacity-100" : "opacity-0",
        )}
        style={{
          transform: `translateY(${Math.max(0, pullDistance - 60)}px)`,
        }}
      >
        <div className="bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md">
          <RefreshCw
            className={cn(
              "h-6 w-6 text-primary transition-all",
              isRefreshing ? "animate-spin" : pullDistance > 60 ? "scale-110" : "",
            )}
            style={{
              transform: isPulling && !isRefreshing ? `rotate(${pullDistance * 2}deg)` : "",
            }}
          />
        </div>
      </div>

      {/* Main content */}
      {children}
    </div>
  )
}
