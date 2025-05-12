// Simple in-memory cache implementation
type CacheEntry<T> = {
  data: T
  timestamp: number
  expiresAt: number
}

class Cache {
  private cache: Map<string, CacheEntry<any>> = new Map()

  // Set a value in the cache with expiration time in seconds
  set<T>(key: string, value: T, ttl = 300): void {
    const now = Date.now()
    this.cache.set(key, {
      data: value,
      timestamp: now,
      expiresAt: now + ttl * 1000,
    })
  }

  // Get a value from the cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    // Return null if entry doesn't exist or is expired
    if (!entry || entry.expiresAt < Date.now()) {
      if (entry) this.delete(key) // Clean up expired entries
      return null
    }

    return entry.data as T
  }

  // Check if a key exists and is not expired
  has(key: string): boolean {
    const entry = this.cache.get(key)
    return !!entry && entry.expiresAt >= Date.now()
  }

  // Delete a key from the cache
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Clear all entries from the cache
  clear(): void {
    this.cache.clear()
  }

  // Get all valid keys
  keys(): string[] {
    const now = Date.now()
    const keys: string[] = []

    this.cache.forEach((entry, key) => {
      if (entry.expiresAt >= now) {
        keys.push(key)
      }
    })

    return keys
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    this.cache.forEach((entry, key) => {
      if (entry.expiresAt < now) {
        this.cache.delete(key)
      }
    })
  }
}

// Create a singleton instance
export const cache = new Cache()

// Run cleanup every minute
if (typeof window !== "undefined") {
  setInterval(() => {
    cache.cleanup()
  }, 60000)
}
