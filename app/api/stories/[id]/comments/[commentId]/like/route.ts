import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { authService } from "@/lib/auth-service"

export async function POST(request: Request, { params }: { params: { id: string; commentId: string } }) {
  try {
    const { id, commentId } = params
    const user = await authService.getOrCreateAnonymousUser()

    // Check if the comment exists
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("id, likes, dislikes")
      .eq("id", commentId)
      .single()

    if (commentError) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Get the current interaction state from the request body
    const { currentInteraction } = await request.json()

    // Handle different interaction states
    if (currentInteraction === "like") {
      // User is unliking the comment

      // Remove the interaction from the database
      const { error: deleteError } = await supabase
        .from("user_interactions")
        .delete()
        .eq("user_id", user.id)
        .eq("comment_id", commentId)
        .eq("interaction_type", "like")

      if (deleteError) throw deleteError

      // Decrement the likes count
      const { data: updatedComment, error: updateError } = await supabase
        .from("comments")
        .update({ likes: Math.max(0, comment.likes - 1) })
        .eq("id", commentId)
        .select("likes, dislikes")
        .single()

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        likes: updatedComment.likes,
        dislikes: updatedComment.dislikes,
      })
    } else if (currentInteraction === "dislike") {
      // User is switching from dislike to like

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

      // Update the counts
      const { data: updatedComment, error: updateError } = await supabase
        .from("comments")
        .update({
          likes: comment.likes + 1,
          dislikes: Math.max(0, comment.dislikes - 1),
        })
        .eq("id", commentId)
        .select("likes, dislikes")
        .single()

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        likes: updatedComment.likes,
        dislikes: updatedComment.dislikes,
      })
    } else {
      // User is liking the comment for the first time

      // Add the like interaction
      const { error: insertError } = await supabase.from("user_interactions").insert({
        user_id: user.id,
        comment_id: commentId,
        interaction_type: "like",
      })

      if (insertError) throw insertError

      // Increment the likes count
      const { data: updatedComment, error: updateError } = await supabase
        .from("comments")
        .update({ likes: comment.likes + 1 })
        .eq("id", commentId)
        .select("likes, dislikes")
        .single()

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        likes: updatedComment.likes,
        dislikes: updatedComment.dislikes,
      })
    }
  } catch (error) {
    console.error("Error liking comment:", error)
    return NextResponse.json({ error: "Failed to like comment" }, { status: 500 })
  }
}
