export const ANONYMOUS_ID_COOKIE = "anonymous_id"

// Function to get a cookie on the client side
export function getClientCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  const cookies = document.cookie.split(";")
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim()
    if (cookie.startsWith(name + "=")) {
      return cookie.substring(name.length + 1)
    }
  }
  return null
}

// Function to set a cookie with maximum duration
export function setClientCookie(name: string, value: string): void {
  if (typeof document === "undefined") return

  // Set cookie with max-age of ~400 days (the maximum allowed by browsers)
  const maxAgeInSeconds = 400 * 24 * 60 * 60
  document.cookie = `${name}=${value};path=/;max-age=${maxAgeInSeconds};SameSite=Lax`
}

// Function to set a cookie with maximum duration
export function setMaxAgeCookie(name: string, value: string): void {
  if (typeof document === "undefined") return

  // Set cookie with max-age of ~400 days (the maximum allowed by browsers)
  const maxAgeInSeconds = 400 * 24 * 60 * 60
  document.cookie = `${name}=${value};path=/;max-age=${maxAgeInSeconds};SameSite=Lax`
}

// Function to get a cookie on the server side
export async function getServerCookie(name: string, cookies: () => Promise<any>): Promise<string | undefined> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(name)
  return cookie?.value
}

// Function to set a cookie on the server side
export async function setServerCookie(name: string, value: string, cookies: () => Promise<any>): Promise<void> {
  const cookieStore = await cookies()

  // Set cookie with max expiration (approximately 400 days)
  const maxExpirationDate = new Date()
  maxExpirationDate.setDate(maxExpirationDate.getDate() + 400)

  cookieStore.set(name, value, {
    expires: maxExpirationDate,
    path: "/",
    sameSite: "lax",
  })
}
