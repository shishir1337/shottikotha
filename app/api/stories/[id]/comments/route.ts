import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { authService } from "@/lib/auth-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("story_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // Format the data for the client
    const formattedComments = data.map((comment) => ({
      id: comment.id,
      author: comment.author,
      content: comment.content,
      date: formatDate(comment.created_at),
      likes: comment.likes,
      dislikes: comment.dislikes,
    }))

    return NextResponse.json(formattedComments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const data = await request.json()
    const user = await authService.getOrCreateAnonymousUser()

    if (!data.content) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    // Check if the story exists
    const { data: story, error: storyError } = await supabase.from("stories").select("id").eq("id", id).single()

    if (storyError) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    // Add the comment
    const { data: newComment, error: commentError } = await supabase
      .from("comments")
      .insert({
        story_id: id,
        content: data.content,
        user_id: user.id,
        author: "Anonymous", // Default author name
      })
      .select()
      .single()

    if (commentError) {
      throw commentError
    }

    // Format the comment for the response
    const formattedComment = {
      id: newComment.id,
      author: newComment.author,
      content: newComment.content,
      date: formatDate(newComment.created_at),
      likes: newComment.likes,
      dislikes: newComment.dislikes,
    }

    return NextResponse.json({ success: true, comment: formattedComment })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
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
