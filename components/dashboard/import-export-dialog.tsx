"use client"

import * as React from "react"
import { FileJson, FileSpreadsheet, Upload, Download, X, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { LinkedInPost } from "@/lib/types"

interface ImportExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "import" | "export"
  posts: LinkedInPost[]
  onImport: (posts: LinkedInPost[]) => void
}

export function ImportExportDialog({
  open,
  onOpenChange,
  mode,
  posts,
  onImport,
}: ImportExportDialogProps) {
  const [dragActive, setDragActive] = React.useState(false)
  const [importStatus, setImportStatus] = React.useState<"idle" | "success" | "error">("idle")
  const [importCount, setImportCount] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files?.[0]) {
      await processFile(files[0])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files?.[0]) {
      await processFile(files[0])
    }
  }

  const processFile = async (file: File) => {
    try {
      const text = await file.text()
      let data: LinkedInPost[]

      if (file.name.endsWith(".json")) {
        data = JSON.parse(text)
      } else if (file.name.endsWith(".csv")) {
        data = parseCSV(text)
      } else {
        throw new Error("Unsupported file format")
      }

      if (Array.isArray(data) && data.length > 0) {
        onImport(data)
        setImportCount(data.length)
        setImportStatus("success")
        setTimeout(() => {
          onOpenChange(false)
          setImportStatus("idle")
        }, 1500)
      } else {
        setImportStatus("error")
      }
    } catch {
      setImportStatus("error")
    }
  }

  const parseCSV = (text: string): LinkedInPost[] => {
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    const posts: LinkedInPost[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const post: Record<string, unknown> = {}

      headers.forEach((header, index) => {
        const value = values[index]?.trim().replace(/^"|"$/g, "") || ""

        if (["likes_count", "comments_count", "reposts_count"].includes(header)) {
          post[header] = parseInt(value) || 0
        } else {
          post[header] = value
        }
      })

      posts.push(post as unknown as LinkedInPost)
    }

    return posts
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current)
        current = ""
      } else {
        current += char
      }
    }
    result.push(current)
    return result
  }

  const exportToJSON = () => {
    const dataStr = JSON.stringify(posts, null, 2)
    downloadFile(dataStr, "linkedin_posts.json", "application/json")
  }

  const exportToCSV = () => {
    if (posts.length === 0) return

    const headers = [
      "post_url",
      "author_name",
      "author_profile_url",
      "post_text",
      "date_posted",
      "date_posted_raw",
      "likes_count",
      "comments_count",
      "reposts_count",
      "matched_keywords",
      "post_type",
      "scraped_at",
    ]

    const csvRows = [headers.join(",")]

    for (const post of posts) {
      const row = headers.map((header) => {
        let value = post[header as keyof LinkedInPost]
        if (Array.isArray(value)) {
          value = value.join(", ")
        }
        // Escape quotes and wrap in quotes
        const str = String(value || "").replace(/"/g, '""')
        return `"${str}"`
      })
      csvRows.push(row.join(","))
    }

    downloadFile(csvRows.join("\n"), "linkedin_posts.csv", "text/csv")
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "import" ? "Import Data" : "Export Data"}
          </DialogTitle>
          <DialogDescription>
            {mode === "import"
              ? "Import posts from a CSV or JSON file"
              : "Export your posts to a file"}
          </DialogDescription>
        </DialogHeader>

        {mode === "import" ? (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".json,.csv"
              className="hidden"
            />

            <div
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {importStatus === "success" ? (
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-accent/20 p-3">
                    <Check className="h-6 w-6 text-accent" />
                  </div>
                  <p className="mt-3 text-sm font-medium">
                    Successfully imported {importCount} posts
                  </p>
                </div>
              ) : importStatus === "error" ? (
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-destructive/20 p-3">
                    <X className="h-6 w-6 text-destructive" />
                  </div>
                  <p className="mt-3 text-sm font-medium">
                    Failed to import file
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setImportStatus("idle")}
                  >
                    Try again
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Drag and drop a file here, or
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse files
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Supports JSON and CSV files
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <Tabs defaultValue="json" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="json">JSON</TabsTrigger>
              <TabsTrigger value="csv">CSV</TabsTrigger>
            </TabsList>
            <TabsContent value="json" className="space-y-4">
              <div className="flex flex-col items-center rounded-lg border border-border p-6">
                <FileJson className="h-12 w-12 text-primary" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Export {posts.length} posts as JSON
                </p>
                <Button className="mt-4 gap-2" onClick={exportToJSON}>
                  <Download className="h-4 w-4" />
                  Download JSON
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="csv" className="space-y-4">
              <div className="flex flex-col items-center rounded-lg border border-border p-6">
                <FileSpreadsheet className="h-12 w-12 text-accent" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Export {posts.length} posts as CSV
                </p>
                <Button className="mt-4 gap-2" onClick={exportToCSV}>
                  <Download className="h-4 w-4" />
                  Download CSV
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
