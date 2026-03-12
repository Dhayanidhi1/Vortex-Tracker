"use client"

import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FilterState } from "@/lib/types"

interface FilterBarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  keywords: string[]
}

export function FilterBar({ filters, onFilterChange, keywords }: FilterBarProps) {
  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFilterChange({
      search: "",
      keyword: "all",
      postType: "all",
      dateRange: "all",
      sortBy: "date",
      sortOrder: "desc",
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.keyword !== "all" ||
    filters.postType !== "all" ||
    filters.dateRange !== "all"

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur" suppressHydrationWarning>
      <div className="flex flex-wrap items-center gap-3" suppressHydrationWarning>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts, authors..."
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>

        <Select value={filters.keyword} onValueChange={(v) => handleChange("keyword", v)}>
          <SelectTrigger className="w-[180px] bg-background/50">
            <SelectValue placeholder="Keyword" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Keywords</SelectItem>
            {keywords.map((kw) => (
              <SelectItem key={kw} value={kw}>
                {kw}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.postType} onValueChange={(v) => handleChange("postType", v)}>
          <SelectTrigger className="w-[150px] bg-background/50">
            <SelectValue placeholder="Post Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="original">Original</SelectItem>
            <SelectItem value="repost">Repost</SelectItem>
            <SelectItem value="article">Article</SelectItem>
            <SelectItem value="shared">Shared</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.dateRange} onValueChange={(v) => handleChange("dateRange", v)}>
          <SelectTrigger className="w-[150px] bg-background/50">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={(v) => handleChange("sortBy", v as FilterState["sortBy"])}>
          <SelectTrigger className="w-[140px] bg-background/50">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="likes">Likes</SelectItem>
            <SelectItem value="comments">Comments</SelectItem>
            <SelectItem value="reposts">Reposts</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
