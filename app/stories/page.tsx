"use client"

import { useState, useEffect, useCallback, Suspense, lazy } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Filter, RefreshCw } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import StorySkeleton from "@/components/features/story-skeleton"
import ScrollToTop from "@/components/ui/scroll-to-top"
import BottomNavigation from "@/components/ui/bottom-navigation"
import { storyService } from "@/services/story-service"
import type { Story } from "@/types"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { useToast } from "@/hooks/use-toast"
import SearchForm from "@/components/features/search-form"

// Lazy load the virtualized story list component
const VirtualizedStoryList = lazy(() => import("@/components/features/virtualized-story-list"))

export default function StoriesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialSearchTerm = searchParams.get("search") || ""

  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateRange, setDateRange] = useState([7]) // Days
  const [sortBy, setSortBy] = useState("recent")
  const { toast } = useToast()

  const fetchStories = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)

      try {
        const data = await storyService.getAllStories(searchTerm, categoryFilter, sortBy)
        setStories(data)

        if (showRefreshing) {
          toast({
            title: "Refreshed",
            description: "Latest stories have been loaded",
            duration: 2000,
          })
        }
      } catch (error) {
        console.error("Error fetching stories:", error)
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
    [searchTerm, categoryFilter, sortBy, toast],
  )

  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  // Update search term when URL parameter changes
  useEffect(() => {
    setSearchTerm(initialSearchTerm)
  }, [initialSearchTerm])

  const handleRefresh = useCallback(() => {
    fetchStories(true)
  }, [fetchStories])

  const handleLike = useCallback((id: string) => {
    setStories((prevStories) =>
      prevStories.map((story) => (story.id === id ? { ...story, likes: story.likes + 1 } : story)),
    )
    storyService.likeStory(id)
  }, [])

  const handleDislike = useCallback((id: string) => {
    setStories((prevStories) =>
      prevStories.map((story) => (story.id === id ? { ...story, dislikes: story.dislikes + 1 } : story)),
    )
    storyService.dislikeStory(id)
  }, [])

  // Handle search form submission
  const handleSearch = (term: string) => {
    setSearchTerm(term)

    // Update URL with search parameter
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set("search", term)
    } else {
      params.delete("search")
    }

    router.push(`/stories?${params.toString()}`)
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

      <div className="flex flex-col gap-4 mb-6 md:mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Browse Stories</h1>
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

        <div className="flex flex-col sm:flex-row w-full gap-3 md:gap-4">
          <div className="relative flex-1">
            <SearchForm className="w-full" defaultValue={searchTerm} placeholder="Search stories..." />
          </div>

          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="controversial">Controversial</SelectItem>
              </SelectContent>
            </Select>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Stories</SheetTitle>
                  <SheetDescription>Refine your search with additional filters</SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Date Range</h3>
                    <div className="space-y-4">
                      <Slider defaultValue={[7]} max={30} step={1} value={dateRange} onValueChange={setDateRange} />
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Today</span>
                        <span className="text-sm">{dateRange[0]} days</span>
                        <span className="text-xs text-muted-foreground">30 days</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDateRange([7])
                      }}
                    >
                      Reset Filters
                    </Button>
                    <Button>Apply Filters</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {stories.length === 0 && !loading ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">No stories found</h2>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria</p>
          <Button
            className="mt-4"
            onClick={() => {
              setSearchTerm("")
              setCategoryFilter("all")
              router.push("/stories")
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <StorySkeleton key={i} />
              ))}
            </div>
          }
        >
          <VirtualizedStoryList stories={stories} loading={loading} onLike={handleLike} onDislike={handleDislike} />
        </Suspense>
      )}

      <ScrollToTop />
      <BottomNavigation />
    </div>
  )
}
