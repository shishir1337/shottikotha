import {
  ALL_STORIES,
  TRENDING_STORIES,
  MOST_DISCUSSED_STORIES,
  RECENT_STORIES,
  STORY_DETAILS,
  SAVED_STORIES,
  MY_STORIES,
} from "@/constants/stories"
import type { Story, Comment } from "@/types"

// In-memory data store (will be replaced with database later)
let stories = [...ALL_STORIES]
let trendingStories = [...TRENDING_STORIES]
let discussedStories = [...MOST_DISCUSSED_STORIES]
let recentStories = [...RECENT_STORIES]
const storyDetails = { ...STORY_DETAILS }
let savedStories = [...SAVED_STORIES]
let myStories = [...MY_STORIES]

// This service will be replaced with actual database calls later
export const dataService = {
  // Stories
  getAllStories: (searchTerm = "", category = "all", sortBy = "recent") => {
    let filteredStories = [...stories]

    // Apply filters
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filteredStories = filteredStories.filter(
        (story) =>
          story.title.toLowerCase().includes(term) ||
          story.company.toLowerCase().includes(term) ||
          story.content.toLowerCase().includes(term),
      )
    }

    if (category !== "all") {
      filteredStories = filteredStories.filter((story) => story.category.toLowerCase() === category.toLowerCase())
    }

    // Apply sorting
    switch (sortBy) {
      case "recent":
        filteredStories.sort((a, b) => Number.parseInt(b.id) - Number.parseInt(a.id))
        break
      case "popular":
        filteredStories.sort((a, b) => b.likes - a.likes)
        break
      case "controversial":
        filteredStories.sort((a, b) => b.comments + b.dislikes - (a.comments + a.dislikes))
        break
    }

    return filteredStories
  },

  getTrendingStories: () => {
    return [...trendingStories]
  },

  getMostDiscussedStories: () => {
    return [...discussedStories]
  },

  getRecentStories: () => {
    return [...recentStories]
  },

  getStoryById: (id: string) => {
    return storyDetails[id] ? { ...storyDetails[id] } : null
  },

  createStory: (storyData: any) => {
    const newStory: Story = {
      id: `new-${Date.now()}`,
      title: storyData.title,
      company: storyData.company,
      content: storyData.content,
      category: storyData.category,
      likes: 0,
      dislikes: 0,
      comments: 0,
      date: "Just now",
    }

    // Add to our in-memory stores
    stories = [newStory, ...stories]
    recentStories = [newStory, ...recentStories].slice(0, 5)

    // Add to story details
    storyDetails[newStory.id] = {
      ...newStory,
      comments: [],
    }

    // Add to my stories
    myStories = [newStory, ...myStories]

    return newStory
  },

  // New methods for handling likes/dislikes with proper toggling
  likeStory: (id: string) => {
    // Update in all collections
    const updateLikes = (storyList: Story[]) => {
      return storyList.map((story) => (story.id === id ? { ...story, likes: story.likes + 1 } : story))
    }

    stories = updateLikes(stories)
    trendingStories = updateLikes(trendingStories)
    discussedStories = updateLikes(discussedStories)
    recentStories = updateLikes(recentStories)
    savedStories = updateLikes(savedStories)
    myStories = updateLikes(myStories)

    // Update in story details
    if (storyDetails[id]) {
      storyDetails[id].likes += 1
    }

    return true
  },

  unlikeStory: (id: string) => {
    // Update in all collections
    const updateLikes = (storyList: Story[]) => {
      return storyList.map((story) => (story.id === id ? { ...story, likes: Math.max(0, story.likes - 1) } : story))
    }

    stories = updateLikes(stories)
    trendingStories = updateLikes(trendingStories)
    discussedStories = updateLikes(discussedStories)
    recentStories = updateLikes(recentStories)
    savedStories = updateLikes(savedStories)
    myStories = updateLikes(myStories)

    // Update in story details
    if (storyDetails[id]) {
      storyDetails[id].likes = Math.max(0, storyDetails[id].likes - 1)
    }

    return true
  },

  dislikeStory: (id: string) => {
    // Update in all collections
    const updateDislikes = (storyList: Story[]) => {
      return storyList.map((story) => (story.id === id ? { ...story, dislikes: (story.dislikes || 0) + 1 } : story))
    }

    stories = updateDislikes(stories)
    trendingStories = updateDislikes(trendingStories)
    discussedStories = updateDislikes(discussedStories)
    recentStories = updateDislikes(recentStories)
    savedStories = updateDislikes(savedStories)
    myStories = updateDislikes(myStories)

    // Update in story details
    if (storyDetails[id]) {
      storyDetails[id].dislikes = (storyDetails[id].dislikes || 0) + 1
    }

    return true
  },

  undislikeStory: (id: string) => {
    // Update in all collections
    const updateDislikes = (storyList: Story[]) => {
      return storyList.map((story) =>
        story.id === id ? { ...story, dislikes: Math.max(0, (story.dislikes || 0) - 1) } : story,
      )
    }

    stories = updateDislikes(stories)
    trendingStories = updateDislikes(trendingStories)
    discussedStories = updateDislikes(discussedStories)
    recentStories = updateDislikes(recentStories)
    savedStories = updateDislikes(savedStories)
    myStories = updateDislikes(myStories)

    // Update in story details
    if (storyDetails[id]) {
      storyDetails[id].dislikes = Math.max(0, (storyDetails[id].dislikes || 0) - 1)
    }

    return true
  },

  switchLikeToDislike: (id: string) => {
    // First unlike
    dataService.unlikeStory(id)
    // Then dislike
    dataService.dislikeStory(id)
    return true
  },

  switchDislikeToLike: (id: string) => {
    // First undislike
    dataService.undislikeStory(id)
    // Then like
    dataService.likeStory(id)
    return true
  },

  // Comments
  getComments: (storyId: string) => {
    return storyDetails[storyId]?.comments || []
  },

  addComment: (storyId: string, content: string) => {
    if (!storyDetails[storyId]) return null

    const newComment: Comment = {
      id: `c${Date.now()}`,
      author: "Anonymous",
      content,
      date: "Just now",
      likes: 0,
      dislikes: 0,
    }

    // Add comment to story
    storyDetails[storyId].comments.push(newComment)

    // Update comment count in all collections
    const updateCommentCount = (storyList: Story[]) => {
      return storyList.map((story) => (story.id === storyId ? { ...story, comments: story.comments + 1 } : story))
    }

    stories = updateCommentCount(stories)
    trendingStories = updateCommentCount(trendingStories)
    discussedStories = updateCommentCount(discussedStories)
    recentStories = updateCommentCount(recentStories)
    savedStories = updateCommentCount(savedStories)
    myStories = updateCommentCount(myStories)

    return newComment
  },

  likeComment: (storyId: string, commentId: string) => {
    if (!storyDetails[storyId]) return false

    const commentIndex = storyDetails[storyId].comments.findIndex((c) => c.id === commentId)
    if (commentIndex === -1) return false

    storyDetails[storyId].comments[commentIndex].likes += 1
    return true
  },

  unlikeComment: (storyId: string, commentId: string) => {
    if (!storyDetails[storyId]) return false

    const commentIndex = storyDetails[storyId].comments.findIndex((c) => c.id === commentId)
    if (commentIndex === -1) return false

    storyDetails[storyId].comments[commentIndex].likes = Math.max(
      0,
      storyDetails[storyId].comments[commentIndex].likes - 1,
    )
    return true
  },

  dislikeComment: (storyId: string, commentId: string) => {
    if (!storyDetails[storyId]) return false

    const commentIndex = storyDetails[storyId].comments.findIndex((c) => c.id === commentId)
    if (commentIndex === -1) return false

    storyDetails[storyId].comments[commentIndex].dislikes += 1
    return true
  },

  undislikeComment: (storyId: string, commentId: string) => {
    if (!storyDetails[storyId]) return false

    const commentIndex = storyDetails[storyId].comments.findIndex((c) => c.id === commentId)
    if (commentIndex === -1) return false

    storyDetails[storyId].comments[commentIndex].dislikes = Math.max(
      0,
      storyDetails[storyId].comments[commentIndex].dislikes - 1,
    )
    return true
  },

  switchLikeToDislikeComment: (storyId: string, commentId: string) => {
    dataService.unlikeComment(storyId, commentId)
    dataService.dislikeComment(storyId, commentId)
    return true
  },

  switchDislikeToLikeComment: (storyId: string, commentId: string) => {
    dataService.undislikeComment(storyId, commentId)
    dataService.likeComment(storyId, commentId)
    return true
  },

  // User
  getSavedStories: () => {
    return [...savedStories]
  },

  saveStory: (story: Story) => {
    // Check if already saved
    const existingIndex = savedStories.findIndex((s) => s.id === story.id)
    if (existingIndex !== -1) return true

    savedStories = [story, ...savedStories]
    return true
  },

  unsaveStory: (storyId: string) => {
    savedStories = savedStories.filter((story) => story.id !== storyId)
    return true
  },

  getMyStories: () => {
    return [...myStories]
  },
}
