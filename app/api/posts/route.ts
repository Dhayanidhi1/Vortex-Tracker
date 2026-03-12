import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { getCollectedPosts } from "@/lib/scraper/linkedin-scraper"

export async function GET() {
  try {
    // Get posts from in-memory scraper first (await the promise)
    const inMemoryPosts = await getCollectedPosts()
    
    // Try to read from the scraper's output directory
    const possiblePaths = [
      path.join(process.cwd(), "linkedin_extractor", "output", "posts.json"), // Main posts file first
      path.join(process.cwd(), "linkedin_extractor", "output", "realtime_posts.json"), // Real-time posts backup
      path.join(process.cwd(), "linkedin_extractor", "data", "posts.json"),
      path.join(process.cwd(), "data", "posts.json"),
    ]

    let filePosts: any[] = []

    for (const filePath of possiblePaths) {
      try {
        const fileContent = await fs.readFile(filePath, "utf-8")
        const parsed = JSON.parse(fileContent)
        filePosts = Array.isArray(parsed) ? parsed : parsed.posts || []
        if (filePosts.length > 0) {
          break
        }
      } catch {
        // File doesn't exist or can't be read, try next path
        continue
      }
    }
    
    // Combine in-memory and file-based posts
    const postsData = [...inMemoryPosts, ...filePosts]

    // Transform data to match our frontend types (LinkedInPost interface)
    const transformedPosts = postsData.map((post: any, index: number) => ({
      id: post.post_url || `post-${index}-${Date.now()}`, // Use post_url as unique ID
      // Original LinkedIn post URL - this is the actual link to the post
      post_url: post.post_url || post.url || post.postUrl || "",
      // Author info
      author_name: post.author_name || post.author?.name || "Unknown Author",
      author_profile_url: post.author_profile_url || post.author?.profileUrl || post.author_url || "",
      // Post content
      post_text: post.post_text || post.content || post.text || "",
      // Dates
      date_posted: post.date_posted || post.timestamp || post.posted_at || null,
      date_posted_raw: post.date_posted_raw || post.date_posted || "",
      // Engagement metrics
      likes_count: parseInt(post.likes_count) || post.likes || post.engagement?.likes || 0,
      comments_count: parseInt(post.comments_count) || post.comments || post.engagement?.comments || 0,
      reposts_count: parseInt(post.reposts_count) || post.reposts || post.engagement?.reposts || 0,
      // Keywords matched
      matched_keywords: post.matched_keywords || post.matchedKeywords || post.keywords || [],
      // Post metadata
      post_type: post.post_type || post.postType || "original",
      scraped_at: post.scraped_at || post.extracted_at || new Date().toISOString(),
    }))

    // Remove duplicates based on post_url
    const uniquePosts = transformedPosts.filter((post, index, self) => 
      index === self.findIndex(p => p.post_url === post.post_url && p.post_url !== "")
    )

    const source = inMemoryPosts.length > 0 
      ? "in-app-scraper" 
      : filePosts.length > 0 
        ? "python-scraper" 
        : "empty"
    
    return NextResponse.json({
      posts: uniquePosts,
      lastUpdated: new Date().toISOString(),
      source,
      inMemoryCount: inMemoryPosts.length,
      fileCount: filePosts.length,
    })
  } catch (error) {
    console.error("Error reading posts data:", error)
    return NextResponse.json(
      {
        posts: [],
        lastUpdated: new Date().toISOString(),
        source: "error",
        error: "Failed to load posts data. Run the Python scraper first.",
      },
      { status: 200 }
    )
  }
}
