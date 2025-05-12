import { NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

export async function GET() {
  try {
    // Get or create anonymous user
    const user = await authService.getOrCreateAnonymousUser()

    if (!user || user.id === "offline-user") {
      return NextResponse.json(
        {
          storyCount: 0,
          commentCount: 0,
          memberSince: "Unknown",
          createdAt: null,
          anonymousId: user?.anonymous_id || "unknown",
        },
        { status: 200 },
      )
    }

    // Get user statistics
    const stats = await authService.getUserStats(user.id)

    return NextResponse.json(
      {
        ...stats,
        anonymousId: user.anonymous_id,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error getting user stats:", error)
    return NextResponse.json({ error: "Failed to get user statistics" }, { status: 500 })
  }
}
