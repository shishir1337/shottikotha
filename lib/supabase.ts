import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Hardcoded values for development - DO NOT USE IN PRODUCTION
const supabaseUrl = "https://skafdbdcukwdlyihhapu.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYWZkYmRjdWt3ZGx5aWhoYXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwODM4NjYsImV4cCI6MjA2MjY1OTg2Nn0.ZYvksrzTu7vGqZak6rt2RxpNBCXEFkLIFfso8u-3-Ro"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYWZkYmRjdWt3ZGx5aWhoYXB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzA4Mzg2NiwiZXhwIjoyMDYyNjU5ODY2fQ.76Ob4RpEPRY5RNDpG2Z0mdsZfD3u6H1fqfsEZ0JlNDs"

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Create a supabase admin client with the service role key for server-side operations
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)

// IMPORTANT: In a production environment, you should use environment variables:
// export const supabase = createClient<Database>(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// )
// export const supabaseAdmin = createClient<Database>(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// )
