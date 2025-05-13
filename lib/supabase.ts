import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Use environment variables for production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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
