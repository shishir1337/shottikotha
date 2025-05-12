"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, TrendingUp, Flame, Clock } from "lucide-react"
import StoryCard from "@/components/features/story-card"
import StorySkeleton from "@/components/features/story-skeleton"
import ScrollToTop from "@/components/ui/scroll-to-top"
import BottomNavigation from "@/components/ui/bottom-navigation"
import { storyService } from "@/services/story-service"
import type { Story } from "@/types"
import { ModeToggle } from "@/components/ui/mode-toggle"

export default function TrendingPage() {
  const [activeTab, setActiveTab] = useState("trending")
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch stories based on active tab
    const fetchStories = async () => {
      setLoading(true)
      try {
        switch (activeTab) {
          case "trending":
            const trendingData = await storyService.getTrendingStories()
            setStories(trendingData)
            break
          case "discussed":
            const discussedData = await storyService.getMostDiscussedStories()
            setStories(discussedData)
            break
          case "recent":
            const recentData = await storyService.getRecentStories()
            setStories(recentData)
            break
          default:
            const defaultData = await storyService.getTrendingStories()
            setStories(defaultData)
        }
      } catch (error) {
        console.error("Error fetching stories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStories()
  }, [activeTab])

  const handleLike = (id: string) => {
    setStories(stories.map((story) => (story.id === id ? { ...story, likes: story.likes + 1 } : story)))
    storyService.likeStory(id)
  }

  const handleDislike = (id: string) => {
    setStories(stories.map((story) => (story.id === id ? { ...story, dislikes: story.dislikes + 1 } : story)))
    storyService.dislikeStory(id)
  }

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 pb-20 md:pb-8">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <ModeToggle />
      </div>

      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Trending Stories</h1>
      </div>

      <Tabs defaultValue="trending" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="trending" className="flex items-center gap-1">
            <Flame className="h-4 w-4" />
            <span>Trending</span>
          </TabsTrigger>
          <TabsTrigger value="discussed" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Most Discussed</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Recent</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <StorySkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} onLike={handleLike} onDislike={handleDislike} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discussed" className="mt-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <StorySkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} onLike={handleLike} onDislike={handleDislike} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <StorySkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {stories.map((story) => (
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
