"use client"

import { Linkedin, Upload, Download, RefreshCw, Info, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

interface HeaderProps {
  onImport: () => void
  onExport: () => void
  onRefresh: () => void
  onShowAll?: () => void
  isLoading?: boolean
}

// Custom Vortex Tracker Icon Component
const VortexIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M4.93 4.93l2.83 2.83" />
    <path d="M16.24 16.24l2.83 2.83" />
    <path d="M19.07 4.93l-2.83 2.83" />
    <path d="M7.76 16.24l-2.83 2.83" />
  </svg>
)

export function Header({ onImport, onExport, onRefresh, onShowAll, isLoading }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" suppressHydrationWarning>
      <div className="flex h-16 items-center justify-between px-6" suppressHydrationWarning>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400">
              <VortexIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Vortex Tracker</h1>
              <p className="text-xs text-muted-foreground">Monitoring mentions and engagement</p>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/info">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Info</span>
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={onImport}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          {onShowAll && (
            <Button
              variant="default"
              size="sm"
              onClick={onShowAll}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Show All Posts</span>
            </Button>
          )}
          <div className="ml-2 h-6 w-px bg-border" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
