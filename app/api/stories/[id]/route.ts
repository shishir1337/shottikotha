import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { authService } from "@/lib/auth-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get the story
    const { data: story, error: storyError } = await supabase.from("stories").select("*").eq("id", id).single()

    if (storyError) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    // Get the comments
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("*")
      .eq("story_id", id)
      .order("created_at", { ascending: false })

    if (commentsError) {
      throw commentsError
    }

    // Format the data for the client
    const formattedStory = {
      id: story.id,
      title: story.title,
      company: story.company,
      content: story.content,
      category: story.category,
      likes: story.likes,
      dislikes: story.dislikes,
      comments: story.comments_count,
      date: formatDate(story.created_at),
      comments: comments.map((comment) => ({
        id: comment.id,
        author: comment.author,
        content: comment.content,
        date: formatDate(comment.created_at),
        likes: comment.likes,
        dislikes: comment.dislikes,
      })),
    }

    return NextResponse.json(formattedStory)
  } catch (error) {
    console.error("Error fetching story:", error)
    return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()
    const user = await authService.getOrCreateAnonymousUser()

    // Check if the story exists and belongs to the user
    const { data: existingStory, error: checkError } = await supabase
      .from("stories")
      .select("user_id")
      .eq("id", id)
      .single()

    if (checkError) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    if (existingStory.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update the story
    const { data: updatedStory, error: updateError } = await supabase
      .from("stories")
      .update({
        title: data.title,
        company: data.company,
        content: data.content,
        category: data.category,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Format the story for the response
    const formattedStory = {
      id: updatedStory.id,
      title: updatedStory.title,
      company: updatedStory.company,
      content: updatedStory.content,
      category: updatedStory.category,
      likes: updatedStory.likes,
      dislikes: updatedStory.dislikes,
      comments: updatedStory.comments_count,
      date: formatDate(updatedStory.created_at),
    }

    return NextResponse.json({ success: true, story: formattedStory })
  } catch (error) {
    console.error("Error updating story:", error)
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const user = await authService.getOrCreateAnonymousUser()

    // Check if the story exists and belongs to the user
    const { data: existingStory, error: checkError } = await supabase
      .from("stories")
      .select("user_id")
      .eq("id", id)
      .single()

    if (checkError) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    if (existingStory.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete the story
    const { error: deleteError } = await supabase.from("stories").delete().eq("id", id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting story:", error)
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 })
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
