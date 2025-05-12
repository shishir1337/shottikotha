"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bookmark, Settings, User, Clock, ThumbsUp, MessageSquare, RefreshCw } from "lucide-react"
import StoryCard from "@/components/features/story-card"
import StorySkeleton from "@/components/features/story-skeleton"
import BottomNavigation from "@/components/ui/bottom-navigation"
import ScrollToTop from "@/components/ui/scroll-to-top"
import { storyService } from "@/services/story-service"
import type { Story } from "@/types"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { useToast } from "@/hooks/use-toast"

interface UserStats {
  storyCount: number
  commentCount: number
  memberSince: string
  anonymousId: string
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("saved")
  const [savedStories, setSavedStories] = useState<Story[]>([])
  const [myStories, setMyStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const { toast } = useToast()

  const fetchUserStats = async () => {
    try {
      setStatsLoading(true)
      const response = await fetch("/api/user/stats")

      if (!response.ok) {
        throw new Error("Failed to fetch user statistics")
      }

      const data = await response.json()
      setUserStats(data)
    } catch (error) {
      console.error("Error fetching user statistics:", error)
      toast({
        title: "Error",
        description: "Failed to load user statistics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchStories = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    else setLoading(true)

    try {
      if (activeTab === "saved") {
        const data = await storyService.getSavedStories()
        setSavedStories(data)
      } else {
        const data = await storyService.getMyStories()
        setMyStories(data)
      }

      if (showRefreshing) {
        toast({
          title: "Refreshed",
          description: `Your ${activeTab === "saved" ? "saved" : ""} stories have been updated`,
          duration: 2000,
        })
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} stories:`, error)
      toast({
        title: "Error",
        description: "Failed to load stories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStories()
  }, [activeTab])

  useEffect(() => {
    fetchUserStats()
  }, [])

  const handleRefresh = () => {
    fetchStories(true)
    fetchUserStats()
  }

  const handleLike = (id: string) => {
    if (activeTab === "saved") {
      setSavedStories(savedStories.map((story) => (story.id === id ? { ...story, likes: story.likes + 1 } : story)))
    } else {
      setMyStories(myStories.map((story) => (story.id === id ? { ...story, likes: story.likes + 1 } : story)))
    }
    storyService.likeStory(id)
  }

  const handleDislike = (id: string) => {
    if (activeTab === "saved") {
      setSavedStories(
        savedStories.map((story) => (story.id === id ? { ...story, dislikes: story.dislikes + 1 } : story)),
      )
    } else {
      setMyStories(myStories.map((story) => (story.id === id ? { ...story, dislikes: story.dislikes + 1 } : story)))
    }
    storyService.dislikeStory(id)
  }

  const currentStories = activeTab === "saved" ? savedStories : myStories

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 pb-20 md:pb-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-xl font-bold">
          Shotti Kotha
        </Link>
        <div className="flex items-center gap-2">
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
          <ModeToggle />
        </div>
      </div>

      <div className="mb-6 md:mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Avatar className="h-16 w-16 md:h-20 md:w-20">
                <AvatarFallback className="text-2xl">
                  {userStats?.anonymousId ? userStats.anonymousId.substring(0, 1).toUpperCase() : "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-xl md:text-2xl font-bold">
                  {statsLoading ? (
                    <span className="inline-block w-40 h-8 bg-muted animate-pulse rounded"></span>
                  ) : (
                    `Anonymous User ${userStats?.anonymousId ? `#${userStats.anonymousId.substring(0, 6)}` : ""}`
                  )}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Your profile is private and your stories are anonymous
                </p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                  <div className="flex items-center gap-1.5">
                    <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    {statsLoading ? (
                      <span className="inline-block w-20 h-5 bg-muted animate-pulse rounded"></span>
                    ) : (
                      <span className="text-sm">{userStats?.storyCount || 0} contributions</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    {statsLoading ? (
                      <span className="inline-block w-20 h-5 bg-muted animate-pulse rounded"></span>
                    ) : (
                      <span className="text-sm">{userStats?.commentCount || 0} comments</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {statsLoading ? (
                      <span className="inline-block w-32 h-5 bg-muted animate-pulse rounded"></span>
                    ) : (
                      <span className="text-sm">Member for {userStats?.memberSince || "Unknown"}</span>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1.5">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="saved" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="saved" className="flex items-center gap-1.5">
            <Bookmark className="h-4 w-4" />
            <span>Saved Stories</span>
          </TabsTrigger>
          <TabsTrigger value="my" className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            <span>My Stories</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(2)].map((_, i) => (
                <StorySkeleton key={i} />
              ))}
            </div>
          ) : savedStories.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved stories yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                  When you save stories, they'll appear here for easy access later.
                </p>
                <Button asChild>
                  <Link href="/stories">Browse Stories</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {savedStories.map((story) => (
                <StoryCard key={story.id} story={story} onLike={handleLike} onDislike={handleDislike} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="mt-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(2)].map((_, i) => (
                <StorySkeleton key={i} />
              ))}
            </div>
          ) : myStories.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">You haven't shared any stories yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                  Share your experiences to help others make informed decisions.
                </p>
                <Button asChild>
                  <Link href="/share">Share a Story</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {myStories.map((story) => (
                <StoryCard key={story.id} story={story} onLike={handleLike} onDislike={handleDislike} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ScrollToTop />
      <BottomNavigation />
    </div>
  )
}
