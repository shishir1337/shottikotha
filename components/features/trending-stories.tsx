"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, MessageSquare, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { storyService } from "@/services/story-service"
import { useToast } from "@/hooks/use-toast"
import type { Story } from "@/types"

export default function TrendingStories() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchTrendingStories = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)

      try {
        const data = await storyService.getTrendingStories()
        setStories(data)

        if (showRefreshing) {
          toast({
            title: "Refreshed",
            description: "Latest trending stories have been loaded",
            duration: 2000,
          })
        }
      } catch (error) {
        console.error("Error fetching trending stories:", error)
        toast({
          title: "Error",
          description: "Failed to load trending stories. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    fetchTrendingStories()
  }, [fetchTrendingStories])

  const handleRefresh = () => {
    fetchTrendingStories(true)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-3 md:p-4 flex items-start gap-3">
              <div className="flex-none w-6 h-6 rounded-full">
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold">Trending Now</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          <span className="sr-only md:not-sr-only">{refreshing ? "Refreshing..." : "Refresh"}</span>
        </Button>
      </div>

      {stories.map((story, index) => (
        <Link href={`/stories/${story.id}`} key={story.id} className="block group">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-3 md:p-4 flex items-start gap-3">
              <div className="flex-none w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-medium text-sm md:text-base truncate group-hover:text-primary transition-colors">
                    {story.title}
                  </h3>
                  <Badge
                    variant={
                      story.category === "Positive"
                        ? "default"
                        : story.category === "Negative"
                          ? "destructive"
                          : "outline"
                    }
                    className="text-xs whitespace-nowrap"
                  >
                    {story.category}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    About {story.company} • {story.date}
                  </p>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <div className="flex items-center text-xs">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      <span>{story.likes}</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      <span>{story.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
