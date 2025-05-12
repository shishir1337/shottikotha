import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { authService } from "@/lib/auth-service"

export async function GET() {
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

    // Format the data for the client
    const formattedStories = data.map((story) => ({
      id: story.id,
      title: story.title,
      company: story.company,
      content: story.content,
      category: story.category,
      likes: story.likes,
      dislikes: story.dislikes,
      comments: story.comments_count,
      date: formatDate(story.created_at),
    }))

    return NextResponse.json(formattedStories)
  } catch (error) {
    console.error("Error fetching user stories:", error)
    return NextResponse.json({ error: "Failed to fetch user stories" }, { status: 500 })
  }
}

// Helper function to format date
function formatDate(dateString: string): string {
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
