"use client"

import { FileText, Heart, MessageSquare, Repeat2, TrendingUp, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { DashboardStats } from "@/lib/types"

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const hasData = stats.totalPosts > 0
  
  const cards = [
    {
      label: "Total Posts",
      value: stats.totalPosts.toLocaleString(),
      icon: FileText,
      description: "Posts collected",
      trend: hasData ? "+12%" : "",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Likes",
      value: stats.totalLikes.toLocaleString(),
      icon: Heart,
      description: "Total reactions",
      trend: hasData ? "+8%" : "",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      label: "Total Comments",
      value: stats.totalComments.toLocaleString(),
      icon: MessageSquare,
      description: "Engagement",
      trend: hasData ? "+15%" : "",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Total Reposts",
      value: stats.totalReposts.toLocaleString(),
      icon: Repeat2,
      description: "Shares",
      trend: hasData ? "+5%" : "",
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      label: "Top Authors",
      value: Object.keys(stats.byAuthor).length.toString(),
      icon: Users,
      description: "Unique authors",
      trend: "",
      color: "text-chart-5",
      bgColor: "bg-chart-5/10",
    },
    {
      label: "Avg. Engagement",
      value: stats.totalPosts > 0 
        ? Math.round((stats.totalLikes + stats.totalComments + stats.totalReposts) / stats.totalPosts).toLocaleString()
        : "0",
      icon: TrendingUp,
      description: "Per post",
      trend: hasData ? "+10%" : "",
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.label} className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              {card.trend && (
                <span className="text-xs font-medium text-accent">{card.trend}</span>
              )}
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold tracking-tight">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
