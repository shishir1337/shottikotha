"use client"

import { useState, useEffect, useCallback } from "react"

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>
  pullDownThreshold?: number
  maxPullDownDistance?: number
}

export function usePullToRefresh({
  onRefresh,
  pullDownThreshold = 80,
  maxPullDownDistance = 120,
}: PullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Only enable pull to refresh when at the top of the page
    if (window.scrollY <= 0) {
      setStartY(e.touches[0].clientY)
      setIsPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling) return

      const currentY = e.touches[0].clientY
      const distance = Math.max(0, currentY - startY)

      // Apply resistance to make the pull feel more natural
      const pullWithResistance = Math.min(maxPullDownDistance, distance * 0.4)

      if (pullWithResistance > 0) {
        // Prevent default scrolling behavior when pulling
        e.preventDefault()
        setPullDistance(pullWithResistance)
      }
    },
    [isPulling, startY, maxPullDownDistance],
  )

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return

    if (pullDistance >= pullDownThreshold) {
      setIsRefreshing(true)
      setPullDistance(0)

      try {
        await onRefresh()
      } catch (error) {
        console.error("Refresh failed:", error)
      } finally {
        setIsRefreshing(false)
      }
    } else {
      setPullDistance(0)
    }

    setIsPulling(false)
  }, [isPulling, pullDistance, pullDownThreshold, onRefresh])

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    pullDistance,
    isRefreshing,
    isPulling,
  }
}
