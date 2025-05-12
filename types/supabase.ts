export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      stories: {
        Row: {
          id: string
          title: string
          company: string
          content: string
          category: "Positive" | "Negative" | "Mixed"
          likes: number
          dislikes: number
          comments_count: number
          created_at: string
          updated_at: string
          user_id: string | null
          designation: string | null
        }
        Insert: {
          id?: string
          title: string
          company: string
          content: string
          category: "Positive" | "Negative" | "Mixed"
          likes?: number
          dislikes?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
          user_id?: string | null
          designation?: string | null
        }
        Update: {
          id?: string
          title?: string
          company?: string
          content?: string
          category?: "Positive" | "Negative" | "Mixed"
          likes?: number
          dislikes?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
          user_id?: string | null
          designation?: string | null
        }
      }
      comments: {
        Row: {
          id: string
          story_id: string
          content: string
          author: string
          likes: number
          dislikes: number
          created_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          story_id: string
          content: string
          author?: string
          likes?: number
          dislikes?: number
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          story_id?: string
          content?: string
          author?: string
          likes?: number
          dislikes?: number
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
      }
      user_interactions: {
        Row: {
          id: string
          user_id: string
          story_id: string | null
          comment_id: string | null
          interaction_type: "like" | "dislike"
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id?: string | null
          comment_id?: string | null
          interaction_type: "like" | "dislike"
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string | null
          comment_id?: string | null
          interaction_type?: "like" | "dislike"
          created_at?: string
        }
      }
      saved_stories: {
        Row: {
          id: string
          user_id: string
          story_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string | null
          created_at: string
          updated_at: string
          anonymous_id: string
        }
        Insert: {
          id?: string
          email?: string | null
          created_at?: string
          updated_at?: string
          anonymous_id: string
        }
        Update: {
          id?: string
          email?: string | null
          created_at?: string
          updated_at?: string
          anonymous_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
