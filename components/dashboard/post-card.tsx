"use client"

import { ExternalLink, Heart, MessageSquare, Repeat2, User, Calendar, Tag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { LinkedInPost } from "@/lib/types"

interface PostCardProps {
  post: LinkedInPost
}

export function PostCard({ post }: PostCardProps) {
  const kwValue = post.matched_keywords
  const keywords = Array.isArray(kwValue)
    ? kwValue
    : typeof kwValue === "string" && kwValue
      ? kwValue.split(", ").map((k) => k.trim())
      : []

  // Fix duplicated author names (e.g., "Versia SriVersia Sri" -> "Versia Sri")
  const cleanAuthorName = (name: string) => {
    if (!name) return name
    
    // Check if the name is exactly duplicated by comparing first and second half
    const length = name.length
    if (length % 2 === 0 && length >= 2) {
      const halfLength = length / 2
      const firstHalf = name.substring(0, halfLength)
      const secondHalf = name.substring(halfLength)
      
      // If both halves are identical, return only the first half
      if (firstHalf === secondHalf) {
        return firstHalf
      }
    }
    
    return name
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return post.date_posted_raw
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getPostTypeBadge = (type: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
      original: { variant: "default", label: "Original" },
      repost: { variant: "secondary", label: "Repost" },
      article: { variant: "outline", label: "Article" },
      shared: { variant: "secondary", label: "Shared" },
      unknown: { variant: "outline", label: "Unknown" },
    }
    return variants[type] || variants.unknown
  }

  const typeBadge = getPostTypeBadge(post.post_type)

  return (
    <Card className="group border-border/50 bg-card/80 backdrop-blur transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <a
                href={post.author_profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                {cleanAuthorName(post.author_name)}
              </a>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(post.date_posted)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={typeBadge.variant} className="text-xs">
              {typeBadge.label}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              asChild
            >
              <a href={post.post_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">View on LinkedIn</span>
              </a>
            </Button>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-foreground/90 line-clamp-4">
          {post.post_text}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <Tag className="h-3 w-3 text-muted-foreground" />
          {keywords.map((kw) => (
            <Badge key={kw} variant="outline" className="text-xs font-normal">
              {kw}
            </Badge>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-6 border-t border-border/50 pt-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 text-chart-4" />
            <span className="font-medium text-foreground">{post.likes_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4 text-accent" />
            <span className="font-medium text-foreground">{post.comments_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Repeat2 className="h-4 w-4 text-chart-3" />
            <span className="font-medium text-foreground">{post.reposts_count.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
