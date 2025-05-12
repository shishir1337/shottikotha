import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Simple query to check if we can connect to Supabase
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: `Connection error: ${error.message}`,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "connected",
      message: "Successfully connected to Supabase",
    })
  } catch (error) {
    console.error("Error checking Supabase connection:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
