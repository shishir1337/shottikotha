import { supabase } from "@/lib/supabase"

export async function checkSupabaseConnection() {
  try {
    // Try a simple query to check if we can connect to Supabase
    const { data, error } = await supabase.from("stories").select("id").limit(1)

    if (error) {
      console.error("Supabase connection error:", error)
      return {
        connected: false,
        error: error.message,
      }
    }

    return {
      connected: true,
      data,
    }
  } catch (error) {
    console.error("Supabase connection error:", error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
