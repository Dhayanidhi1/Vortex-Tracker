import { NextResponse } from "next/server"
import {
  runDemoScraper,
  getScraperStatus,
  resetScraper,
} from "@/lib/scraper/linkedin-scraper"
import type { ScraperConfig } from "@/lib/scraper/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const config: ScraperConfig = {
      keywords: body.keywords || ["Shayak Mazumder", "Adya AI"],
      maxPosts: Math.min(body.maxPosts || 50, 100), // Cap at 100
      searchMode: body.searchMode || "keyword",
      headless: body.headless !== false,
    }
    
    // Check if already running
    const currentStatus = getScraperStatus()
    if (currentStatus.isRunning) {
      return NextResponse.json(
        { error: "Scraper is already running", status: currentStatus },
        { status: 409 }
      )
    }
    
    // Reset before starting
    resetScraper()
    
    // Use real scraper mode by default
    const useDemoMode = body.demoMode === true
    
    if (useDemoMode) {
      // Start demo scraper asynchronously
      runDemoScraper(config).catch(console.error)
    } else {
      // Import and run real scraper
      const { runScraper } = await import("@/lib/scraper/linkedin-scraper")
      // Start real scraper asynchronously
      runScraper(config).catch(console.error)
    }
    
    return NextResponse.json({
      success: true,
      message: "Scraper started",
      config,
      mode: useDemoMode ? "demo" : "real",
    })
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to start scraper" },
      { status: 500 }
    )
  }
}
