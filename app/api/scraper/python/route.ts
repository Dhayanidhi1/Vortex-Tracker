import { NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

let pythonScraperProcess: any = null
let isRunning = false
let output: string[] = []

export async function POST(request: Request) {
  try {
    if (isRunning) {
      return NextResponse.json(
        { error: "Python scraper is already running" },
        { status: 409 }
      )
    }

    // Get settings from request body
    const body = await request.json().catch(() => ({}))
    const keywords = body.keywords || "" // No default keyword
    const maxPosts = body.maxPosts || 30

    // Validate keywords
    if (!keywords.trim()) {
      return NextResponse.json(
        { error: "Keywords are required. Please enter keywords to search for." },
        { status: 400 }
      )
    }

    console.log("Starting Python scraper with:", { keywords, maxPosts })

    // Clear old data files before starting new search
    try {
      const fs = require('fs')
      const outputDir = path.join(process.cwd(), "linkedin_extractor", "output")
      
      // Remove old JSON files
      const files = fs.readdirSync(outputDir)
      files.forEach((file: string) => {
        if (file.startsWith('posts_') && file.endsWith('.json')) {
          fs.unlinkSync(path.join(outputDir, file))
        }
        if (file.startsWith('posts_') && file.endsWith('.csv')) {
          fs.unlinkSync(path.join(outputDir, file))
        }
      })
      
      // Clear the main posts.json file if it exists
      const mainPostsFile = path.join(outputDir, 'posts.json')
      if (fs.existsSync(mainPostsFile)) {
        fs.unlinkSync(mainPostsFile)
      }
      
      console.log("Cleared old scraper data files")
    } catch (error) {
      console.log("Note: Could not clear old data files:", error)
    }

    // Reset output
    output = []
    isRunning = true

    const scraperPath = path.join(process.cwd(), "linkedin_extractor")
    
    // Spawn Python process - use shell command string instead of args array
    const command = `py main.py --keywords "${keywords}" --max-posts ${maxPosts}`
    
    console.log("Spawning Python process with command:", command)
    console.log("Working directory:", scraperPath)
    
    pythonScraperProcess = spawn(command, {
      cwd: scraperPath,
      shell: true,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    })

    pythonScraperProcess.stdout.on("data", (data: Buffer) => {
      const text = data.toString()
      output.push(text)
      console.log(`Python scraper: ${text}`)
    })

    pythonScraperProcess.stderr.on("data", (data: Buffer) => {
      const text = data.toString()
      output.push(`ERROR: ${text}`)
      console.error(`Python scraper error: ${text}`)
    })

    pythonScraperProcess.on("close", (code: number) => {
      isRunning = false
      console.log(`Python scraper exited with code ${code}`)
    })

    return NextResponse.json({
      success: true,
      message: "Python scraper started. Check the browser window to solve CAPTCHA if needed.",
    })
  } catch (error: any) {
    isRunning = false
    return NextResponse.json(
      { error: error.message || "Failed to start Python scraper" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    isRunning,
    output: output.slice(-50), // Last 50 lines
  })
}

export async function DELETE() {
  try {
    if (pythonScraperProcess && isRunning) {
      pythonScraperProcess.kill()
      isRunning = false
      return NextResponse.json({
        success: true,
        message: "Python scraper stopped",
      })
    }
    return NextResponse.json({
      success: false,
      message: "No scraper is running",
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to stop Python scraper" },
      { status: 500 }
    )
  }
}
