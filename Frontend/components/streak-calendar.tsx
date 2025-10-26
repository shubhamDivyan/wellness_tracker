"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { streaksAPI } from "@/lib/api"

interface CalendarData {
  [date: string]: {
    date: string
    completed: boolean
    habits: { name: string; icon: string }[]
  }
}

export function StreakCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<CalendarData>({})
  const [stats, setStats] = useState({
    currentStreak: 0,
    bestStreak: 0,
    completedDays: 0,
    completionRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCalendarData()
    fetchStats()
  }, [currentDate])

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      setError("")
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      
      console.log(`[CALENDAR] Fetching calendar for ${year}-${month}`)
      const response = await streaksAPI.getCalendar(year, month) as any
      
      console.log('[CALENDAR] Response:', response)
      console.log('[CALENDAR] Calendar Data:', response?.calendarData)
      
      setCalendarData(response?.calendarData || {})
    } catch (err: any) {
      console.error("[CALENDAR] Error fetching calendar:", err)
      setError(err.message || "Failed to load calendar")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await streaksAPI.getStats() as any
      console.log('[CALENDAR STATS] Response:', response)
      
      const statsData = response && typeof response === "object" && "stats" in response ? (response as any).stats : {}

      setStats({
        currentStreak: typeof statsData?.currentStreak === "number" ? statsData.currentStreak : 0,
        bestStreak: typeof statsData?.bestStreakEver === "number" ? statsData.bestStreakEver : 0,
        completedDays: typeof statsData?.completedDaysThisMonth === "number" ? statsData.completedDaysThisMonth : 0,
        completionRate: typeof statsData?.completionRate === "number" ? statsData.completionRate : 0
      })
    } catch (err: any) {
      console.error("[CALENDAR STATS] Error fetching stats:", err)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (day: number) => {
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, "0")
    const dayStr = String(day).padStart(2, "0")
    return `${year}-${month}-${dayStr}`
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage === 100) {
      return "text-primary font-bold"
    }
    if (percentage >= 80) {
      return "text-primary"
    }
    if (percentage >= 50) {
      return "text-yellow-500"
    }
    if (percentage > 0) {
      return "text-destructive"
    }
    return "text-muted-foreground"
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  const days = []
  
  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="bg-transparent" />)
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(day)
    const dayData = calendarData[dateStr]
    
    // Check if day is completed
    const isCompleted = dayData && dayData.completed === true
    const isToday = dateStr === new Date().toISOString().split("T")[0]

    console.log(`[CALENDAR DEBUG] Date: ${dateStr}, Completed: ${isCompleted}, Data:`, dayData)

    days.push(
      <div
        key={day}
        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
          isCompleted
            ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg font-bold"
            : "bg-muted text-muted-foreground"
        } ${
          isToday ? "ring-2 ring-primary ring-offset-2" : ""
        }`}
        title={dayData ? `${dayData.habits.length} habits completed` : "No completions"}
      >
        {day}
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Calendar Column */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{monthName} - Habit Streaks</CardTitle>
                <CardDescription>Green = all habits completed, Gray = incomplete</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth} disabled={loading}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth} disabled={loading}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-sm text-destructive mb-4">
                {error}
                <button
                  onClick={fetchCalendarData}
                  className="ml-2 text-primary hover:text-primary/80 font-semibold"
                >
                  Retry
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Calendar Grid */}
                <div>
                  <div className="mb-4 grid grid-cols-7 gap-2 text-center">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="text-xs font-semibold text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">{days}</div>
                </div>

                {/* Legend */}
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-gradient-to-br from-green-400 to-green-600" />
                    <span>All Habits Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted" />
                    <span>Incomplete</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Streak Stats Column */}
      <div className="space-y-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="text-lg">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">🔥 {stats.currentStreak}</div>
              <p className="text-sm text-muted-foreground">days in a row</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className={`font-semibold ${getPercentageColor(stats.completionRate)}`}>
                    {stats.completionRate}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">{stats.completedDays} days completed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Best Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-1">⭐ {stats.bestStreak}</div>
              <p className="text-xs text-muted-foreground">days (all time)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
