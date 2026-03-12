import type { ScraperConfig, ScrapedPost, ScraperStatus, ScraperResult } from "./types"
import { promises as fs } from "fs"
import path from "path"

const DATA_FILE = path.join(process.cwd(), "data", "scraped-posts.json")

// In-memory storage for scraper state
let scraperStatus: ScraperStatus = {
  isRunning: false,
  progress: 0,
  currentKeyword: "",
  postsFound: 0,
  errors: [],
  startedAt: null,
  completedAt: null,
}

let collectedPosts: ScrapedPost[] = []

// Load posts from file on startup
async function loadPostsFromFile(): Promise<ScrapedPost[]> {
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8")
    return JSON.parse(content)
  } catch {
    return []
  }
}

// Save posts to file for persistence
async function savePostsToFile(posts: ScrapedPost[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
    await fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2))
  } catch (error) {
    console.error("Failed to save posts to file:", error)
  }
}

export function getScraperStatus(): ScraperStatus {
  return { ...scraperStatus }
}

export async function getCollectedPosts(): Promise<ScrapedPost[]> {
  if (collectedPosts.length === 0) {
    collectedPosts = await loadPostsFromFile()
  }
  return [...collectedPosts]
}

export function resetScraper(): void {
  scraperStatus = {
    isRunning: false,
    progress: 0,
    currentKeyword: "",
    postsFound: 0,
    errors: [],
    startedAt: null,
    completedAt: null,
  }
}

function parseEngagementCount(text: string): number {
  if (!text) return 0
  const cleaned = text.replace(/,/g, "").trim().toLowerCase()
  
  if (cleaned.includes("k")) {
    return Math.round(parseFloat(cleaned) * 1000)
  }
  if (cleaned.includes("m")) {
    return Math.round(parseFloat(cleaned) * 1000000)
  }
  
  const num = parseInt(cleaned, 10)
  return isNaN(num) ? 0 : num
}

function extractPostId(url: string): string {
  const match = url.match(/activity-(\d+)/) || url.match(/ugcPost-(\d+)/)
  return match ? match[1] : `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function determinePostType(element: any): ScrapedPost["post_type"] {
  const text = element?.textContent?.toLowerCase() || ""
  if (text.includes("reposted") || text.includes("shared")) return "repost"
  if (text.includes("article") || text.includes("published")) return "article"
  return "original"
}

// Simulated scraping function - in production, this would use Puppeteer
export async function runScraper(config: ScraperConfig): Promise<ScraperResult> {
  const startTime = Date.now()
  
  scraperStatus = {
    isRunning: true,
    progress: 0,
    currentKeyword: "",
    postsFound: 0,
    errors: [],
    startedAt: new Date().toISOString(),
    completedAt: null,
  }
  
  const posts: ScrapedPost[] = []
  const errors: string[] = []
  
  try {
    // Dynamic import of puppeteer-core
    const puppeteer = await import("puppeteer-core")
    const chromium = await import("@sparticuz/chromium-min")
    
    const executablePath = await chromium.default.executablePath(
      "https://github.com/nicholasgriffintn/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar"
    )
    
    const browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath,
      headless: true,
    })
    
    const page = await browser.newPage()
    
    // Set user agent to avoid detection
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
    
    for (let i = 0; i < config.keywords.length; i++) {
      const keyword = config.keywords[i]
      scraperStatus.currentKeyword = keyword
      scraperStatus.progress = Math.round((i / config.keywords.length) * 100)
      
      try {
        // Navigate to LinkedIn search
        const searchUrl = `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(keyword)}&origin=GLOBAL_SEARCH_HEADER`
        await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 })
        
        // Wait for content to load
        await page.waitForSelector(".feed-shared-update-v2", { timeout: 10000 }).catch(() => {})
        
        // Scroll to load more posts
        for (let scroll = 0; scroll < 3; scroll++) {
          await page.evaluate(() => window.scrollBy(0, window.innerHeight))
          await new Promise((r) => setTimeout(r, 1500))
        }
        
        // Extract posts
        const extractedPosts = await page.evaluate((kw: string) => {
          const postElements = document.querySelectorAll(".feed-shared-update-v2")
          const results: any[] = []
          
          postElements.forEach((el) => {
            try {
              // Get author info
              const authorEl = el.querySelector(".update-components-actor__name span span")
              const authorName = authorEl?.textContent?.trim() || "Unknown"
              
              const profileLinkEl = el.querySelector(".update-components-actor__container-link")
              const authorProfileUrl = (profileLinkEl as HTMLAnchorElement)?.href || ""
              
              // Get post content
              const contentEl = el.querySelector(".feed-shared-update-v2__description, .feed-shared-text")
              const postText = contentEl?.textContent?.trim() || ""
              
              // Get post URL
              const timestampLink = el.querySelector(".update-components-actor__sub-description a")
              const postUrl = (timestampLink as HTMLAnchorElement)?.href || ""
              
              // Get date
              const dateEl = el.querySelector(".update-components-actor__sub-description-link span")
              const datePostedRaw = dateEl?.textContent?.trim() || ""
              
              // Get engagement
              const likesEl = el.querySelector(".social-details-social-counts__reactions-count")
              const likesCount = likesEl?.textContent?.trim() || "0"
              
              const commentsEl = el.querySelector(".social-details-social-counts__comments")
              const commentsCount = commentsEl?.textContent?.replace(/[^0-9]/g, "") || "0"
              
              const repostsEl = el.querySelector(".social-details-social-counts__item--with-social-proof")
              const repostsCount = repostsEl?.textContent?.replace(/[^0-9]/g, "") || "0"
              
              if (postText && postText.toLowerCase().includes(kw.toLowerCase())) {
                results.push({
                  authorName,
                  authorProfileUrl,
                  postText,
                  postUrl,
                  datePostedRaw,
                  likesCount,
                  commentsCount,
                  repostsCount,
                })
              }
            } catch (e) {
              // Skip malformed posts
            }
          })
          
          return results
        }, keyword)
        
        // Process extracted posts
        for (const raw of extractedPosts) {
          if (posts.length >= config.maxPosts) break
          
          const post: ScrapedPost = {
            id: extractPostId(raw.postUrl),
            post_url: raw.postUrl || `https://linkedin.com/feed/update/${Date.now()}`,
            author_name: raw.authorName,
            author_profile_url: raw.authorProfileUrl,
            post_text: raw.postText,
            date_posted: null,
            date_posted_raw: raw.datePostedRaw,
            likes_count: parseEngagementCount(raw.likesCount),
            comments_count: parseEngagementCount(raw.commentsCount),
            reposts_count: parseEngagementCount(raw.repostsCount),
            matched_keywords: [keyword],
            post_type: "original",
            scraped_at: new Date().toISOString(),
          }
          
          // Check for duplicates
          if (!posts.some((p) => p.post_url === post.post_url)) {
            posts.push(post)
            scraperStatus.postsFound = posts.length
          }
        }
        
      } catch (keywordError: any) {
        const errorMsg = `Error scraping keyword "${keyword}": ${keywordError.message}`
        errors.push(errorMsg)
        scraperStatus.errors.push(errorMsg)
      }
      
      // Rate limiting delay
      await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000))
    }
    
    await browser.close()
    
  } catch (error: any) {
    errors.push(`Scraper error: ${error.message}`)
    scraperStatus.errors.push(`Scraper error: ${error.message}`)
  }
  
  // Update final status
  scraperStatus.isRunning = false
  scraperStatus.progress = 100
  scraperStatus.completedAt = new Date().toISOString()
  
  // Store collected posts
  collectedPosts = [...collectedPosts, ...posts]
  
  return {
    success: errors.length === 0,
    posts,
    totalFound: posts.length,
    errors,
    duration: Date.now() - startTime,
  }
}

