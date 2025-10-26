"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { progressAPI } from "@/lib/api"
import { Loader2 } from "lucide-react"

export function MoodForm({ onSuccess }: { onSuccess?: () => void }) {
  const [mood, setMood] = useState<number>(5)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    setErr(null)
    try {
      await progressAPI.logMood({ mood, notes })
      setMsg("Mood logged!")
      setNotes("")
      if (onSuccess) onSuccess()
    } catch (e: any) {
      setErr(e.message || "Failed to log mood")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Your Mood</CardTitle>
        <CardDescription>Rate your mood today (1-10) and add an optional note.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Mood: <span className="font-bold">{mood}</span></label>
            <input
              type="range"
              min={1}
              max={10}
              value={mood}
              onChange={e => setMood(Number(e.target.value))}
              className="w-full"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="(optional)"
              className="w-full border rounded px-3 py-2"
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Mood"}
          </Button>
          {msg && <p className="text-green-600 text-sm mt-2">{msg}</p>}
          {err && <p className="text-destructive text-sm mt-2">{err}</p>}
        </form>
      </CardContent>
    </Card>
  )
}
