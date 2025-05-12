import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { authService } from "@/lib/auth-service"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const user = await authService.getOrCreateAnonymousUser()

    // Check if the story exists
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .select("id, likes, dislikes")
      .eq("id", id)
      .single()

    if (storyError) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    // Get the current interaction state from the request body
    const { currentInteraction } = await request.json()

    // Handle different interaction states
    if (currentInteraction === "like") {
      // User is unliking the story

      // Remove the interaction from the database
      const { error: deleteError } = await supabase
        .from("user_interactions")
        .delete()
        .eq("user_id", user.id)
        .eq("story_id", id)
        .eq("interaction_type", "like")

      if (deleteError) throw deleteError

      // Decrement the likes count
      const { data: updatedStory, error: updateError } = await supabase
        .from("stories")
        .update({ likes: Math.max(0, story.likes - 1) })
        .eq("id", id)
        .select("likes, dislikes")
        .single()

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        likes: updatedStory.likes,
        dislikes: updatedStory.dislikes,
      })
    } else if (currentInteraction === "dislike") {
      // User is switching from dislike to like

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

      // Update the counts
      const { data: updatedStory, error: updateError } = await supabase
        .from("stories")
        .update({
          likes: story.likes + 1,
          dislikes: Math.max(0, story.dislikes - 1),
        })
        .eq("id", id)
        .select("likes, dislikes")
        .single()

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        likes: updatedStory.likes,
        dislikes: updatedStory.dislikes,
      })
    } else {
      // User is liking the story for the first time

      // Add the like interaction
      const { error: insertError } = await supabase.from("user_interactions").insert({
        user_id: user.id,
        story_id: id,
        interaction_type: "like",
      })

      if (insertError) throw insertError

      // Increment the likes count
      const { data: updatedStory, error: updateError } = await supabase
        .from("stories")
        .update({ likes: story.likes + 1 })
        .eq("id", id)
        .select("likes, dislikes")
        .single()

      if (updateError) throw updateError

      return NextResponse.json({
        success: true,
        likes: updatedStory.likes,
        dislikes: updatedStory.dislikes,
      })
    }
  } catch (error) {
    console.error("Error liking story:", error)
    return NextResponse.json({ error: "Failed to like story" }, { status: 500 })
  }
}
