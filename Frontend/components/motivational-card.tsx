"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Heart, Share2, Zap, Loader2 } from "lucide-react"
import { streaksAPI } from "@/lib/api"
import { MoodForm } from "./MoodForm"

interface Quote {
  quote: string
  author: string
  category: string
}

const ACHIEVEMENT_ICONS: { [key: string]: string } = {
  "7-Day Streak": "🔥",
  "14-Day Streak": "🏆",
  "30-Day Streak": "🎖️",
  "Perfect Week": "✅"
}

export function MotivationalCard() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [achievements, setAchievements] = useState<string[]>([])
  const [achievementsLoading, setAchievementsLoading] = useState(true)

  const fetchQuote = async () => {
    setLoading(true)
    setError(null)
    setLiked(false)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_QUOTE_API_URL}`, {
        method: 'GET',
        headers: { 'X-Api-Key': `${process.env.NEXT_PUBLIC_QUOTE_API_KEY}` }
      })
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }
      const data: Quote[] = await response.json()
      if (data && data.length > 0) {
        setQuote(data[0])
      } else {
        throw new Error("No quote received")
      }
    } catch (err: any) {
      console.error('Error fetching quote:', err)
      setError(err.message || "Failed to fetch quote")
      setQuote(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchAchievements = async () => {
    try {
      setAchievementsLoading(true)
      type StatsResponse = { stats?: { achievements?: string[] } }
      const response = (await streaksAPI.getStats()) as unknown
      console.log('[ACHIEVEMENTS] Stats response:', response)

      if (response && typeof response === 'object' && 'stats' in response) {
        const resp = response as StatsResponse
        setAchievements(resp.stats?.achievements || [])
      } else {
        console.warn('[ACHIEVEMENTS] Unexpected response shape', response)
        setAchievements([])
      }
    } catch (err: any) {
      console.error('[ACHIEVEMENTS] Error fetching achievements:', err)
      setAchievements([])
    } finally {
      setAchievementsLoading(false)
    }
  }

  useEffect(() => {
    fetchQuote()
    fetchAchievements()
  }, [])

  const getNewQuote = () => {
    fetchQuote()
  }

  // Get default achievements if none unlocked
  const displayAchievements = achievements.length > 0 
    ? achievements 
    : ["7-Day Streak", "14-Day Streak", "Perfect Week", "30-Day Streak"]

  return (
    <div className="space-y-4">
      {/* Motivational Message */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <Zap className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-xs font-semibold text-primary uppercase">Daily Motivation</span>
            </div>

            <div className="flex items-center justify-center min-h-[100px]">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : error ? (
                <p className="text-sm text-destructive text-center">{error}</p>
              ) : quote ? (
                <div className="text-left">
                  <p className="text-lg font-semibold text-foreground leading-relaxed">"{quote.quote}"</p>
                  <p className="text-sm text-muted-foreground text-right mt-2">- {quote.author}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No quote available.</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLiked(!liked)}
                className={liked ? "text-primary" : ""}
                disabled={loading || !!error}
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" disabled={loading || !!error}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={getNewQuote} 
                className="ml-auto"
                disabled={loading}
              >
                {loading ? "..." : "Next"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    
          <MoodForm/>
      

      {/* Achievements (Dynamic from backend) */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Achievements</h3>
          {achievementsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {displayAchievements.map((achievement, idx) => {
                const isUnlocked = achievements.includes(achievement)
                return (
                  <div
                    key={idx}
                    className={`rounded-lg p-3 text-center transition-all ${
                      isUnlocked
                        ? "bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30"
                        : "bg-muted border border-border opacity-50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{ACHIEVEMENT_ICONS[achievement] || "🏅"}</div>
                    <p className="text-xs font-medium text-foreground">{achievement}</p>
                    {!isUnlocked && <p className="text-xs text-muted-foreground mt-1">Locked</p>}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
