import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { authService } from "@/lib/auth-service"

export async function GET() {
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

    // Format the data for the client
    const formattedStories = data.map((item) => ({
      id: item.stories.id,
      title: item.stories.title,
      company: item.stories.company,
      content: item.stories.content,
      category: item.stories.category,
      likes: item.stories.likes,
      dislikes: item.stories.dislikes,
      comments: item.stories.comments_count,
      date: formatDate(item.stories.created_at),
    }))

    return NextResponse.json(formattedStories)
  } catch (error) {
    console.error("Error fetching saved stories:", error)
    return NextResponse.json({ error: "Failed to fetch saved stories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const user = await authService.getOrCreateAnonymousUser()

    if (!data.storyId) {
      return NextResponse.json({ error: "Story ID is required" }, { status: 400 })
    }

    // Check if already saved
    const { data: existingSaved, error: checkError } = await supabase
      .from("saved_stories")
      .select("id")
      .eq("user_id", user.id)
      .eq("story_id", data.storyId)
      .maybeSingle()

    if (checkError) throw checkError

    if (existingSaved) {
      return NextResponse.json({ success: true })
    }

    // Save the story
    const { error: saveError } = await supabase.from("saved_stories").insert({
      user_id: user.id,
      story_id: data.storyId,
    })

    if (saveError) throw saveError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving story:", error)
    return NextResponse.json({ error: "Failed to save story" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get("storyId")
    const user = await authService.getOrCreateAnonymousUser()

    if (!storyId) {
      return NextResponse.json({ error: "Story ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("saved_stories").delete().eq("user_id", user.id).eq("story_id", storyId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing saved story:", error)
    return NextResponse.json({ error: "Failed to remove saved story" }, { status: 500 })
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
