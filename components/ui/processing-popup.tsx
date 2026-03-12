"use client"

import * as React from "react"
import { X, Loader2, Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ProcessingPopupProps {
  isOpen: boolean
  onClose: () => void
  message?: string
  progress?: number
  postsFound?: number
}

const motivationalQuotes = [
  "Great things take time... ✨",
  "Searching for amazing content... 🔍",
  "Finding the best posts for you... 🎯",
  "Quality content is worth the wait... 💎",
  "Discovering valuable insights... 🚀",
  "Curating the perfect feed... 📚",
  "Excellence is in progress... ⭐",
  "Building something awesome... 🛠️"
]

export function ProcessingPopup({ 
  isOpen, 
  onClose, 
  message = "Processing is on the way...", 
  progress = 0,
  postsFound = 0 
}: ProcessingPopupProps) {
  const [currentQuote, setCurrentQuote] = React.useState(motivationalQuotes[0])

  // Rotate quotes every 3 seconds
  React.useEffect(() => {
    if (!isOpen) return
    
    const interval = setInterval(() => {
      setCurrentQuote(prev => {
        const currentIndex = motivationalQuotes.indexOf(prev)
        const nextIndex = (currentIndex + 1) % motivationalQuotes.length
        return motivationalQuotes[nextIndex]
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 border-primary/20 bg-card/95 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-5 w-5 text-primary" />
                <Sparkles className="h-3 w-3 text-primary/60 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h3 className="font-semibold text-lg">LinkedIn Scraper</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">{message}</p>
                <p className="text-xs text-muted-foreground mt-1 transition-all duration-500">
                  {currentQuote}
                </p>
              </div>
            </div>

            {postsFound > 0 && (
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Posts found:</span>
                  <span className="font-medium text-primary">{postsFound}</span>
                </div>
              </div>
            )}

            {progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
              Posts will appear in real-time on your dashboard
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}