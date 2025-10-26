"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Loader2 } from "lucide-react"
import { habitsAPI } from "@/lib/api"

interface AddHabitModalProps {
  open: boolean
  onClose: () => void
  onHabitAdded?: () => void
}

export function AddHabitModal({ open, onClose, onHabitAdded }: AddHabitModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("✅")
  const [target, setTarget] = useState("")
  const [category, setCategory] = useState("other")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !target) {
      setError("Please fill in required fields")
      return
    }

    try {
      setLoading(true)
      setError("")
      
      console.log("[ADD HABIT] Creating habit:", name)
      
      await habitsAPI.create({
        name,
        description,
        icon,
        target,
        category,
        frequency: "daily"
      })

      console.log("[ADD HABIT] ✅ Habit created successfully")

      // Reset form
      setName("")
      setDescription("")
      setIcon("✅")
      setTarget("")
      setCategory("other")
      
      // Call callback instead of reload
      if (onHabitAdded) {
        onHabitAdded()
      }
      
      // Close modal
      onClose()
    } catch (err: any) {
      console.error("[ADD HABIT] Error:", err)
      setError(err.message || "Failed to create habit")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Add New Habit</CardTitle>
              <CardDescription>Create a new habit to track</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Habit Name *</label>
              <Input
                placeholder="e.g., Morning Exercise"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="e.g., 30 minutes of yoga"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <Input
                  placeholder="🏃"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  disabled={loading}
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target *</label>
                <Input
                  placeholder="e.g., 30 min"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="health">Health</option>
                <option value="fitness">Fitness</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="productivity">Productivity</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Habit"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
