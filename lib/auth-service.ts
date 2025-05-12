import { supabase, supabaseAdmin } from "@/lib/supabase"
import { getAnonymousId } from "@/lib/anonymous-id"

export const authService = {
  // Get the current user
  getCurrentUser: async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("Error getting current user:", error)
        return null
      }

      return user
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  },

  // Get or create an anonymous user
  getOrCreateAnonymousUser: async () => {
    try {
      const anonymousId = getAnonymousId()

      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("anonymous_id", anonymousId)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching user:", fetchError)

        // Return a fallback user object if we can't connect to Supabase
        return {
          id: "offline-user",
          anonymous_id: anonymousId,
          created_at: new Date().toISOString(),
        }
      }

      if (existingUser) {
        return existingUser
      }

      // Create new user
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from("users")
        .insert({
          anonymous_id: anonymousId,
        })
        .select()
        .single()

      if (insertError) {
        console.error("Error creating user:", insertError)

        // Return a fallback user object if we can't create a user
        return {
          id: "offline-user",
          anonymous_id: anonymousId,
          created_at: new Date().toISOString(),
        }
      }

      return newUser
    } catch (error) {
      console.error("Error in getOrCreateAnonymousUser:", error)

      // Return a fallback user object if there's an exception
      const anonymousId = getAnonymousId()
      return {
        id: "offline-user",
        anonymous_id: anonymousId,
        created_at: new Date().toISOString(),
      }
    }
  },

  // Get user statistics
  getUserStats: async (userId: string) => {
    try {
      // Get story count
      const { count: storyCount, error: storyError } = await supabase
        .from("stories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

      if (storyError) {
        console.error("Error getting story count:", storyError)
      }

      // Get comment count
      const { count: commentCount, error: commentError } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)

      if (commentError) {
        console.error("Error getting comment count:", commentError)
      }

      // Get user creation date
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("created_at")
        .eq("id", userId)
        .single()

      if (userError) {
        console.error("Error getting user data:", userError)
      }

      // Calculate membership duration
      let memberSince = "Unknown"
      if (userData?.created_at) {
        const createdAt = new Date(userData.created_at)
        const now = new Date()
        const diffMonths = (now.getFullYear() - createdAt.getFullYear()) * 12 + now.getMonth() - createdAt.getMonth()

        if (diffMonths < 1) {
          const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
          memberSince = `${diffDays} day${diffDays !== 1 ? "s" : ""}`
        } else {
          memberSince = `${diffMonths} month${diffMonths !== 1 ? "s" : ""}`
        }
      }

      return {
        storyCount: storyCount || 0,
        commentCount: commentCount || 0,
        memberSince,
        createdAt: userData?.created_at || null,
      }
    } catch (error) {
      console.error("Error getting user stats:", error)
      return {
        storyCount: 0,
        commentCount: 0,
        memberSince: "Unknown",
        createdAt: null,
      }
    }
  },
}
