"use client"

import { useEffect, useState } from "react"
import { ANONYMOUS_ID_COOKIE, getClientCookie } from "@/lib/cookie-utils"

export default function CookieStatus() {
  const [anonymousId, setAnonymousId] = useState<string | null>(null)
  const [cookieExpiry, setCookieExpiry] = useState<string | null>(null)

  useEffect(() => {
    // Get the anonymous ID from cookie
    const id = getClientCookie(ANONYMOUS_ID_COOKIE)
    setAnonymousId(id)

    // Try to get cookie expiration
    const cookies = document.cookie.split(";")
    for (const cookie of cookies) {
      if (cookie.trim().startsWith(`${ANONYMOUS_ID_COOKIE}=`)) {
        // We can't directly access cookie expiration in JS
        // But we can show when it was set
        setCookieExpiry("Persistent until manually cleared")
        break
      }
    }
  }, [])

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <h3 className="font-medium text-lg mb-2">Anonymous ID Cookie Status</h3>
      <div className="space-y-2">
        <p>
          <span className="font-medium">ID:</span>{" "}
          {anonymousId ? (
            <span className="font-mono bg-gray-200 px-1 rounded">{anonymousId}</span>
          ) : (
            <span className="text-red-500">Not set</span>
          )}
        </p>
        <p>
          <span className="font-medium">Expiration:</span> {cookieExpiry || "Unknown"}
        </p>
        <p className="text-sm text-gray-600">This cookie will persist until you manually clear your browser cookies.</p>
      </div>
    </div>
  )
}
