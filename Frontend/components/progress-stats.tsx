"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Loader2 } from "lucide-react"
import { progressAPI } from "@/lib/api"


export function ProgressStats() {
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [habitCompletion, setHabitCompletion] = useState<any[]>([])
  const [moodTrend, setMoodTrend] = useState<any[]>([])
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError("")
      
      console.log("[PROGRESS] Fetching all progress data...")
      
      const [weekly, habits, mood, insightsData] = (await Promise.all([
        progressAPI.getWeekly(),
        progressAPI.getHabitsCompletion(),
        progressAPI.getMoodTrend(),
        progressAPI.getInsights(),
      ])) as any[]

      console.log("[PROGRESS] Weekly data:", weekly)
      console.log("[PROGRESS] Habit completion:", habits)
      console.log("[PROGRESS] Mood trend:", mood)
      console.log("[PROGRESS] Insights:", insightsData)

      setWeeklyData(weekly?.weeklyData || [])
      setHabitCompletion(habits?.habitCompletion || [])
      setMoodTrend(mood?.moodTrend || [])
      setInsights(insightsData?.insights || null)
    } catch (err: any) {
      console.error("[PROGRESS] Error fetching progress data:", err)
      setError(err.message || "Failed to load progress data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardContent className="flex justify-center items-center py-36">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Statistics</CardTitle>
          <CardDescription className="text-destructive">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchAllData}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      {/* Weekly Completion */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Completion Rate</CardTitle>
          <CardDescription>Habits completed per week</CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyData && weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="week" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="completed" fill="var(--color-primary)" name="Completed" />
                <Bar dataKey="total" fill="var(--color-muted)" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">No weekly data available</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Habit Completion Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Habit Completion Rates</CardTitle>
            <CardDescription>Average completion % by habit (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {habitCompletion && habitCompletion.length > 0 ? (
                habitCompletion.map((habit, idx) => (
                  <div key={habit.name || idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium flex items-center gap-2">
                        {habit.icon && <span className="text-lg">{habit.icon}</span>}
                        {habit.name}
                      </span>
                      <span className="text-muted-foreground">{habit.value}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${habit.value}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No habit data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mood Trend - Dynamic from Backend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Mood Trend</CardTitle>
            <CardDescription>Your mood throughout the week (1-10)</CardDescription>
          </CardHeader>
          <CardContent>
            {moodTrend && moodTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={moodTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" />
                  <YAxis 
                    stroke="var(--color-muted-foreground)" 
                    domain={[1, 10]}
                    type="number"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => value !== null ? `${value}/10` : 'No entry'}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-primary)", r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-16">No mood data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights - Dynamic from Backend */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Trends</CardTitle>
          <CardDescription>Based on your habit data</CardDescription>
        </CardHeader>
        <CardContent>
          {insights ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Best Day */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground mb-1">Best Day</p>
                <p className="text-2xl font-bold text-primary">{insights.bestDay || 'N/A'}</p>
                <p className="text-xs text-muted-foreground mt-1">Highest completion rate</p>
              </div>

              {/* Most Consistent */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground mb-1">Most Consistent</p>
                {insights.mostConsistent ? (
                  <>
                    <p className="text-2xl font-bold text-accent flex items-center gap-1">
                      {insights.mostConsistent.icon} {insights.mostConsistent.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insights.mostConsistent.streak} day streak
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">No data</p>
                )}
              </div>

              {/* Needs Work */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground mb-1">Needs Work</p>
                {insights.needsWork ? (
                  <>
                    <p className="text-2xl font-bold text-destructive flex items-center gap-1">
                      {insights.needsWork.icon} {insights.needsWork.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insights.needsWork.streak} day streak
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">No data</p>
                )}
              </div>

              {/* Weekly Completions */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground mb-1">Weekly Completions</p>
                <p className="text-2xl font-bold text-primary">{insights.weeklyCompletions}</p>
                <p className="text-xs text-muted-foreground mt-1">This week</p>
              </div>

              {/* Total Habits */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <p className="text-sm font-medium text-foreground mb-1">Total Habits</p>
                <p className="text-2xl font-bold text-accent">{insights.totalHabits}</p>
                <p className="text-xs text-muted-foreground mt-1">Active</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No insights available yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
