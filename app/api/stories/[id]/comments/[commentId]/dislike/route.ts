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
    if (currentInteraction === "dislike") {
      // User is undisliking the comment

      // Remove the interaction from the database
      const { error: deleteError } = await supabase
        .from("user_interactions")
        .delete()
        .eq("user_id", user.id)
        .eq("comment_id", commentId)
        .eq("interaction_type", "dislike")

      if (deleteError) throw deleteError

      // Decrement the dislikes count
      const { data: updatedComment, error: updateError } = await supabase
        .from("comments")
        .update({ dislikes: Math.max(0, comment.dislikes - 1) })
        .eq("id", commentId)
        .select("likes, dislikes")
        .single()

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        likes: updatedComment.likes,
        dislikes: updatedComment.dislikes,
      })
    } else if (currentInteraction === "like") {
      // User is switching from like to dislike

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

      // Update the counts
      const { data: updatedComment, error: updateError } = await supabase
        .from("comments")
        .update({
          dislikes: comment.dislikes + 1,
          likes: Math.max(0, comment.likes - 1),
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
      // User is disliking the comment for the first time

      // Add the dislike interaction
      const { error: insertError } = await supabase.from("user_interactions").insert({
        user_id: user.id,
        comment_id: commentId,
        interaction_type: "dislike",
      })

      if (insertError) throw insertError

      // Increment the dislikes count
      const { data: updatedComment, error: updateError } = await supabase
        .from("comments")
        .update({ dislikes: comment.dislikes + 1 })
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
    console.error("Error disliking comment:", error)
    return NextResponse.json({ error: "Failed to dislike comment" }, { status: 500 })
  }
}
