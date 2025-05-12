"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, ThumbsUp, ThumbsDown, Share2, Send, Bookmark, Flag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ScrollToTop from "@/components/ui/scroll-to-top"
import BottomNavigation from "@/components/ui/bottom-navigation"
import { storyService } from "@/services/story-service"
import { getInteraction } from "@/lib/interaction-store"
import type { Story, Comment } from "@/types"
import { ModeToggle } from "@/components/ui/mode-toggle"
import CommentSkeleton from "@/components/features/comment-skeleton"

export default function StoryPage() {
  const params = useParams()
  const storyId = params.id as string
  const { toast } = useToast()
  const [story, setStory] = useState<(Story & { comments: Comment[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [likes, setLikes] = useState(0)
  const [dislikes, setDislikes] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [userInteraction, setUserInteraction] = useState<"like" | "dislike" | null>(null)
  const [commentInteractions, setCommentInteractions] = useState<Record<string, "like" | "dislike" | null>>({})

  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true)
      try {
        const storyData = await storyService.getStoryById(storyId)
        if (storyData) {
          setStory(storyData)
          setLikes(storyData.likes)
          setDislikes(storyData.dislikes || 0)
          setComments(storyData.comments)

          // Get user's interaction with this story
          const interaction = getInteraction("story", storyId)
          setUserInteraction(interaction)

          // Get user's interactions with comments
          const commentInteractionsObj: Record<string, "like" | "dislike" | null> = {}
          storyData.comments.forEach((comment) => {
            commentInteractionsObj[comment.id] = getInteraction("comment", comment.id)
          })
          setCommentInteractions(commentInteractionsObj)
        }
      } catch (error) {
        console.error("Error fetching story:", error)
        toast({
          title: "Error",
          description: "Failed to load the story. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStory()
  }, [storyId, toast])

  const handleLike = useCallback(async () => {
    try {
      const success = await storyService.likeStory(storyId)
      if (success) {
        // Update UI based on current state
        if (userInteraction === "like") {
          // User is unliking
          setLikes(likes - 1)
          setUserInteraction(null)
        } else if (userInteraction === "dislike") {
          // User is switching from dislike to like
          setLikes(likes + 1)
          setDislikes(dislikes - 1)
          setUserInteraction("like")
        } else {
          // User is liking for the first time
          setLikes(likes + 1)
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
  }, [storyId, userInteraction, likes, dislikes, toast])

  const handleDislike = useCallback(async () => {
    try {
      const success = await storyService.dislikeStory(storyId)
      if (success) {
        // Update UI based on current state
        if (userInteraction === "dislike") {
          // User is undisliking
          setDislikes(dislikes - 1)
          setUserInteraction(null)
        } else if (userInteraction === "like") {
          // User is switching from like to dislike
          setDislikes(dislikes + 1)
          setLikes(likes - 1)
          setUserInteraction("dislike")
        } else {
          // User is disliking for the first time
          setDislikes(dislikes + 1)
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
  }, [storyId, userInteraction, likes, dislikes, toast])

  const handleCommentLike = useCallback(
    async (commentId: string) => {
      try {
        const success = await storyService.likeComment(storyId, commentId)
        if (success) {
          const currentInteraction = commentInteractions[commentId]

          // Update UI based on current state
          if (currentInteraction === "like") {
            // User is unliking
            setComments(
              comments.map((comment) =>
                comment.id === commentId ? { ...comment, likes: Math.max(0, comment.likes - 1) } : comment,
              ),
            )
            setCommentInteractions({
              ...commentInteractions,
              [commentId]: null,
            })
          } else if (currentInteraction === "dislike") {
            // User is switching from dislike to like
            setComments(
              comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, likes: comment.likes + 1, dislikes: Math.max(0, comment.dislikes - 1) }
                  : comment,
              ),
            )
            setCommentInteractions({
              ...commentInteractions,
              [commentId]: "like",
            })
          } else {
            // User is liking for the first time
            setComments(
              comments.map((comment) =>
                comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment,
              ),
            )
            setCommentInteractions({
              ...commentInteractions,
              [commentId]: "like",
            })
          }
        }
      } catch (error) {
        console.error("Error liking comment:", error)
        toast({
          title: "Error",
          description: "Failed to like the comment. Please try again.",
          variant: "destructive",
        })
      }
    },
    [storyId, commentInteractions, comments, toast],
  )

  const handleCommentDislike = useCallback(
    async (commentId: string) => {
      try {
        const success = await storyService.dislikeComment(storyId, commentId)
        if (success) {
          const currentInteraction = commentInteractions[commentId]

          // Update UI based on current state
          if (currentInteraction === "dislike") {
            // User is undisliking
            setComments(
              comments.map((comment) =>
                comment.id === commentId ? { ...comment, dislikes: Math.max(0, comment.dislikes - 1) } : comment,
              ),
            )
            setCommentInteractions({
              ...commentInteractions,
              [commentId]: null,
            })
          } else if (currentInteraction === "like") {
            // User is switching from like to dislike
            setComments(
              comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, dislikes: comment.dislikes + 1, likes: Math.max(0, comment.likes - 1) }
                  : comment,
              ),
            )
            setCommentInteractions({
              ...commentInteractions,
              [commentId]: "dislike",
            })
          } else {
            // User is disliking for the first time
            setComments(
              comments.map((comment) =>
                comment.id === commentId ? { ...comment, dislikes: comment.dislikes + 1 } : comment,
              ),
            )
            setCommentInteractions({
              ...commentInteractions,
              [commentId]: "dislike",
            })
          }
        }
      } catch (error) {
        console.error("Error disliking comment:", error)
        toast({
          title: "Error",
          description: "Failed to dislike the comment. Please try again.",
          variant: "destructive",
        })
      }
    },
    [storyId, commentInteractions, comments, toast],
  )

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) return

    setSubmittingComment(true)
    try {
      const newCommentObj = await storyService.addComment(storyId, newComment)
      setComments([...comments, newCommentObj])
      setNewComment("")

      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingComment(false)
    }
  }, [storyId, newComment, comments, toast])

  const handleBookmark = useCallback(async () => {
    try {
      if (isBookmarked) {
        const success = await storyService.unsaveStory(storyId)
        if (success) {
          setIsBookmarked(false)
          toast({
            title: "Removed from bookmarks",
            description: "Story removed from your saved items",
            duration: 2000,
          })
        }
      } else if (story) {
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
  }, [storyId, isBookmarked, story, toast])

  const handleShare = useCallback(() => {
    // URL to share
    const url = `${window.location.origin}/stories/${storyId}`

    // Try to use the Web Share API if available
    if (navigator.share && typeof navigator.share === "function") {
      navigator
        .share({
          title: story?.title || "Shared Story",
          text: `Check out this story about ${story?.company} on Shotti Kotha`,
          url: url,
        })
        .catch((err) => {
          console.error("Error sharing:", err)
          // Fall back to clipboard if sharing fails
          copyToClipboard(url)
        })
    } else {
      // Fall back to clipboard for browsers without Web Share API
      copyToClipboard(url)
    }
  }, [storyId, story?.title, story?.company, toast])

  const handleReport = useCallback(() => {
    toast({
      title: "Story reported",
      description: "Thank you for helping keep our community safe",
      duration: 2000,
    })
  }, [toast])

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

  if (loading) {
    return (
      <div className="container mx-auto py-4 md:py-8 px-4 max-w-full md:max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" className="mb-4 md:mb-6" size="sm" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <ModeToggle />
        </div>

        <Card>
          <CardHeader className="space-y-2 md:space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2 w-3/4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <div className="flex items-center space-x-3 md:space-x-4 pt-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 md:mt-8 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
          </div>

          <div className="flex items-start space-x-3 md:space-x-4">
            <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-20 w-full rounded-md" />
              <div className="flex justify-end mt-2">
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4 md:space-y-6">
            {[...Array(3)].map((_, i) => (
              <CommentSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold">Story not found</h1>
        <p className="text-muted-foreground mt-2">The story you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-6" asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 max-w-full md:max-w-3xl pb-20 md:pb-8">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" className="mb-4 md:mb-6" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <ModeToggle />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardHeader className="space-y-2 md:space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{story.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">About {story.company}</p>
              </div>
              <Badge
                variant={
                  story.category === "Positive" ? "default" : story.category === "Negative" ? "destructive" : "outline"
                }
                className="text-xs whitespace-nowrap"
              >
                {story.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6 md:h-8 md:w-8">
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <span>Anonymous</span>
              </div>
              <span className="text-muted-foreground">{story.date}</span>
            </div>

            <div
              className="text-sm md:text-base leading-relaxed prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: story.content }}
            />

            <div className="flex flex-wrap items-center gap-2 md:gap-3 pt-2">
              <Button
                variant={userInteraction === "like" ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                className="flex items-center space-x-1 h-8 md:h-9"
              >
                <ThumbsUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">{likes}</span>
              </Button>
              <Button
                variant={userInteraction === "dislike" ? "default" : "outline"}
                size="sm"
                onClick={handleDislike}
                className="flex items-center space-x-1 h-8 md:h-9"
              >
                <ThumbsDown className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">{dislikes}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-1 h-8 md:h-9"
              >
                <Share2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">Share</span>
              </Button>
              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                onClick={handleBookmark}
                className="flex items-center space-x-1 h-8 md:h-9"
              >
                <Bookmark className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isBookmarked ? "fill-current" : ""}`} />
                <span className="text-xs md:text-sm">Save</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReport}
                className="flex items-center space-x-1 h-8 md:h-9 ml-auto"
              >
                <Flag className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="mt-6 md:mt-8 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold">Comments ({comments.length})</h2>
        </div>

        <div className="flex items-start space-x-3 md:space-x-4">
          <Avatar className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="resize-none text-sm md:text-base min-h-[80px]"
            />
            <div className="flex justify-end mt-2">
              <Button onClick={handleAddComment} disabled={!newComment.trim() || submittingComment} size="sm">
                <Send className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                {submittingComment ? "Posting..." : "Comment"}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4 md:space-y-6">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-start space-x-3 md:space-x-4"
            >
              <Avatar className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1.5 md:space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm md:text-base">{comment.author}</span>
                  <span className="text-xs text-muted-foreground">{comment.date}</span>
                </div>
                <p className="text-sm md:text-base">{comment.content}</p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={commentInteractions[comment.id] === "like" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => handleCommentLike(comment.id)}
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    <span className="text-xs">{comment.likes}</span>
                  </Button>
                  <Button
                    variant={commentInteractions[comment.id] === "dislike" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => handleCommentDislike(comment.id)}
                  >
                    <ThumbsDown className="h-3 w-3 mr-1" />
                    <span className="text-xs">{comment.dislikes}</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ScrollToTop />
      <BottomNavigation />
    </div>
  )
}
