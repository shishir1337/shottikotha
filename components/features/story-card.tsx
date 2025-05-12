"use client"

import type React from "react"

import { useState, useEffect, memo, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, Bookmark, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getInteraction } from "@/lib/interaction-store"
import type { Story } from "@/types"
import { storyService } from "@/services/story-service"

interface StoryCardProps {
  story: Story
  onLike: (id: string) => void
  onDislike: (id: string) => void
  className?: string
}

function StoryCard({ story, onLike, onDislike, className }: StoryCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [userInteraction, setUserInteraction] = useState<"like" | "dislike" | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Get user's interaction with this story
    const interaction = getInteraction("story", story.id)
    setUserInteraction(interaction)
  }, [story.id])

  // Add useMemo for expensive content processing
  const processedContent = useMemo(() => {
    // Create a temporary div to parse HTML content
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = story.content

    // Get the text content without HTML tags
    const textContent = tempDiv.textContent || tempDiv.innerText || ""

    // Truncate the content
    return textContent.substring(0, 200) + (textContent.length > 200 ? "..." : "")
  }, [story.content])

  // Add useCallback for event handlers
  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      try {
        const success = await storyService.likeStory(story.id)
        if (success) {
          // Update UI based on current state
          if (userInteraction === "like") {
            // User is unliking
            onLike({ ...story, likes: story.likes - 1 }.id)
            setUserInteraction(null)
          } else if (userInteraction === "dislike") {
            // User is switching from dislike to like
            onLike({ ...story, likes: story.likes + 1, dislikes: story.dislikes - 1 }.id)
            setUserInteraction("like")
          } else {
            // User is liking for the first time
            onLike(story.id)
            setUserInteraction("like")
          }
        }
      } catch (error) {
        console.error("Error liking story:", error)
        toast({
          title: "Error",
          description: "Failed to like the story. Please try again.",
          variant: "destructive",
        })
      }
    },
    [story, userInteraction, onLike, toast],
  )

  const handleDislike = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      try {
        const success = await storyService.dislikeStory(story.id)
        if (success) {
          // Update UI based on current state
          if (userInteraction === "dislike") {
            // User is undisliking
            onDislike({ ...story, dislikes: story.dislikes - 1 }.id)
            setUserInteraction(null)
          } else if (userInteraction === "like") {
            // User is switching from like to dislike
            onDislike({ ...story, dislikes: story.dislikes + 1, likes: story.likes - 1 }.id)
            setUserInteraction("dislike")
          } else {
            // User is disliking for the first time
            onDislike(story.id)
            setUserInteraction("dislike")
          }
        }
      } catch (error) {
        console.error("Error disliking story:", error)
        toast({
          title: "Error",
          description: "Failed to dislike the story. Please try again.",
          variant: "destructive",
        })
      }
    },
    [story, userInteraction, onDislike, toast],
  )

  const handleBookmark = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      try {
        if (isBookmarked) {
          const success = await storyService.unsaveStory(story.id)
          if (success) {
            setIsBookmarked(false)
            toast({
              title: "Removed from bookmarks",
              description: "Story removed from your saved items",
              duration: 2000,
            })
          }
        } else {
          const success = await storyService.saveStory(story)
          if (success) {
            setIsBookmarked(true)
            toast({
              title: "Added to bookmarks",
              description: "Story saved for later reading",
              duration: 2000,
            })
          }
        }
      } catch (error) {
        console.error("Error toggling bookmark:", error)
        toast({
          title: "Error",
          description: "Failed to update bookmarks. Please try again.",
          variant: "destructive",
        })
      }
    },
    [story, isBookmarked, toast],
  )

  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // URL to share
      const url = `${window.location.origin}/stories/${story.id}`

      // Try to use the Web Share API if available
      if (navigator.share && typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: story.title,
            text: `Check out this story about ${story.company} on Shotti Kotha`,
            url: url,
          })
        } catch (err) {
          console.error("Error sharing:", err)
          // Fall back to clipboard if sharing fails
          copyToClipboard(url)
        }
      } else {
        // Fall back to clipboard for browsers without Web Share API
        copyToClipboard(url)
      }
    },
    [story, toast],
  )

  // Add this helper function for clipboard operations
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Link copied",
          description: "Story link copied to clipboard",
          duration: 2000,
        })
      },
      () => {
        // If even clipboard fails, show a manual copy message
        toast({
          title: "Unable to copy automatically",
          description: `Please copy this link manually: ${text}`,
          duration: 5000,
        })
      },
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className={className}
    >
      <Link href={`/stories/${story.id}`} className="block h-full">
        <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-2 space-y-2">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="font-semibold text-base md:text-lg line-clamp-2">{story.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">About {story.company}</p>
              </div>
              <Badge
                variant={
                  story.category === "Positive" ? "default" : story.category === "Negative" ? "destructive" : "outline"
                }
                className="whitespace-nowrap text-xs"
              >
                {story.category}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex-grow py-2">
            <div className="text-sm text-muted-foreground line-clamp-3 md:line-clamp-4 prose prose-sm dark:prose-invert max-w-none">
              {processedContent}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 md:space-y-4 pt-2">
            <div className="flex items-center justify-between w-full text-xs md:text-sm">
              <div className="flex items-center space-x-1">
                <Avatar className="h-5 w-5 md:h-6 md:w-6">
                  <AvatarFallback className="text-xs">A</AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground">Anonymous</span>
              </div>
              <span className="text-muted-foreground">{story.date}</span>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-1 md:space-x-2">
                <Button
                  variant={userInteraction === "like" ? "default" : "ghost"}
                  size="sm"
                  className="h-7 md:h-8 px-1 md:px-2"
                  onClick={handleLike}
                >
                  <ThumbsUp className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  <span className="text-xs md:text-sm">{story.likes}</span>
                </Button>
                <Button
                  variant={userInteraction === "dislike" ? "default" : "ghost"}
                  size="sm"
                  className="h-7 md:h-8 px-1 md:px-2"
                  onClick={handleDislike}
                >
                  <ThumbsDown className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  <span className="text-xs md:text-sm">{story.dislikes || 0}</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-7 md:h-8 px-1 md:px-2">
                  <MessageSquare className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  <span className="text-xs md:text-sm">{story.comments}</span>
                </Button>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant={isBookmarked ? "default" : "ghost"}
                  size="sm"
                  className="h-7 md:h-8 px-1 md:px-2"
                  onClick={handleBookmark}
                >
                  <Bookmark className={cn("h-3 w-3 md:h-4 md:w-4", isBookmarked ? "fill-current" : "")} />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 md:h-8 px-1 md:px-2" onClick={handleShare}>
                  <Share2 className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 md:h-8 px-1 md:px-2"
                  onClick={() => copyToClipboard(`${window.location.origin}/stories/${story.id}`)}
                >
                  <Copy className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(StoryCard)
