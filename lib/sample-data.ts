import type { LinkedInPost } from "./types"

// Utility function to calculate stats from posts
export function calculateStats(posts: LinkedInPost[]) {
  const stats = {
    totalPosts: posts.length,
    totalLikes: posts.reduce((sum, p) => sum + p.likes_count, 0),
    totalComments: posts.reduce((sum, p) => sum + p.comments_count, 0),
    totalReposts: posts.reduce((sum, p) => sum + p.reposts_count, 0),
    byMonth: {} as Record<string, number>,
    byAuthor: {} as Record<string, number>,
    byKeyword: {} as Record<string, number>,
    byType: {} as Record<string, number>,
  }

  for (const post of posts) {
    // By month
    if (post.date_posted) {
      const month = post.date_posted.substring(0, 7)
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1
    }

    // By author
    stats.byAuthor[post.author_name] = (stats.byAuthor[post.author_name] || 0) + 1

    // By keyword
    const kwValue = post.matched_keywords
    const keywords = Array.isArray(kwValue)
      ? kwValue
      : typeof kwValue === "string" && kwValue
        ? kwValue.split(", ").map((k) => k.trim())
        : []
    for (const kw of keywords) {
      if (kw) stats.byKeyword[kw.trim()] = (stats.byKeyword[kw.trim()] || 0) + 1
    }

    // By type
    stats.byType[post.post_type] = (stats.byType[post.post_type] || 0) + 1
  }

  // Sort byMonth
  stats.byMonth = Object.fromEntries(
    Object.entries(stats.byMonth).sort(([a], [b]) => a.localeCompare(b))
  )

  // Sort byAuthor by count desc
  stats.byAuthor = Object.fromEntries(
    Object.entries(stats.byAuthor).sort(([, a], [, b]) => b - a).slice(0, 10)
  )

  return stats
}
