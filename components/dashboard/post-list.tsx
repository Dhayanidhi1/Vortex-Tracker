"use client"

import { PostCard } from "./post-card"
import type { LinkedInPost } from "@/lib/types"
import { FileSearch, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PostListProps {
  posts: LinkedInPost[]
  isLoading?: boolean
  onClearData?: () => void
}

export function PostList({ posts, isLoading, onClearData }: PostListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-lg border border-border/50 bg-muted/30"
          />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-card/30 py-16">
        <div className="rounded-full bg-muted/50 p-4">
          <FileSearch className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No posts found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters or import new data
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((post, index) => (
          <PostCard key={post.post_url || `post-${index}-${post.scraped_at}`} post={post} />
        ))}
      </div>
      
      {posts.length > 0 && onClearData && (
        <div className="flex justify-center pt-4 border-t border-border/50">
          <Button
            variant="outline"
            onClick={onClearData}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Clear All Data
          </Button>
        </div>
      )}
    </div>
  )
}
