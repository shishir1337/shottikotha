import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { authService } from "@/lib/auth-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const searchTerm = searchParams.get("search") || ""
  const category = searchParams.get("category") || "all"
  const sortBy = searchParams.get("sortBy") || "recent"
  const type = searchParams.get("type") || "all"

  try {
    let query = supabase.from("stories").select("*")

    // Apply filters
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`)
    }

    if (category !== "all") {
      query = query.eq("category", category.charAt(0).toUpperCase() + category.slice(1))
    }

    // Apply sorting and type-specific queries
    switch (type) {
      case "trending":
        query = query.order("likes", { ascending: false }).limit(10)
        break
      case "discussed":
        query = query.order("comments_count", { ascending: false }).limit(10)
        break
      case "recent":
        query = query.order("created_at", { ascending: false }).limit(10)
        break
      default:
        // Apply regular sorting
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
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    // Format the data for the client
    const formattedData = data.map((story) => ({
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

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Error fetching stories:", error)
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const user = await authService.getOrCreateAnonymousUser()

    // Validate required fields
    if (!data.title || !data.company || !data.content || !data.category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new story
    const { data: newStory, error } = await supabase
      .from("stories")
      .insert({
        title: data.title,
        company: data.company,
        content: data.content,
        category: data.category.charAt(0).toUpperCase() + data.category.slice(1),
        user_id: user.id,
        designation: data.designation || null,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Format the story for the response
    const formattedStory = {
      id: newStory.id,
      title: newStory.title,
      company: newStory.company,
      content: newStory.content,
      category: newStory.category,
      likes: newStory.likes,
      dislikes: newStory.dislikes,
      comments: newStory.comments_count,
      date: formatDate(newStory.created_at),
    }

    return NextResponse.json({ success: true, id: newStory.id, story: formattedStory })
  } catch (error) {
    console.error("Error creating story:", error)
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 })
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