// Demo mode - generates sample posts without actual scraping
export async function runDemoScraper(config: ScraperConfig): Promise<ScraperResult> {
  const startTime = Date.now()
  
  scraperStatus = {
    isRunning: true,
    progress: 0,
    currentKeyword: "",
    postsFound: 0,
    errors: [],
    startedAt: new Date().toISOString(),
    completedAt: null,
  }
  
  const posts: ScrapedPost[] = []
  
  const sampleAuthors = [
    { name: "Tech Insider", profile: "https://linkedin.com/in/tech-insider" },
    { name: "Startup Weekly", profile: "https://linkedin.com/in/startup-weekly" },
    { name: "AI News Daily", profile: "https://linkedin.com/in/ai-news" },
    { name: "Business Today", profile: "https://linkedin.com/in/business-today" },
    { name: "Industry Expert", profile: "https://linkedin.com/in/expert" },
  ]
  
  const sampleTexts = [
    "Exciting developments in the AI space! {keyword} is making waves with their innovative approach to solving complex problems.",
    "Just had an amazing conversation about {keyword}. The future of technology looks incredibly promising.",
    "Breaking: {keyword} announces major milestone. This is a game-changer for the industry.",
    "My thoughts on {keyword} and why it matters for the future of business and technology.",
    "Great insights from the team at {keyword}. Their approach to innovation is truly inspiring.",
  ]
  
  for (let i = 0; i < config.keywords.length; i++) {
    const keyword = config.keywords[i]
    scraperStatus.currentKeyword = keyword
    scraperStatus.progress = Math.round(((i + 1) / config.keywords.length) * 50)
    
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 500))
    
    const postsPerKeyword = Math.min(Math.ceil(config.maxPosts / config.keywords.length), 10)
    
    for (let j = 0; j < postsPerKeyword && posts.length < config.maxPosts; j++) {
      const author = sampleAuthors[Math.floor(Math.random() * sampleAuthors.length)]
      const textTemplate = sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
      const postId = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const daysAgo = Math.floor(Math.random() * 30)
      const date = new Date()
      date.setDate(date.getDate() - daysAgo)
      
      const post: ScrapedPost = {
        id: postId,
        post_url: `https://linkedin.com/feed/update/urn:li:activity:${postId}`,
        author_name: author.name,
        author_profile_url: author.profile,
        post_text: textTemplate.replace("{keyword}", keyword),
        date_posted: date.toISOString(),
        date_posted_raw: daysAgo === 0 ? "Today" : daysAgo === 1 ? "1d" : `${daysAgo}d`,
        likes_count: Math.floor(Math.random() * 500) + 10,
        comments_count: Math.floor(Math.random() * 50) + 1,
        reposts_count: Math.floor(Math.random() * 20),
        matched_keywords: [keyword],
        post_type: ["original", "repost", "article"][Math.floor(Math.random() * 3)] as ScrapedPost["post_type"],
        scraped_at: new Date().toISOString(),
      }
      
      posts.push(post)
      scraperStatus.postsFound = posts.length
      scraperStatus.progress = Math.round(50 + ((posts.length / config.maxPosts) * 50))
      
      await new Promise((r) => setTimeout(r, 100))
    }
  }
  
  scraperStatus.isRunning = false
  scraperStatus.progress = 100
  scraperStatus.completedAt = new Date().toISOString()
  
  collectedPosts = [...collectedPosts, ...posts]
  
  return {
    success: true,
    posts,
    totalFound: posts.length,
    errors: [],
    duration: Date.now() - startTime,
  }
}

export function clearCollectedPosts(): void {
  collectedPosts = []
  scraperStatus.postsFound = 0
}
