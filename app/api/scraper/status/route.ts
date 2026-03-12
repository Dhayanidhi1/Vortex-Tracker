import { NextResponse } from "next/server"
import { getScraperStatus, getCollectedPosts } from "@/lib/scraper/linkedin-scraper"

export async function GET() {
  const status = getScraperStatus()
  const posts = await getCollectedPosts()
  
  return NextResponse.json({
    ...status,
    totalCollected: posts.length,
  })
}
