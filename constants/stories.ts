import type { Story, Comment } from "@/types"

// Mock data for featured stories
export const FEATURED_STORIES: Story[] = [
  {
    id: "1",
    title: "Outstanding Customer Service at TechCorp",
    company: "TechCorp",
    content:
      "I had an issue with my recent purchase and their support team went above and beyond to help me resolve it. They were patient, knowledgeable, and genuinely cared about my experience.",
    likes: 245,
    dislikes: 12,
    comments: 37,
    date: "2 days ago",
    category: "Positive",
  },
  {
    id: "2",
    title: "Disappointing Experience with FoodDelivery",
    company: "FoodDelivery",
    content:
      "My order arrived 2 hours late and completely cold. When I contacted customer service, they refused to offer any compensation or even acknowledge the issue. Will not be using their service again.",
    likes: 189,
    dislikes: 8,
    comments: 42,
    date: "5 days ago",
    category: "Negative",
  },
  {
    id: "3",
    title: "Mixed Feelings About RetailGiant's Return Policy",
    company: "RetailGiant",
    content:
      "While their products are good quality, their return process is unnecessarily complicated. It took multiple calls and emails to finally get my refund processed after returning a defective item.",
    likes: 132,
    dislikes: 28,
    comments: 19,
    date: "1 week ago",
    category: "Mixed",
  },
]

// Mock data for trending stories
export const TRENDING_STORIES: Story[] = [
  {
    id: "t1",
    title: "Exceptional Return Policy at ElectroMart",
    company: "ElectroMart",
    content:
      "Bought a laptop that had issues within the first week. Their no-questions-asked return policy made the process incredibly smooth. Got a replacement within 3 days!",
    likes: 423,
    dislikes: 15,
    comments: 67,
    date: "1 day ago",
    category: "Positive",
  },
  {
    id: "t2",
    title: "Airline Lost My Luggage and Refused Compensation",
    company: "SkyWings Airlines",
    content:
      "My luggage was lost during a connecting flight. After multiple calls and emails, they admitted fault but offered only a small voucher as compensation. The value of my items was much higher.",
    likes: 389,
    dislikes: 7,
    comments: 93,
    date: "2 days ago",
    category: "Negative",
  },
  {
    id: "t3",
    title: "Gym Membership Hidden Fees",
    company: "FitZone",
    content:
      "The monthly rate advertised was $29.99, but after signing up I discovered multiple 'maintenance fees' and 'facility charges' that nearly doubled the cost. Read the fine print!",
    likes: 312,
    dislikes: 18,
    comments: 54,
    date: "3 days ago",
    category: "Negative",
  },
  {
    id: "t4",
    title: "Amazing Customer Support from SoftTech",
    company: "SoftTech Solutions",
    content:
      "Had an issue with their software that was critical for a project deadline. Their support team worked overtime to fix the bug and even followed up to ensure everything was working properly.",
    likes: 276,
    dislikes: 5,
    comments: 41,
    date: "4 days ago",
    category: "Positive",
  },
  {
    id: "t5",
    title: "Mixed Experience with Food Delivery App",
    company: "QuickBite",
    content:
      "The app is well-designed and easy to use, but delivery times are consistently longer than estimated. Food quality depends entirely on the restaurant, but their customer service is responsive when issues arise.",
    likes: 198,
    dislikes: 42,
    comments: 37,
    date: "5 days ago",
    category: "Mixed",
  },
]

// Mock data for most discussed stories
export const MOST_DISCUSSED_STORIES: Story[] = [
  {
    id: "d1",
    title: "Controversial Policy Change at StreamFlix",
    company: "StreamFlix",
    content:
      "The recent change to limit account sharing has sparked outrage among long-time subscribers. Many are threatening to cancel their subscriptions, while others defend the company's right to protect their revenue.",
    likes: 287,
    dislikes: 312,
    comments: 156,
    date: "3 days ago",
    category: "Mixed",
  },
  {
    id: "d2",
    title: "New Phone Release Plagued with Issues",
    company: "TechGiant",
    content:
      "The latest flagship phone has been reported to have serious battery drain and overheating issues. The company has acknowledged the problems and promised a software fix, but many customers are demanding refunds.",
    likes: 198,
    dislikes: 245,
    comments: 132,
    date: "5 days ago",
    category: "Negative",
  },
]

