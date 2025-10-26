"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { HabitCheckIn } from "./habit-check-in"
import { StreakCalendar } from "./streak-calendar"
import { ProgressStats } from "./progress-stats"
import { MotivationalCard } from "./motivational-card"
import { SocialFeatures } from "./social-features"
import { AISuggestions } from "./ai-suggestions"
import { AddHabitModal } from "./add-habit-modal"
import { Flame, LogOut, Plus } from "lucide-react"
import { authAPI } from "@/lib/api"
import { MoodForm } from "./MoodForm"

interface DashboardProps {
  user?: any
  onLogout?: () => void
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"today" | "calendar" | "stats" | "social" | "ai">("today")
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleHabitAdded = useCallback(() => {
    console.log("[DASHBOARD] Habit added, triggering refresh...")
    setRefreshTrigger(prev => prev + 1)
    setShowAddHabit(false)
  }, [])

  const handleLogout = () => {
    authAPI.logout()
    if (onLogout) {
      onLogout()
    } else {
      window.location.href = "/"
    }
  }
  const refreshDashboardData = () => {
    console.log("Dashboard data should refresh — triggered by MoodForm or AddHabit.")
    // You can later add API re-fetch logic here
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Flame className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">WellnessTrack</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {user?.name || "User"}! Build better habits.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setShowAddHabit(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Habit
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="mb-8 flex gap-2 border-b border-border overflow-x-auto">
          {[
            { id: "today", label: "Today", icon: "📅" },
            { id: "calendar", label: "Calendar", icon: "🗓️" },
            { id: "stats", label: "Progress", icon: "📊" },
            { id: "social", label: "Social", icon: "👥" },
            { id: "ai", label: "AI Suggestions", icon: "🤖" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid gap-8">
          {activeTab === "today" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <HabitCheckIn key={`habits-${refreshTrigger}`} />
              </div>
              <div>
                <MotivationalCard />
                
              </div>
            </div>
          )}

          {activeTab === "calendar" && <StreakCalendar />}
          {activeTab === "stats" && <ProgressStats />}
          {activeTab === "social" && <SocialFeatures />}
          {activeTab === "ai" && <AISuggestions />}
        </div>
      </div>

      {/* Add Habit Modal */}
      <AddHabitModal
        open={showAddHabit}
        onClose={() => setShowAddHabit(false)}
        onHabitAdded={handleHabitAdded}
      />
    </div>
  )
}