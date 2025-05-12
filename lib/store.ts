import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Story } from "@/types"

interface StoryState {
  // Cached stories
  recentStories: Story[]
  trendingStories: Story[]
  savedStories: string[] // IDs of saved stories

  // Interactions
  likedStories: Record<string, boolean>
  dislikedStories: Record<string, boolean>

  // Actions
  setRecentStories: (stories: Story[]) => void
  setTrendingStories: (stories: Story[]) => void
  toggleSavedStory: (storyId: string) => void
  isStorySaved: (storyId: string) => boolean
  toggleLike: (storyId: string) => void
  toggleDislike: (storyId: string) => void
  getInteractionState: (storyId: string) => "like" | "dislike" | null
}

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      recentStories: [],
      trendingStories: [],
      savedStories: [],
      likedStories: {},
      dislikedStories: {},

      setRecentStories: (stories) => set({ recentStories: stories }),
      setTrendingStories: (stories) => set({ trendingStories: stories }),

      toggleSavedStory: (storyId) => {
        const { savedStories } = get()
        const isCurrentlySaved = savedStories.includes(storyId)

        if (isCurrentlySaved) {
          set({ savedStories: savedStories.filter((id) => id !== storyId) })
        } else {
          set({ savedStories: [...savedStories, storyId] })
        }
      },

      isStorySaved: (storyId) => {
        return get().savedStories.includes(storyId)
      },

      toggleLike: (storyId) => {
        const { likedStories, dislikedStories } = get()
        const isCurrentlyLiked = likedStories[storyId]

        // If already liked, unlike it
        if (isCurrentlyLiked) {
          const newLikedStories = { ...likedStories }
          delete newLikedStories[storyId]
          set({ likedStories: newLikedStories })
        }
        // If disliked, remove dislike and add like
        else if (dislikedStories[storyId]) {
          const newDislikedStories = { ...dislikedStories }
          delete newDislikedStories[storyId]
          set({
            likedStories: { ...likedStories, [storyId]: true },
            dislikedStories: newDislikedStories,
          })
        }
        // Otherwise, just like it
        else {
          set({ likedStories: { ...likedStories, [storyId]: true } })
        }
      },

      toggleDislike: (storyId) => {
        const { likedStories, dislikedStories } = get()
        const isCurrentlyDisliked = dislikedStories[storyId]

        // If already disliked, undislike it
        if (isCurrentlyDisliked) {
          const newDislikedStories = { ...dislikedStories }
          delete newDislikedStories[storyId]
          set({ dislikedStories: newDislikedStories })
        }
        // If liked, remove like and add dislike
        else if (likedStories[storyId]) {
          const newLikedStories = { ...likedStories }
          delete newLikedStories[storyId]
          set({
            dislikedStories: { ...dislikedStories, [storyId]: true },
            likedStories: newLikedStories,
          })
        }
        // Otherwise, just dislike it
        else {
          set({ dislikedStories: { ...dislikedStories, [storyId]: true } })
        }
      },

      getInteractionState: (storyId) => {
        const { likedStories, dislikedStories } = get()

        if (likedStories[storyId]) return "like"
        if (dislikedStories[storyId]) return "dislike"
        return null
      },
    }),
    {
      name: "story-storage",
      partialize: (state) => ({
        savedStories: state.savedStories,
        likedStories: state.likedStories,
        dislikedStories: state.dislikedStories,
      }),
    },
  ),
)
