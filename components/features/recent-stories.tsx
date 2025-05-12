"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, MessageSquare, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { storyService } from "@/services/story-service"
import { getInteraction } from "@/lib/interaction-store"
import type { Story } from "@/types"
import { useSwipeable } from "react-swipeable"
import { useToast } from "@/hooks/use-toast"
import DOMPurify from "dompurify"

export default function RecentStories() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [storyInteractions, setStoryInteractions] = useState<Record<string, "like" | "dislike" | null>>({})
  const { toast } = useToast()
  const storiesPerPage = 10

  const fetchRecentStories = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)

      try {
        const data = await storyService.getRecentStories()
        setStories(data)

        // Get user's interactions with these stories
        const interactionsObj: Record<string, "like" | "dislike" | null> = {}
        data.forEach((story) => {
          interactionsObj[story.id] = getInteraction("story", story.id)
        })
        setStoryInteractions(interactionsObj)

        if (showRefreshing) {
          toast({
            title: "Refreshed",
            description: "Latest stories have been loaded",
            duration: 2000,
          })
        }
      } catch (error) {
        console.error("Error fetching recent stories:", error)
        toast({
          title: "Error",
          description: "Failed to load stories. Please try again.",
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
    fetchRecentStories()
  }, [fetchRecentStories])

  const handleRefresh = () => {
    fetchRecentStories(true)
  }

  const handleLike = async (id: string) => {
    try {
      const success = await storyService.likeStory(id)
      if (success) {
        const currentInteraction = storyInteractions[id]

        // Update UI based on current state
        if (currentInteraction === "like") {
          // User is unliking
          setStories(
            stories.map((story) => (story.id === id ? { ...story, likes: Math.max(0, story.likes - 1) } : story)),
          )
          setStoryInteractions({
            ...storyInteractions,
            [id]: null,
          })
        } else if (currentInteraction === "dislike") {
          // User is switching from dislike to like
          setStories(
            stories.map((story) =>
              story.id === id
                ? {
                    ...story,
                    likes: story.likes + 1,
                    dislikes: Math.max(0, story.dislikes - 1),
                  }
                : story,
            ),
          )
          setStoryInteractions({
            ...storyInteractions,
            [id]: "like",
          })
        } else {
          // User is liking for the first time
          setStories(stories.map((story) => (story.id === id ? { ...story, likes: story.likes + 1 } : story)))
          setStoryInteractions({
            ...storyInteractions,
            [id]: "like",
          })
        }
      }
    } catch (error) {
      console.error(`Error liking story ${id}:`, error)
      toast({
        title: "Error",
        description: "Failed to like the story. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDislike = async (id: string) => {
    try {
      const success = await storyService.dislikeStory(id)
      if (success) {
        const currentInteraction = storyInteractions[id]

        // Update UI based on current state
        if (currentInteraction === "dislike") {
          // User is undisliking
          setStories(
            stories.map((story) => (story.id === id ? { ...story, dislikes: Math.max(0, story.dislikes - 1) } : story)),
          )
          setStoryInteractions({
            ...storyInteractions,
            [id]: null,
          })
        } else if (currentInteraction === "like") {
          // User is switching from like to dislike
          setStories(
            stories.map((story) =>
              story.id === id
                ? {
                    ...story,
                    dislikes: story.dislikes + 1,
                    likes: Math.max(0, story.likes - 1),
                  }
                : story,
            ),
          )
          setStoryInteractions({
            ...storyInteractions,
            [id]: "dislike",
          })
        } else {
          // User is disliking for the first time
          setStories(stories.map((story) => (story.id === id ? { ...story, dislikes: story.dislikes + 1 } : story)))
          setStoryInteractions({
            ...storyInteractions,
            [id]: "dislike",
          })
        }
      }
    } catch (error) {
      console.error(`Error disliking story ${id}:`, error)
      toast({
        title: "Error",
        description: "Failed to dislike the story. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Get current stories for pagination
  const indexOfLastStory = currentPage * storiesPerPage
  const indexOfFirstStory = indexOfLastStory - storiesPerPage
  const currentStories = stories.slice(indexOfFirstStory, indexOfLastStory)
  const totalPages = Math.ceil(stories.length / storiesPerPage)

  // Handle page change with scroll to top
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentPage < totalPages) {
        handlePageChange(currentPage + 1)
      }
    },
    onSwipedRight: () => {
      if (currentPage > 1) {
        handlePageChange(currentPage - 1)
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
  })

  if (loading) {
    return (
      <div className="space-y-3 md:space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start gap-3 md:gap-4">
                <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="flex items-center gap-1 md:gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex items-center space-x-2 pt-1">
                    <Skeleton className="h-7 w-12" />
                    <Skeleton className="h-7 w-12" />
                    <Skeleton className="h-7 w-12" />
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
    <div className="space-y-4" {...swipeHandlers}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold">Latest Stories</h2>
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

      <div className="space-y-3 md:space-y-4">
        {currentStories.map((story) => (
          <Card key={story.id} className="overflow-hidden">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start gap-3 md:gap-4">
                <Avatar className="h-8 w-8 md:h-10 md:w-10 mt-1 flex-shrink-0">
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="font-medium text-sm md:text-base">Anonymous</span>
                      <span className="text-xs md:text-sm text-muted-foreground">• {story.date}</span>
                    </div>
                    <Badge
                      variant={
                        story.category === "Positive"
                          ? "default"
                          : story.category === "Negative"
                            ? "destructive"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {story.category}
                    </Badge>
                  </div>
                  <Link href={`/stories/${story.id}`} className="hover:underline">
                    <p className="font-medium text-sm md:text-base">{story.title}</p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">About {story.company}</p>
                  </Link>
                  <p
                    className="text-xs md:text-sm text-muted-foreground line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(story.content) }}
                  ></p>
                  <div className="flex items-center space-x-1 md:space-x-2 pt-1">
                    <Button
                      variant={storyInteractions[story.id] === "like" ? "default" : "ghost"}
                      size="sm"
                      className="h-7 md:h-8 px-1 md:px-2"
                      onClick={() => handleLike(story.id)}
                    >
                      <ThumbsUp className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      <span className="text-xs md:text-sm">{story.likes}</span>
                    </Button>
                    <Button
                      variant={storyInteractions[story.id] === "dislike" ? "default" : "ghost"}
                      size="sm"
                      className="h-7 md:h-8 px-1 md:px-2"
                      onClick={() => handleDislike(story.id)}
                    >
                      <ThumbsDown className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      <span className="text-xs md:text-sm">{story.dislikes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 md:h-8 px-1 md:px-2" asChild>
                      <Link href={`/stories/${story.id}`}>
                        <MessageSquare className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        <span className="text-xs md:text-sm">{story.comments}</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) handlePageChange(currentPage - 1)
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(i + 1)
                  }}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < totalPages) handlePageChange(currentPage + 1)
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
