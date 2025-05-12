"use client"

import { useRef, useEffect, useState } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import StoryCard from "@/components/features/story-card"
import StorySkeleton from "@/components/features/story-skeleton"
import type { Story } from "@/types"

interface VirtualizedStoryListProps {
  stories: Story[]
  loading: boolean
  onLike: (id: string) => void
  onDislike: (id: string) => void
  skeletonCount?: number
}

export default function VirtualizedStoryList({
  stories,
  loading,
  onLike,
  onDislike,
  skeletonCount = 6,
}: VirtualizedStoryListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [parentWidth, setParentWidth] = useState(0)

  // Calculate columns based on parent width
  const getColumns = (width: number) => {
    if (width < 640) return 1 // Mobile: 1 column
    if (width < 1024) return 2 // Tablet: 2 columns
    return 3 // Desktop: 3 columns
  }

  const columns = getColumns(parentWidth)

  // Create rows from items based on column count
  const rows = loading
    ? Array(Math.ceil(skeletonCount / columns))
        .fill(0)
        .map((_, i) => ({ id: `skeleton-${i}`, isLoading: true }))
    : Array(Math.ceil(stories.length / columns))
        .fill(0)
        .map((_, i) => ({
          id: `row-${i}`,
          isLoading: false,
          items: stories.slice(i * columns, (i + 1) * columns),
        }))

  // Update parent width on resize
  useEffect(() => {
    if (!parentRef.current) return

    const updateWidth = () => {
      if (parentRef.current) {
        setParentWidth(parentRef.current.offsetWidth)
      }
    }

    // Initial measurement
    updateWidth()

    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(parentRef.current)

    return () => {
      if (parentRef.current) {
        resizeObserver.unobserve(parentRef.current)
      }
    }
  }, [])

  // Set up virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 350, // Estimated row height
    overscan: 5, // Number of items to render outside of the visible area
  })

  return (
    <div
      ref={parentRef}
      className="w-full overflow-auto"
      style={{ height: "calc(100vh - 200px)", maxHeight: "1200px" }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index]

          return (
            <div
              key={row.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className={`grid grid-cols-${columns} gap-4 md:gap-6 w-full`}>
                {row.isLoading
                  ? Array(columns)
                      .fill(0)
                      .map((_, i) => <StorySkeleton key={`skeleton-${virtualRow.index}-${i}`} />)
                  : row.items.map((story) => (
                      <StoryCard key={story.id} story={story} onLike={onLike} onDislike={onDislike} />
                    ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
