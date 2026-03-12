"use client"

import * as React from "react"
import { Play, Square, Loader2, AlertCircle, CheckCircle, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ProcessingPopup } from "@/components/ui/processing-popup"

interface ScraperStatus {
  isRunning: boolean
  progress: number
  currentKeyword: string
  postsFound: number
  errors: string[]
  startedAt: string | null
  completedAt: string | null
  totalCollected: number
}

interface ScraperPanelProps {
  onComplete?: () => void
  onStart?: () => void
}

export function ScraperPanel({ onComplete, onStart }: ScraperPanelProps) {
  const [status, setStatus] = React.useState<ScraperStatus | null>(null)
  const [keywords, setKeywords] = React.useState("") // Empty by default
  const [maxPosts, setMaxPosts] = React.useState(30)
  const [isStarting, setIsStarting] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [pythonScraperRunning, setPythonScraperRunning] = React.useState(false)
  const [pythonScraperStarting, setPythonScraperStarting] = React.useState(false)
  const [showProcessingPopup, setShowProcessingPopup] = React.useState(false)
  const [processingMessage, setProcessingMessage] = React.useState("Processing is on the way...")
  const [postsFound, setPostsFound] = React.useState(0)
  
  // Poll for Python scraper status
  React.useEffect(() => {
    const checkPythonStatus = async () => {
      try {
        const res = await fetch("/api/scraper/python")
        const data = await res.json()
        setPythonScraperRunning(data.isRunning)
      } catch {
        // Silent fail
      }
    }
    
    checkPythonStatus()
    const interval = setInterval(checkPythonStatus, 2000)
    return () => clearInterval(interval)
  }, [])
  
  // Poll for status updates
  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/scraper/status")
        const data = await res.json()
        
        // Check if scraper just completed
        const wasRunning = status?.isRunning
        const justCompleted = wasRunning && !data.isRunning && data.completedAt
        
        setStatus(data)
        
        // If just completed, trigger refresh after a short delay
        if (justCompleted) {
          setTimeout(() => {
            onComplete?.()
          }, 500)
        }
      } catch {
        // Silent fail for status polling
      }
    }
    
    fetchStatus()
    const interval = setInterval(fetchStatus, 1000)
    return () => clearInterval(interval)
  }, [status?.isRunning, onComplete])
  
  const handleStart = async () => {
    setIsStarting(true)
    setError(null)
    
    try {
      const keywordList = keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0)
      
      if (keywordList.length === 0) {
        setError("Please enter at least one keyword")
        setIsStarting(false)
        return
      }
      
      const res = await fetch("/api/scraper/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: keywordList,
          maxPosts,
          demoMode: true, // Use demo mode with realistic URLs
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || "Failed to start scraper")
      }
    } catch (err: any) {
      setError(err.message || "Failed to start scraper")
    } finally {
      setIsStarting(false)
    }
  }
  
  const handleClearResults = async () => {
    try {
      await fetch("/api/scraper/results", { method: "DELETE" })
      onComplete?.()
    } catch {
      // Silent fail
    }
  }
  
  const handleStartPythonScraper = async () => {
    setPythonScraperStarting(true)
    setError(null)
    setPostsFound(0)
    
    // Validate keywords
    if (!keywords.trim()) {
      setError("Please enter keywords in the settings (click the gear icon)")
      setPythonScraperStarting(false)
      return
    }
    
    try {
      // Notify parent component to clear data
      onStart?.()
      
      // Show processing popup IMMEDIATELY
      setShowProcessingPopup(true)
      setProcessingMessage("Initializing scraper...")
      
      console.log("Starting Python scraper with keywords:", keywords)
      
      // Send keywords and maxPosts to the Python scraper
      const res = await fetch("/api/scraper/python", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: keywords,
          maxPosts: maxPosts
        })
      })
      const data = await res.json()
      
      console.log("Python scraper API response:", data)
      
      if (!res.ok) {
        setError(data.error || "Failed to start Python scraper")
        setShowProcessingPopup(false)
        setPythonScraperStarting(false)
        return
      }
      
      setPythonScraperRunning(true)
      setProcessingMessage("Searching LinkedIn for posts...")
      
      // Poll for completion and auto-refresh
      const statusInterval = setInterval(async () => {
        const statusRes = await fetch("/api/scraper/python")
        const statusData = await statusRes.json()
        if (!statusData.isRunning) {
          setPythonScraperRunning(false)
          clearInterval(statusInterval)
          clearInterval(postsInterval)
          
          // Update final message and close popup after delay
          setProcessingMessage("Search completed! Loading results...")
          setTimeout(() => {
            setShowProcessingPopup(false)
            onComplete?.()
          }, 1000)
        }
      }, 2000)
      
      // Update posts count periodically
      const postsInterval = setInterval(async () => {
        try {
          const postsRes = await fetch("/api/posts")
          const postsData = await postsRes.json()
          const currentPostCount = postsData.posts?.length || 0
          setPostsFound(currentPostCount)
          
          if (currentPostCount > 0) {
            setProcessingMessage(`Found ${currentPostCount} posts and counting...`)
          }
        } catch {
          // Silent fail
        }
      }, 2000)
      
    } catch (err: any) {
      console.error("Error starting Python scraper:", err)
      setError(err.message || "Failed to start Python scraper")
      setShowProcessingPopup(false)
    } finally {
      setPythonScraperStarting(false)
    }
  }
  
  const handleStopPythonScraper = async () => {
    try {
      await fetch("/api/scraper/python", { method: "DELETE" })
      setPythonScraperRunning(false)
      setShowProcessingPopup(false)
    } catch {
      // Silent fail
    }
  }
  
  const handleClosePopup = () => {
    setShowProcessingPopup(false)
  }
  
  const isRunning = status?.isRunning || isStarting
  
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              LinkedIn Scraper
              {isRunning && (
                <Badge variant="secondary\" className="animate-pulse">
                  Running
                </Badge>
              )}
              {status?.completedAt && !isRunning && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Complete
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Extract posts mentioning your keywords
            </CardDescription>
          </div>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isRunning}>
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scraper Settings</DialogTitle>
                <DialogDescription>
                  Configure keywords and extraction limits
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Enter names, companies, or topics to search for"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter names, companies, or topics to search for
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Maximum Posts: {maxPosts}</Label>
                  <Slider
                    value={[maxPosts]}
                    onValueChange={(v) => setMaxPosts(v[0])}
                    min={10}
                    max={100}
                    step={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    Limit the number of posts to extract
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setSettingsOpen(false)}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isRunning && status && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Searching: <span className="text-foreground font-medium">{status.currentKeyword || "..."}</span>
              </span>
              <span className="text-muted-foreground">
                {status.postsFound} posts found
              </span>
            </div>
            <Progress value={status.progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {status.progress}% complete
            </p>
          </div>
        )}
        
        {!isRunning && status?.totalCollected && status.totalCollected > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                {status.totalCollected} posts collected
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearResults}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        )}
        
        {!pythonScraperRunning && !isRunning && (
          <div className="text-xs text-muted-foreground p-2 rounded bg-muted/30">
            ℹ️ Scraper ready. Click a button above to start collecting posts.
          </div>
        )}
        
        {status?.errors && status.errors.length > 0 && (
          <div className="text-xs text-destructive">
            {status.errors.slice(-2).map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={handleStart}
            disabled={isRunning}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Demo Scraper
              </>
            )}
          </Button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>
        
        <Button
          onClick={pythonScraperRunning ? handleStopPythonScraper : handleStartPythonScraper}
          disabled={pythonScraperStarting}
          variant={pythonScraperRunning ? "destructive" : "default"}
          className="w-full"
        >
          {pythonScraperStarting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : pythonScraperRunning ? (
            <>
              <Square className="mr-2 h-4 w-4" />
              Stop Python Scraper
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Real LinkedIn Scraper
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          {pythonScraperRunning ? (
            <>
              <strong>Searching for: "{keywords}"</strong>
              <br />
              Posts will appear in real-time on your dashboard.
            </>
          ) : (
            <>
              Will search for: <strong>"{keywords || 'Enter keywords above'}"</strong>
              <br />
              Real scraper runs in background and shows posts in real-time.
            </>
          )}
        </p>
      </CardContent>
      
      <ProcessingPopup
        isOpen={showProcessingPopup}
        onClose={handleClosePopup}
        message={processingMessage}
        postsFound={postsFound}
      />
    </Card>
  )
}
