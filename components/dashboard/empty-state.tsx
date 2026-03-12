"use client"

import { FileJson, Upload, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScraperPanel } from "./scraper-panel"

interface EmptyStateProps {
  onImport: () => void
  onScraperComplete?: () => void
}

export function EmptyState({ onImport, onScraperComplete }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="max-w-2xl border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <FileJson className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">No Posts Found</CardTitle>
          <CardDescription className="text-base">
            Start the built-in scraper or import existing data to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <ScraperPanel onComplete={onScraperComplete} />

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-accent" />
                  <CardTitle className="text-base">Import Data</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>Import existing LinkedIn post data from a CSV or JSON file.</p>
                <Button onClick={onImport} variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Posts
                </Button>
                <p className="text-xs">
                  Supports JSON and CSV formats from the Python scraper or manual exports.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>
              The dashboard auto-refreshes every 30 seconds to display new data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