// Mock data for recent stories
export const RECENT_STORIES: Story[] = [
  {
    id: "r1",
    title: "Excellent Service at LocalCafe",
    company: "LocalCafe",
    content:
      "Visited for the first time yesterday and was blown away by the friendly service and quality of food. The staff went out of their way to accommodate my dietary restrictions.",
    likes: 42,
    dislikes: 3,
    comments: 7,
    date: "2 hours ago",
    category: "Positive",
  },
  {
    id: "r2",
    title: "Misleading Advertising for Fitness Tracker",
    company: "FitTech",
    content:
      "The battery life is nowhere near the advertised 7 days. Mine barely lasts 2 days with normal use. The heart rate monitor is also inconsistent compared to medical-grade devices.",
    likes: 28,
    dislikes: 5,
    comments: 12,
    date: "5 hours ago",
    category: "Negative",
  },
]

// Combine both featured and recent stories for the stories page
export const ALL_STORIES: Story[] = [
  ...FEATURED_STORIES,
  {
    id: "4",
    company: "HealthInsureCo",
    title: "Still Waiting for Claim Resolution",
    content:
      "Filed a claim three months ago and still waiting for a response. Every time I call, I'm put on hold for hours only to be told they're 'still processing' my claim.",
    likes: 87,
    dislikes: 3,
    comments: 12,
    date: "3 hours ago",
    category: "Negative",
  },
  {
    id: "5",
    company: "EcoFriendlyProducts",
    title: "Truly Sustainable Products",
    content:
      "Their commitment to sustainability isn't just marketing. The packaging is 100% recyclable and the product quality is excellent. Worth the premium price!",
    likes: 56,
    dislikes: 2,
    comments: 8,
    date: "12 hours ago",
    category: "Positive",
  },
  {
    id: "6",
    company: "BudgetAirlines",
    title: "You Get What You Pay For",
    content:
      "The flight was delayed but the staff were apologetic and kept us informed. Seating was cramped but that's expected for the price.",
    likes: 42,
    dislikes: 15,
    comments: 7,
    date: "1 day ago",
    category: "Mixed",
  },
  {
    id: "7",
    company: "OnlineEducation",
    title: "Great Content, Poor Platform",
    content:
      "The course content was excellent but the platform is buggy and customer support is non-existent. Had to figure out technical issues on my own.",
    likes: 31,
    dislikes: 8,
    comments: 5,
    date: "1 day ago",
    category: "Mixed",
  },
  {
    id: "8",
    company: "LocalCoffeeShop",
    title: "Best Coffee in Town",
    content:
      "Not only is their coffee amazing, but the staff remembers regular customers and their orders. It's like being part of a community.",
    likes: 112,
    dislikes: 4,
    comments: 23,
    date: "3 days ago",
    category: "Positive",
  },
]

// Mock data for saved stories
export const SAVED_STORIES: Story[] = [
  {
    id: "1",
    title: "Outstanding Customer Service at TechCorp",
    company: "TechCorp",
    content:
      "I had an issue with my recent purchase and their support team went above and beyond to help me resolve it. They were patient, knowledgeable, and genuinely cared about my experience.",
    likes: 245,
    dislikes: 12,
    comments: 37,
    date: "2 days ago",
    category: "Positive",
  },
  {
    id: "5",
    company: "EcoFriendlyProducts",
    title: "Truly Sustainable Products",
    content:
      "Their commitment to sustainability isn't just marketing. The packaging is 100% recyclable and the product quality is excellent. Worth the premium price!",
    likes: 56,
    dislikes: 2,
    comments: 8,
    date: "12 hours ago",
    category: "Positive",
  },
]

// Mock data for user's stories
export const MY_STORIES: Story[] = [
  {
    id: "u1",
    title: "Terrible Experience with Car Rental",
    company: "QuickRent Cars",
    content:
      "Reserved a car online but when I arrived, they claimed they had no record of my reservation. Had to pay double the original price for a smaller car.",
    likes: 32,
    dislikes: 2,
    comments: 8,
    date: "1 week ago",
    category: "Negative",
  },
  {
    id: "u2",
    title: "Great Customer Service at Local Bookstore",
    company: "PageTurner Books",
    content:
      "The staff went out of their way to help me find a rare book. They even called other stores and found it for me.",
    likes: 18,
    dislikes: 0,
    comments: 3,
    date: "2 weeks ago",
    category: "Positive",
  },
]

