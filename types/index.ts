// Story Types
export interface Story {
  id: string
  title: string
  company: string
  content: string
  likes: number
  dislikes: number
  comments: number
  date: string
  category: "Positive" | "Negative" | "Mixed"
}

export interface Comment {
  id: string
  author: string
  content: string
  date: string
  likes: number
  dislikes: number
}

// Form Types
export interface ShareStoryFormData {
  company: string
  designation: string
  title: string
  content: string
  category: string
  agreeToTerms: boolean
}

export interface QuickReviewFormData {
  company: string
  rating: number
  comment: string
  agreeToTerms: boolean
}

// Component Props Types
export interface AnnouncementProps {
  title?: string
  content: string
  showDismiss?: boolean
}
