import { NextResponse } from "next/server"
import { getCollectedPosts, clearCollectedPosts } from "@/lib/scraper/linkedin-scraper"

export async function GET() {
  const posts = await getCollectedPosts()
  
  return NextResponse.json({
    posts,
    total: posts.length,
    lastUpdated: new Date().toISOString(),
  })
}

export async function DELETE() {
  clearCollectedPosts()
  
  return NextResponse.json({
    success: true,
    message: "Collected posts cleared",
  })
}
