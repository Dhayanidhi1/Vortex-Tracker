export interface LinkedInPost {
  id?: number
  post_url: string
  author_name: string
  author_profile_url: string
  post_text: string
  date_posted: string | null
  date_posted_raw: string
  likes_count: number
  comments_count: number
  reposts_count: number
  matched_keywords: string | string[]
  post_type: "original" | "repost" | "article" | "shared" | "unknown"
  scraped_at: string
}

export interface DashboardStats {
  totalPosts: number
  totalLikes: number
  totalComments: number
  totalReposts: number
  byMonth: Record<string, number>
  byAuthor: Record<string, number>
  byKeyword: Record<string, number>
  byType: Record<string, number>
}

export interface FilterState {
  search: string
  keyword: string
  postType: string
  dateRange: string
  sortBy: "date" | "likes" | "comments" | "reposts"
  sortOrder: "asc" | "desc"
}
