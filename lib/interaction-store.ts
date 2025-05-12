// This file will handle tracking user interactions with stories and comments

type InteractionType = "like" | "dislike"
type ContentType = "story" | "comment"

interface StoredInteraction {
  type: InteractionType
  timestamp: number
}

// Get the stored interaction for a content item
export function getInteraction(contentType: ContentType, id: string): InteractionType | null {
  if (typeof window === "undefined") return null

  try {
    const key = `${contentType}-${id}`
    const storedValue = localStorage.getItem(key)

    if (!storedValue) return null

    const interaction = JSON.parse(storedValue) as StoredInteraction
    return interaction.type
  } catch (error) {
    console.error("Error getting interaction from localStorage:", error)
    return null
  }
}

// Store an interaction for a content item
export function storeInteraction(contentType: ContentType, id: string, type: InteractionType): void {
  if (typeof window === "undefined") return

  try {
    const key = `${contentType}-${id}`
    const interaction: StoredInteraction = {
      type,
      timestamp: Date.now(),
    }

    localStorage.setItem(key, JSON.stringify(interaction))
  } catch (error) {
    console.error("Error storing interaction in localStorage:", error)
  }
}

// Remove an interaction for a content item
export function removeInteraction(contentType: ContentType, id: string): void {
  if (typeof window === "undefined") return

  try {
    const key = `${contentType}-${id}`
    localStorage.removeItem(key)
  } catch (error) {
    console.error("Error removing interaction from localStorage:", error)
  }
}
