"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import type { DashboardStats } from "@/lib/types"
import { useTheme } from "next-themes"

interface AnalyticsPanelProps {
  stats: DashboardStats
}

// Light, vibrant colors for dark mode
const DARK_MODE_COLORS = [
  "#60a5fa", // Light Blue
  "#4ade80", // Light Green
  "#f472b6", // Light Pink
  "#fbbf24", // Light Yellow
  "#a78bfa", // Light Purple
  "#fb923c", // Light Orange
  "#2dd4bf", // Light Teal
  "#c084fc", // Light Violet
  "#34d399", // Light Emerald
  "#fcd34d", // Light Amber
]

// Basic colors for light mode (red, black, gray shades)
const LIGHT_MODE_COLORS = [
  "#dc2626", // Red
  "#000000", // Black
  "#4b5563", // Gray 600
  "#991b1b", // Dark Red
  "#1f2937", // Gray 800
  "#6b7280", // Gray 500
  "#b91c1c", // Red 700
  "#374151", // Gray 700
  "#9ca3af", // Gray 400
  "#7f1d1d", // Red 900
]

export function AnalyticsPanel({ stats }: AnalyticsPanelProps) {
  const { theme } = useTheme()
  
  // Use colorful colors in dark mode, basic colors in light mode
  const COLORS = theme === "dark" ? DARK_MODE_COLORS : LIGHT_MODE_COLORS
  
  // Text color based on theme
  const textColor = theme === "dark" ? "#ffffff" : "hsl(var(--muted-foreground))"
  
  const monthlyData = Object.entries(stats.byMonth).map(([month, count]) => ({
    month: month.substring(5), // Get MM part
    name: new Date(month + "-01").toLocaleDateString("en-US", { month: "short" }),
    posts: count,
  }))

  const authorData = Object.entries(stats.byAuthor)
    .slice(0, 5)
    .map(([name, count]) => ({
      name: name.length > 15 ? name.substring(0, 15) + "..." : name,
      fullName: name,
      posts: count,
    }))

  const keywordData = Object.entries(stats.byKeyword).map(([keyword, count]) => ({
    name: keyword,
    value: count,
  }))

  const typeData = Object.entries(stats.byType).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
  }))

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
          <p className="text-sm font-medium">{label || payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value} posts
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Posts Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === "dark" ? "#60a5fa" : "#dc2626"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={theme === "dark" ? "#60a5fa" : "#dc2626"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={{ fill: textColor, fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: textColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="posts"
                  stroke={theme === "dark" ? "#60a5fa" : "#dc2626"}
                  strokeWidth={2}
                  fill="url(#colorPosts)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Top Authors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={authorData} layout="vertical">
                <XAxis
                  type="number"
                  tick={{ fill: textColor, fontSize: 12 }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: textColor, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="posts"
                  radius={[0, 4, 4, 0]}
                >
                  {authorData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Keyword Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {keywordData.length > 0 ? (
            <>
              <div className="h-[180px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={keywordData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {keywordData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {keywordData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-muted-foreground dark:text-white truncate max-w-[120px]">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[180px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground dark:text-white">No keyword data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Post Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {typeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {typeData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }}
                />
                <span className="text-xs text-muted-foreground dark:text-white">
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
