import { NextResponse } from "next/server"
import { resetScraper } from "@/lib/scraper/linkedin-scraper"

export async function POST() {
  try {
    resetScraper()
    
    return NextResponse.json({
      success: true,
      message: "Scraper status reset successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to reset scraper" },
      { status: 500 }
    )
  }
}
