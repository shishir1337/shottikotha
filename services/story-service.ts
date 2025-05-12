import type { Story, Comment } from "@/types"
import { supabase } from "@/lib/supabase"
import { authService } from "@/lib/auth-service"
import { cache } from "@/lib/cache"
import { getInteraction, storeInteraction, removeInteraction } from "@/lib/interaction-store"

// Helper function to format story data
const formatStory = (story: any): Story => {
  return {
    id: story.id,
    title: story.title,
    company: story.company,
    content: story.content,
    category: story.category,
    likes: story.likes,
    dislikes: story.dislikes,
    comments: story.comments_count,
    date: formatDate(story.created_at),
  }
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60))
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`
    }
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
  } else if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7)
    return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`
  } else {
    return date.toLocaleDateString()
  }
}

// Helper function to format comment data
const formatComment = (comment: any): Comment => {
  return {
    id: comment.id,
    author: comment.author,
    content: comment.content,
    date: formatDate(comment.created_at),
    likes: comment.likes,
    dislikes: comment.dislikes,
  }
}

export const storyService = {
  // Get all stories with optional filtering
  getAllStories: async (searchTerm = "", category = "all", sortBy = "recent"): Promise<Story[]> => {
    // Create a cache key based on the parameters
    const cacheKey = `stories:${searchTerm}:${category}:${sortBy}`

    // Check if we have a cached response
    const cachedData = cache.get<Story[]>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    try {
      let query = supabase.from("stories").select("*")

      // Apply filters
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`)
      }

      if (category !== "all") {
        query = query.eq("category", category.charAt(0).toUpperCase() + category.slice(1))
      }

      // Apply sorting
      switch (sortBy) {
        case "recent":
          query = query.order("created_at", { ascending: false })
          break
        case "popular":
          query = query.order("likes", { ascending: false })
          break
        case "controversial":
          query = query.order("comments_count", { ascending: false }).order("dislikes", { ascending: false })
          break
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      const formattedStories = data.map(formatStory)

      // Cache the response for 5 minutes
      cache.set(cacheKey, formattedStories, 300)

      return formattedStories
    } catch (error) {
      console.error("Error fetching stories:", error)
      return []
    }
  },

  // Get trending stories
  getTrendingStories: async (): Promise<Story[]> => {
    const cacheKey = "stories:trending"
    const cachedData = cache.get<Story[]>(cacheKey)

    if (cachedData) {
      return cachedData
    }

    try {
      const { data, error } = await supabase.from("stories").select("*").order("likes", { ascending: false }).limit(10)

      if (error) {
        throw error
      }

      const formattedStories = data.map(formatStory)

      cache.set(cacheKey, formattedStories, 300) // Cache for 5 minutes
      return formattedStories
    } catch (error) {
      console.error("Error fetching trending stories:", error)
      return []
    }
  },

  // Get most discussed stories
  getMostDiscussedStories: async (): Promise<Story[]> => {
    const cacheKey = "stories:discussed"
    const cachedData = cache.get<Story[]>(cacheKey)

    if (cachedData) {
      return cachedData
    }

    try {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order("comments_count", { ascending: false })
        .limit(10)

      if (error) {
        throw error
      }

      const formattedStories = data.map(formatStory)

      cache.set(cacheKey, formattedStories, 300)
      return formattedStories
    } catch (error) {
      console.error("Error fetching discussed stories:", error)
      return []
    }
  },

  // Get recent stories
  getRecentStories: async (): Promise<Story[]> => {
    const cacheKey = "stories:recent"
    const cachedData = cache.get<Story[]>(cacheKey)

    if (cachedData) {
      return cachedData
    }

    try {
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) {
        throw error
      }

      const formattedStories = data.map(formatStory)

      cache.set(cacheKey, formattedStories, 300)
      return formattedStories
    } catch (error) {
      console.error("Error fetching recent stories:", error)
      return []
    }
  },

  // Get a single story by ID
  getStoryById: async (id: string): Promise<(Story & { comments: Comment[] }) | null> => {
    const cacheKey = `story:${id}`
    const cachedData = cache.get<Story & { comments: Comment[] }>(cacheKey)

    if (cachedData) {
      return cachedData
    }

    try {
      // Get the story
      const { data: storyData, error: storyError } = await supabase.from("stories").select("*").eq("id", id).single()

      if (storyError) {
        throw storyError
      }

      // Get the comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("story_id", id)
        .order("created_at", { ascending: false })

      if (commentsError) {
        throw commentsError
      }

      const story = formatStory(storyData)
      const comments = commentsData.map(formatComment)

      const result = {
        ...story,
        comments,
      }

      cache.set(cacheKey, result, 300)
      return result
    } catch (error) {
      console.error(`Error fetching story ${id}:`, error)
      return null
    }
  },

  // Get saved stories
  getSavedStories: async (): Promise<Story[]> => {
    try {
      const user = await authService.getOrCreateAnonymousUser()

      const { data, error } = await supabase
        .from("saved_stories")
        .select("stories(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      return data.map((item) => formatStory(item.stories))
    } catch (error) {
      console.error("Error fetching saved stories:", error)
      return []
    }
  },

  // Get user's stories
  getMyStories: async (): Promise<Story[]> => {
    try {
      const user = await authService.getOrCreateAnonymousUser()

      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      return data.map(formatStory)
    } catch (error) {
      console.error("Error fetching user stories:", error)
      return []
    }
  },

  // When a story is liked, disliked, or commented on, invalidate relevant caches
  invalidateStoryCache: (id: string) => {
    // Invalidate specific story cache
    cache.delete(`story:${id}`)

    // Invalidate list caches that might contain this story
    cache.delete("stories:trending")
    cache.delete("stories:discussed")
    cache.delete("stories:recent")

    // Delete any filtered story lists
    const keys = cache.keys()
    keys.forEach((key) => {
      if (key.startsWith("stories:")) {
        cache.delete(key)
      }
    })
  },

  // Like a story
  likeStory: async (id: string): Promise<boolean> => {
    try {
      const user = await authService.getOrCreateAnonymousUser()

      // Get current interaction state
      const currentInteraction = getInteraction("story", id)

      // If already liked, unlike it
      if (currentInteraction === "like") {
        removeInteraction("story", id)

        // Remove the interaction from the database
        const { error: deleteError } = await supabase
          .from("user_interactions")
          .delete()
          .eq("user_id", user.id)
          .eq("story_id", id)
          .eq("interaction_type", "like")

        if (deleteError) throw deleteError

        // Get current likes count
        const { data: storyData, error: getError } = await supabase
          .from("stories")
          .select("likes")
          .eq("id", id)
          .single()

        if (getError) throw getError

        // Decrement the likes count
        const { error: updateError } = await supabase
          .from("stories")
          .update({ likes: Math.max(0, storyData.likes - 1) })
          .eq("id", id)

        if (updateError) throw updateError
      }
      // If disliked, switch to like
      else if (currentInteraction === "dislike") {
        storeInteraction("story", id, "like")

        // Remove the dislike interaction
        const { error: deleteError } = await supabase
          .from("user_interactions")
          .delete()
          .eq("user_id", user.id)
          .eq("story_id", id)
          .eq("interaction_type", "dislike")

        if (deleteError) throw deleteError

        // Add the like interaction
        const { error: insertError } = await supabase.from("user_interactions").insert({
          user_id: user.id,
          story_id: id,
          interaction_type: "like",
        })

        if (insertError) throw insertError

        // Get current counts
        const { data: storyData, error: getError } = await supabase
          .from("stories")
          .select("likes, dislikes")
          .eq("id", id)
          .single()

        if (getError) throw getError

        // Update the counts
        const { error: updateError } = await supabase
          .from("stories")
          .update({
            likes: storyData.likes + 1,
            dislikes: Math.max(0, storyData.dislikes - 1),
          })
          .eq("id", id)

        if (updateError) throw updateError
      }
      // Otherwise, like it
      else {
        storeInteraction("story", id, "like")

        // Add the like interaction
        const { error: insertError } = await supabase.from("user_interactions").insert({
          user_id: user.id,
          story_id: id,
          interaction_type: "like",
        })

        if (insertError) throw insertError

        // Get current likes count
        const { data: storyData, error: getError } = await supabase
          .from("stories")
          .select("likes")
          .eq("id", id)
          .single()

        if (getError) throw getError

        // Increment the likes count
        const { error: updateError } = await supabase
          .from("stories")
          .update({ likes: storyData.likes + 1 })
          .eq("id", id)

        if (updateError) throw updateError
      }

      // Invalidate caches after successful like
      storyService.invalidateStoryCache(id)

      return true
    } catch (error) {
      console.error(`Error liking story ${id}:`, error)
      return false
    }
  },

  // Dislike a story
  dislikeStory: async (id: string): Promise<boolean> => {
    try {
      const user = await authService.getOrCreateAnonymousUser()

      // Get current interaction state
      const currentInteraction = getInteraction("story", id)

      // If already disliked, undislike it
      if (currentInteraction === "dislike") {
        removeInteraction("story", id)

        // Remove the interaction from the database
        const { error: deleteError } = await supabase
          .from("user_interactions")
          .delete()
          .eq("user_id", user.id)
          .eq("story_id", id)
          .eq("interaction_type", "dislike")

        if (deleteError) throw deleteError

        // Get current dislikes count
        const { data: storyData, error: getError } = await supabase
          .from("stories")
          .select("dislikes")
          .eq("id", id)
          .single()

        if (getError) throw getError

        // Decrement the dislikes count
        const { error: updateError } = await supabase
          .from("stories")
          .update({ dislikes: Math.max(0, storyData.dislikes - 1) })
          .eq("id", id)

        if (updateError) throw updateError
      }
      // If liked, switch to dislike
      else if (currentInteraction === "like") {
        storeInteraction("story", id, "dislike")

        // Remove the like interaction
        const { error: deleteError } = await supabase
          .from("user_interactions")
          .delete()
          .eq("user_id", user.id)
          .eq("story_id", id)
          .eq("interaction_type", "like")

        if (deleteError) throw deleteError

        // Add the dislike interaction
        const { error: insertError } = await supabase.from("user_interactions").insert({
          user_id: user.id,
          story_id: id,
          interaction_type: "dislike",
        })

        if (insertError) throw insertError

        // Get current counts
        const { data: storyData, error: getError } = await supabase
          .from("stories")
          .select("likes, dislikes")
          .eq("id", id)
          .single()

        if (getError) throw getError

        // Update the counts
        const { error: updateError } = await supabase
          .from("stories")
          .update({
            dislikes: storyData.dislikes + 1,
            likes: Math.max(0, storyData.likes - 1),
          })
          .eq("id", id)

        if (updateError) throw updateError
      }
      // Otherwise, dislike it
      else {
        storeInteraction("story", id, "dislike")

        // Add the dislike interaction
        const { error: insertError } = await supabase.from("user_interactions").insert({
          user_id: user.id,
          story_id: id,
          interaction_type: "dislike",
        })

        if (insertError) throw insertError

        // Get current dislikes count
        const { data: storyData, error: getError } = await supabase
          .from("stories")
          .select("dislikes")
          .eq("id", id)
          .single()

        if (getError) throw getError

        // Increment the dislikes count
        const { error: updateError } = await supabase
          .from("stories")
          .update({ dislikes: storyData.dislikes + 1 })
          .eq("id", id)

        if (updateError) throw updateError
      }

      // Invalidate caches after successful dislike
      storyService.invalidateStoryCache(id)

      return true
    } catch (error) {
      console.error(`Error disliking story ${id}:`, error)
      return false
    }
  },

  // Add a comment to a story
  addComment: async (storyId: string, content: string): Promise<Comment> => {
    try {
      const user = await authService.getOrCreateAnonymousUser()

      const { data, error } = await supabase
        .from("comments")
        .insert({
          story_id: storyId,
          content,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      storyService.invalidateStoryCache(storyId)

      return formatComment(data)
    } catch (error) {
      console.error(`Error adding comment to story ${storyId}:`, error)
      throw error
    }
  },

  // Like a comment
  likeComment: async (storyId: string, commentId: string): Promise<boolean> => {
    try {
      const user = await authService.getOrCreateAnonymousUser()

      // Get current interaction state
      const currentInteraction = getInteraction("comment", commentId)

      // If already liked, unlike it
      if (currentInteraction === "like") {
        removeInteraction("comment", commentId)

        // Remove the interaction from the database
        const { error: deleteError } = await supabase
          .from("user_interactions")
          .delete()
          .eq("user_id", user.id)
          .eq("comment_id", commentId)
          .eq("interaction_type", "like")

        if (deleteError) throw deleteError

        // Get current likes count
        const { data: commentData, error: getError } = await supabase
          .from("comments")
          .select("likes")
          .eq("id", commentId)
          .single()

        if (getError) throw getError

        // Decrement the likes count
        const { error: updateError } = await supabase
          .from("comments")
          .update({ likes: Math.max(0, commentData.likes - 1) })
          .eq("id", commentId)

        if (updateError) throw updateError
      }
      // If disliked, switch to like
      else if (currentInteraction === "dislike") {
        storeInteraction("comment", commentId, "like")

        // Remove the dislike interaction
        const { error: deleteError } = await supabase
          .from("user_interactions")
          .delete()
          .eq("user_id", user.id)
          .eq("comment_id", commentId)
          .eq("interaction_type", "dislike")

        if (deleteError) throw deleteError

        // Add the like interaction
        const { error: insertError } = await supabase.from("user_interactions").insert({
          user_id: user.id,
          comment_id: commentId,
          interaction_type: "like",
        })

        if (insertError) throw insertError

        // Get current counts
        const { data: commentData, error: getError } = await supabase
          .from("comments")
          .select("likes, dislikes")
          .eq("id", commentId)
          .single()

        if (getError) throw getError

        // Update the counts
        const { error: updateError } = await supabase
          .from("comments")
          .update({
            likes: commentData.likes + 1,
            dislikes: Math.max(0, commentData.dislikes - 1),
          })
          .eq("id", commentId)

        if (updateError) throw updateError
      }
      // Otherwise, like it
      else {
        storeInteraction("comment", commentId, "like")

        // Add the like interaction
        const { error: insertError } = await supabase.from("user_interactions").insert({
          user_id: user.id,
          comment_id: commentId,
          interaction_type: "like",
        })

        if (insertError) throw insertError

        // Get current likes count
        const { data: commentData, error: getError } = await supabase
          .from("comments")
          .select("likes")
          .eq("id", commentId)
          .single()

        if (getError) throw getError

        // Increment the likes count
        const { error: updateError } = await supabase
          .from("comments")
          .update({ likes: commentData.likes + 1 })
          .eq("id", commentId)

        if (updateError) throw updateError
      }

      storyService.invalidateStoryCache(storyId)
      return true
    } catch (error) {
      console.error(`Error liking comment ${commentId}:`, error)
      return false
    }
  },

  // Dislike a comment
  dislikeComment: async (storyId: string, commentId: string): Promise<boolean> => {
    try {
      const user = await authService.getOrCreateAnonymousUser()

      // Get current interaction state
      const currentInteraction = getInteraction("comment", commentId)

      // If already disliked, undislike it
      if (currentInteraction === "dislike") {
        removeInteraction("comment", commentId)

        // Remove the interaction from the database
        const { error: deleteError } = await supabase
          .from("user_interactions")
          .delete()
          .eq("user_id", user.id)
          .eq("comment_id", commentId)
          .eq("interaction_type", "dislike")

        if (deleteError) throw deleteError

        // Get current dislikes count
        const { data: commentData, error: getError } = await supabase
          .from("comments")
          .select("dislikes")
          .eq("id", commentId)
          .single()

        if (getError) throw getError

        // Decrement the dislikes count
        const { error: updateError } = await supabase
          .from("comments")
          .update({ dislikes: Math.max(0, commentData.dislikes - 1) })
          .eq("id", commentId)

        if (updateError) throw updateError
      }
      // If liked, switch to dislike
      else if (currentInteraction === "like") {
        storeInteraction("comment", commentId, "dislike")

        // Remove the like interaction
        const { error: deleteError } = await supabase
          .from("user_interactions")
          .delete()
          .eq("user_id", user.id)
          .eq("comment_id", commentId)
          .eq("interaction_type", "like")

        if (deleteError) throw deleteError

        // Add the dislike interaction
        const { error: insertError } = await supabase.from("user_interactions").insert({
          user_id: user.id,
          comment_id: commentId,
          interaction_type: "dislike",
        })

        if (insertError) throw insertError

        // Get current counts
        const { data: commentData, error: getError } = await supabase
          .from("comments")
          .select("likes, dislikes")
          .eq("id", commentId)
          .single()

        if (getError) throw getError

        // Update the counts
        const { error: updateError } = await supabase
          .from("comments")
          .update({
            dislikes: commentData.dislikes + 1,
            likes: Math.max(0, commentData.likes - 1),
          })
          .eq("id", commentId)

        if (updateError) throw updateError
      }
      // Otherwise, dislike it
      else {
        storeInteraction("comment", commentId, "dislike")

        // Add the dislike interaction
        const { error: insertError } = await supabase.from("user_interactions").insert({
          user_id: user.id,
          comment_id: commentId,
          interaction_type: "dislike",
        })

        if (insertError) throw insertError

        // Get current dislikes count
        const { data: commentData, error: getError } = await supabase
          .from("comments")
          .select("dislikes")
          .eq("id", commentId)
          .single()

        if (getError) throw getError

        // Increment the dislikes count
        const { error: updateError } = await supabase
          .from("comments")
          .update({ dislikes: commentData.dislikes + 1 })
          .eq("id", commentId)

        if (updateError) throw updateError
      }

      storyService.invalidateStoryCache(storyId)
      return true
    } catch (error) {
      console.error(`Error disliking comment ${commentId}:`, error)
      return false
    }
  },

  // Save a story
  saveStory: async (story: Story): Promise<boolean> => {
    try {
      const user = await authService.getOrCreateAnonymousUser()

      // Check if already saved
      const { data: existingSaved, error: checkError } = await supabase
        .from("saved_stories")
        .select("id")
        .eq("user_id", user.id)
        .eq("story_id", story.id)
        .maybeSingle()

      if (checkError) throw checkError

      if (existingSaved) {
        return true
      }

      // Save the story
      const { error: saveError } = await supabase.from("saved_stories").insert({
        user_id: user.id,
        story_id: story.id,
      })

      if (saveError) throw saveError

      return true
    } catch (error) {
      console.error(`Error saving story ${story.id}:`, error)
      return false
    }
  },

  // Unsave a story
  unsaveStory: async (storyId: string): Promise<boolean> => {
    try {
      const user = await authService.getOrCreateAnonymousUser()

      const { error } = await supabase.from("saved_stories").delete().eq("user_id", user.id).eq("story_id", storyId)

      if (error) throw error

      return true
    } catch (error) {
      console.error(`Error unsaving story ${storyId}:`, error)
      return false
    }
  },

  // Submit a new story
  submitStory: async (storyData: any): Promise<{ success: boolean; id?: string }> => {
    try {
      const user = await authService.getOrCreateAnonymousUser()

      const { data, error } = await supabase
        .from("stories")
        .insert({
          title: storyData.title,
          company: storyData.company,
          content: storyData.content,
          category: storyData.category.charAt(0).toUpperCase() + storyData.category.slice(1),
          user_id: user.id,
          designation: storyData.designation || null,
        })
        .select()
        .single()

      if (error) throw error

      // Invalidate caches
      cache.delete("stories:recent")

      return { success: true, id: data.id }
    } catch (error) {
      console.error("Error submitting story:", error)
      return { success: false }
    }
  },
}
