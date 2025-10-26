"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Circle } from "lucide-react"
import { habitsAPI, type Habit } from "@/lib/api"

export function HabitCheckIn() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await habitsAPI.getTodayStatus() as { habits: Habit[] }
      setHabits(response.habits || [])
    } catch (err: any) {
      console.error("Error fetching habits:", err)
      setError("Failed to load habits")
    } finally {
      setLoading(false)
    }
  }

  const toggleHabit = async (id: string) => {
    try {
      await habitsAPI.toggleComplete(id, "")
      setHabits((prevHabits) =>
        prevHabits.map((habit) =>
          habit._id === id ? { ...habit, completed: !habit.completed } : habit
        )
      )
    } catch (err: any) {
      console.error("Error toggling habit:", err)
    }
  }

  const completedCount = habits.filter((h) => h.completed).length
  const totalCount = habits.length

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading habits...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Habits</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {completedCount} of {totalCount} completed
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
          No habits yet. Click "Add Habit" to get started!
        </div>
      ) : (
        <div className="space-y-2">
          {habits.map((habit) => (
            <div
              key={habit._id}
              onClick={() => toggleHabit(habit._id)}
              className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                habit.completed
                  ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-gray-800"
              }`}
            >
              <div className="text-2xl">{habit.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{habit.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{habit.description}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>🎯 {habit.target}</span>
                  <span>🔥 {habit.streak} day streak</span>
                </div>
              </div>
              {habit.completed ? (
                <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="h-6 w-6 text-gray-400 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
