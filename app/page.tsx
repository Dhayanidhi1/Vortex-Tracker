"use client"

import * as React from "react"
import useSWR from "swr"
import { Header } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { PostList } from "@/components/dashboard/post-list"
import { AnalyticsPanel } from "@/components/dashboard/analytics-panel"
import { ImportExportDialog } from "@/components/dashboard/import-export-dialog"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ScraperPanel } from "@/components/dashboard/scraper-panel"
import { SearchBar } from "@/components/dashboard/search-bar"
import { calculateStats } from "@/lib/sample-data"
import type { LinkedInPost, DashboardStats } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, BarChart3, List } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const { data, error, isLoading: isLoadingData, mutate } = useSWR("/api/posts", fetcher, {
    refreshInterval: 2000, // Refresh every 2 seconds for real-time updates
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 1000, // Reduce deduping interval for faster updates
  })
  
  const [localPosts, setLocalPosts] = React.useState<LinkedInPost[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<"import" | "export">("import")
  const [filters, setFilters] = React.useState({ search: "" })

  // Reset scraper status on mount to prevent "already running" errors
  React.useEffect(() => {
    fetch("/api/scraper/reset", { method: "POST" }).catch(() => {})
  }, [])

  // Clear local posts when starting new search
  const handleScraperStart = React.useCallback(() => {
    setLocalPosts([]) // Clear local posts when new search starts
    mutate() // Refresh API data
  }, [mutate])

  // Combine API data with locally imported posts
  const posts = React.useMemo(() => {
    const apiPosts: LinkedInPost[] = data?.posts || []
    const urlSet = new Set(apiPosts.map((p) => p.post_url))
    const uniqueLocalPosts = localPosts.filter((p) => !urlSet.has(p.post_url))
    const combinedPosts = [...apiPosts, ...uniqueLocalPosts]
    
    // Debug logging
    console.log("Dashboard data update:", {
      apiPostsCount: apiPosts.length,
      localPostsCount: localPosts.length,
      uniqueLocalPostsCount: uniqueLocalPosts.length,
      totalPostsCount: combinedPosts.length,
      dataSource: data?.source,
      lastUpdated: data?.lastUpdated
    })
    
    return combinedPosts
  }, [data?.posts, localPosts, data?.source, data?.lastUpdated])

  const isLoading = isLoadingData
  const lastUpdated = data?.lastUpdated
  const dataSource = data?.source || "loading"

  const keywords = React.useMemo(() => {
    const kws = new Set<string>()
    posts.forEach((post) => {
      const kwValue = post.matched_keywords
      const matches = Array.isArray(kwValue)
        ? kwValue
        : typeof kwValue === "string" && kwValue
          ? kwValue.split(", ")
          : []
      matches.forEach((kw) => kw && kws.add(kw.trim()))
    })
    return Array.from(kws)
  }, [posts])

  const filteredPosts = React.useMemo(() => {
    let result = [...posts]

    // Helper function to clean duplicated names
    const cleanName = (name: string) => {
      if (!name) return name
      const length = name.length
      if (length % 2 === 0 && length >= 2) {
        const halfLength = length / 2
        const firstHalf = name.substring(0, halfLength)
        const secondHalf = name.substring(halfLength)
        if (firstHalf === secondHalf) {
          return firstHalf
        }
      }
      return name
    }

    // Search filter - filter by post text or author name
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (post) =>
          post.post_text.toLowerCase().includes(searchLower) ||
          cleanName(post.author_name).toLowerCase().includes(searchLower)
      )
    }

    // Sort by date (newest first)
    result.sort((a, b) => {
      const aVal = a.date_posted || ""
      const bVal = b.date_posted || ""
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    })

    return result
  }, [posts, filters.search])

  // Calculate stats from filtered posts instead of all posts
  const filteredStats: DashboardStats = React.useMemo(() => calculateStats(filteredPosts), [filteredPosts])

  const handleImport = () => {
    setDialogMode("import")
    setDialogOpen(true)
  }

  const handleExport = () => {
    setDialogMode("export")
    setDialogOpen(true)
  }

  const handleRefresh = () => {
    mutate() // Re-fetch from API
  }

  const handleShowAll = () => {
    mutate() // Re-fetch from API
  }



  const handleImportPosts = (importedPosts: LinkedInPost[]) => {
    // Add imported posts to local state
    const urlSet = new Set(localPosts.map((p) => p.post_url))
    const newPosts = importedPosts.filter((p) => !urlSet.has(p.post_url))
    setLocalPosts([...localPosts, ...newPosts])
  }

  const handleClearAllData = async () => {
    try {
      // Clear server-side data files
      await fetch("/api/posts/clear", { method: "DELETE" })
      // Clear local state
      setLocalPosts([])
      // Refresh to update UI
      mutate()
    } catch (error) {
      console.error("Failed to clear data:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background" suppressHydrationWarning>
      <Header
        onImport={handleImport}
        onExport={handleExport}
        onRefresh={handleRefresh}
        onShowAll={handleShowAll}
        isLoading={isLoading}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {lastUpdated && posts.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Data source: {dataSource === "in-app-scraper" ? "Built-in scraper" : dataSource === "python-scraper" ? "Python scraper" : "Imported"}
                {isLoading && <span className="ml-2 text-blue-500">• Refreshing...</span>}
                <span className="ml-2 text-xs opacity-75">({posts.length} posts)</span>
              </span>
              <span>Last updated: {new Date(lastUpdated).toLocaleString()}</span>
            </div>
          )}
          
          <StatsCards stats={filteredStats} />

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="posts" className="gap-2">
                <List className="h-4 w-4" />
                All Posts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  {posts.length === 0 ? (
                    <EmptyState onImport={handleImport} onScraperComplete={handleRefresh} />
                  ) : (
                    <>
                      <SearchBar 
                        value={filters.search} 
                        onChange={(value) => setFilters({ search: value })} 
                      />
                      <PostList posts={filteredPosts.slice(0, 6)} isLoading={isLoading} onClearData={handleClearAllData} />
                    </>
                  )}
                </div>
                <div className="space-y-4">
                  <ScraperPanel onComplete={handleRefresh} onStart={handleScraperStart} />
                  <AnalyticsPanel stats={filteredStats} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsPanel stats={filteredStats} />
            </TabsContent>

            <TabsContent value="posts" className="space-y-6">
              <SearchBar 
                value={filters.search} 
                onChange={(value) => setFilters({ search: value })} 
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredPosts.length} posts
                </p>
              </div>
              {posts.length === 0 ? (
                <EmptyState onImport={handleImport} onScraperComplete={handleRefresh} />
              ) : (
                <PostList posts={filteredPosts} isLoading={isLoading} onClearData={handleClearAllData} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <ImportExportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        posts={posts}
        onImport={handleImportPosts}
      />
    </div>
  )
}
