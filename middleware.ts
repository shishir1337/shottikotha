import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ANONYMOUS_ID_COOKIE } from "./lib/cookie-utils"
import { generateAnonymousId } from "./lib/anonymous-id"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Check if the anonymous ID cookie exists
  const anonymousId = request.cookies.get(ANONYMOUS_ID_COOKIE)?.value

  // If no cookie exists, set one
  if (!anonymousId) {
    const newAnonymousId = generateAnonymousId()

    // Set cookie with maximum age (~400 days)
    response.cookies.set({
      name: ANONYMOUS_ID_COOKIE,
      value: newAnonymousId,
      path: "/",
      maxAge: 400 * 24 * 60 * 60, // ~400 days in seconds
      sameSite: "lax",
    })
  }

  return response
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
