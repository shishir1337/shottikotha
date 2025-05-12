import { v4 as uuidv4 } from "uuid"
import { ANONYMOUS_ID_COOKIE, getClientCookie, setMaxAgeCookie } from "./cookie-utils"

// Generate a random anonymous ID for users
export function generateAnonymousId(): string {
  return uuidv4()
}

// Get the anonymous ID from cookie or generate a new one
export function getAnonymousId(): string {
  // Check if we're on the server
  if (typeof window === "undefined") {
    return generateAnonymousId() // For SSR, generate a temporary ID
  }

  // Try to get the ID from cookie
  let anonymousId = getClientCookie(ANONYMOUS_ID_COOKIE)

  // If no cookie exists, try localStorage as fallback (for existing users)
  if (!anonymousId) {
    try {
      anonymousId = localStorage.getItem("anonymousId")

      // If found in localStorage, migrate to cookie
      if (anonymousId) {
        setMaxAgeCookie(ANONYMOUS_ID_COOKIE, anonymousId)
        // Keep in localStorage for backward compatibility
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e)
    }
  }

  // If still no ID, generate a new one
  if (!anonymousId) {
    anonymousId = generateAnonymousId()

    // Store in cookie with maximum duration
    setMaxAgeCookie(ANONYMOUS_ID_COOKIE, anonymousId)

    // Also store in localStorage for backward compatibility
    try {
      localStorage.setItem("anonymousId", anonymousId)
    } catch (e) {
      console.error("Error setting localStorage:", e)
    }
  }

  return anonymousId
}

// Server-side function to get anonymous ID from cookies
export async function getAnonymousIdFromRequest(req: Request): Promise<string> {
  const cookieHeader = req.headers.get("cookie") || ""
  const cookies = cookieHeader.split(";").reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split("=")
      if (key) acc[key] = value
      return acc
    },
    {} as Record<string, string>,
  )

  return cookies[ANONYMOUS_ID_COOKIE] || generateAnonymousId()
}