// Default comments for stories that don't have specific comments
const DEFAULT_COMMENTS: Comment[] = [
  {
    id: "default-1",
    author: "Anonymous",
    content: "Thanks for sharing your experience. This is really helpful information.",
    date: "1 day ago",
    likes: 5,
    dislikes: 0,
  },
  {
    id: "default-2",
    author: "Anonymous",
    content: "I had a similar experience with them. Glad to know I'm not the only one.",
    date: "2 days ago",
    likes: 3,
    dislikes: 1,
  },
]

// Create a comprehensive STORY_DETAILS object with all stories
export const STORY_DETAILS: Record<string, Story & { comments: Comment[] }> = {
  // Original detailed stories
  "1": {
    id: "1",
    title: "Outstanding Customer Service at TechCorp",
    company: "TechCorp",
    content:
      "I had an issue with my recent purchase and their support team went above and beyond to help me resolve it. They were patient, knowledgeable, and genuinely cared about my experience. The representative I spoke with, though I didn't catch their name, spent nearly an hour troubleshooting with me and ultimately found a solution that worked perfectly. What impressed me most was that they followed up two days later to make sure everything was still working well. This kind of personalized service is rare these days, and it's made me a loyal customer for life. I've already recommended them to several friends who were looking for similar products.",
    likes: 245,
    dislikes: 12,
    date: "2 days ago",
    category: "Positive",
    comments: [
      {
        id: "c1",
        author: "Anonymous",
        content: "I had a similar experience with them last month. Their customer service is consistently excellent.",
        date: "1 day ago",
        likes: 18,
        dislikes: 0,
      },
      {
        id: "c2",
        author: "Anonymous",
        content:
          "That's interesting because I had the opposite experience. Maybe it depends on which representative you get?",
        date: "1 day ago",
        likes: 5,
        dislikes: 2,
      },
      {
        id: "c3",
        author: "Anonymous",
        content: "Did they offer any compensation for your trouble? They usually do that.",
        date: "12 hours ago",
        likes: 3,
        dislikes: 0,
      },
    ],
  },
  "2": {
    id: "2",
    title: "Disappointing Experience with FoodDelivery",
    company: "FoodDelivery",
    content:
      "My order arrived 2 hours late and completely cold. When I contacted customer service, they refused to offer any compensation or even acknowledge the issue. Will not be using their service again. The delivery person seemed rushed and annoyed when they finally arrived, and the packaging was damaged. I understand that delays happen, but the complete lack of accountability or customer care was shocking. I've used other food delivery services with occasional issues, but they always make it right. This company seems to have a policy of ignoring customer complaints. Save yourself the frustration and use a different service.",
    likes: 189,
    dislikes: 8,
    date: "5 days ago",
    category: "Negative",
    comments: [
      {
        id: "c4",
        author: "Anonymous",
        content:
          "This happened to me twice! I've switched to a different delivery service and haven't had any issues since.",
        date: "4 days ago",
        likes: 42,
        dislikes: 1,
      },
      {
        id: "c5",
        author: "Anonymous",
        content: "Try contacting them on social media. They seem to respond better there because it's public.",
        date: "3 days ago",
        likes: 28,
        dislikes: 0,
      },
    ],
  },
}

// Add all other stories to STORY_DETAILS with default comments
// Featured stories
;[
  ...FEATURED_STORIES,
  ...ALL_STORIES.slice(3),
  ...TRENDING_STORIES,
  ...MOST_DISCUSSED_STORIES,
  ...RECENT_STORIES,
].forEach((story) => {
  // Skip stories that are already in STORY_DETAILS
  if (!STORY_DETAILS[story.id]) {
    STORY_DETAILS[story.id] = {
      ...story,
      comments: [...DEFAULT_COMMENTS],
    }
  }
})

// Add user stories
MY_STORIES.forEach((story) => {
  if (!STORY_DETAILS[story.id]) {
    STORY_DETAILS[story.id] = {
      ...story,
      comments: [...DEFAULT_COMMENTS],
    }
  }
})

export const ALL_TAGS: string[] = []
