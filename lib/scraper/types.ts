export interface ScraperConfig {
  keywords: string[]
  maxPosts: number
  searchMode: "keyword" | "hashtag" | "both"
  headless: boolean
}

export interface ScraperStatus {
  isRunning: boolean
  progress: number
  currentKeyword: string
  postsFound: number
  errors: string[]
  startedAt: string | null
  completedAt: string | null
}

export interface ScrapedPost {
  id: string
  post_url: string
  author_name: string
  author_profile_url: string
  post_text: string
  date_posted: string | null
  date_posted_raw: string
  likes_count: number
  comments_count: number
  reposts_count: number
  matched_keywords: string[]
  post_type: "original" | "repost" | "article" | "shared" | "unknown"
  scraped_at: string
}

export interface ScraperResult {
  success: boolean
  posts: ScrapedPost[]
  totalFound: number
  errors: string[]
  duration: number
}
