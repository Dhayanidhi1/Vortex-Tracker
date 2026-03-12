import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function DELETE() {
  try {
    const outputDir = path.join(process.cwd(), "linkedin_extractor", "output")
    
    // Get list of files to delete
    const files = await fs.readdir(outputDir)
    const filesToDelete = files.filter(file => 
      (file.startsWith('posts_') && (file.endsWith('.json') || file.endsWith('.csv'))) ||
      file === 'posts.json' ||
      file === 'realtime_posts.json'  // Also clear realtime posts
    )
    
    // Delete each file
    for (const file of filesToDelete) {
      try {
        await fs.unlink(path.join(outputDir, file))
        console.log(`Deleted: ${file}`)
      } catch (error) {
        console.log(`Could not delete ${file}:`, error)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Cleared ${filesToDelete.length} data files`,
      deletedFiles: filesToDelete
    })
  } catch (error: any) {
    console.error("Error clearing posts data:", error)
    return NextResponse.json(
      { error: error.message || "Failed to clear posts data" },
      { status: 500 }
    )
  }
}