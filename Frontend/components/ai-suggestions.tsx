"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Plus, Clock, Layers, Loader2, RefreshCw, X, CheckCircle } from "lucide-react"
import { aiAPI, type AISuggestion } from "@/lib/api"

// Restored original difficulty color mapping
const difficultyColors: { [key: string]: string } = {
  Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
}

const getDifficultyColor = (difficulty: string) => {
  return difficultyColors[difficulty] || difficultyColors.default
}

export function AISuggestions() {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      setMessage(null)
      const response = await aiAPI.getSuggestions() as { suggestions: AISuggestion[] }
      setSuggestions(response.suggestions || [])
    } catch (err: any) {
      console.error("Error fetching suggestions:", err)
      setMessage({ type: 'error', text: err.message || "Failed to load suggestions" })
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (id: string) => {
    try {
      setAccepting(id)
      setMessage(null)
      await aiAPI.acceptSuggestion(id)
      
      // Remove from suggestions
      setSuggestions((prev) => prev.filter((s) => s._id !== id))
      
      setMessage({ type: 'success', text: 'Habit created successfully! Check your habits list.' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Failed to accept suggestion" })
    } finally {
      setAccepting(null)
    }
  }

  const handleDismiss = async (id: string) => {
    try {
      setMessage(null)
      await aiAPI.dismissSuggestion(id)
      setSuggestions((prev) => prev.filter((s) => s._id !== id))
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Failed to dismiss suggestion" })
    }
  }

  const handleRegenerate = async () => {
    try {
      setRegenerating(true)
      setMessage(null)
      await aiAPI.regenerate()
      await fetchSuggestions()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Failed to regenerate suggestions" })
    } finally {
      setRegenerating(false)
    }
  }

  const renderMessage = () => {
    if (!message) return null
    
    const isError = message.type === 'error'
    
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border ${
        isError
          ? 'bg-destructive/10 border-destructive/20 text-destructive'
          : 'bg-primary/10 border-primary/20 text-primary'
      }`}>
        <div className="flex items-center gap-2">
          {isError ? <X className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setMessage(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {/* Header - Original Design */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/20 p-2">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>AI-Powered Habit Suggestions</CardTitle>
                <CardDescription>Personalized recommendations based on your habits and goals</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={regenerating || loading}
            >
              {regenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Message Area */}
      {renderMessage()}

      {/* Loading State - Original Design */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating personalized suggestions...</p>
            </div>
          </CardContent>
        </Card>
      ) : suggestions.length === 0 ? (
        // Empty State - Styled to match theme
        <Card>
          <CardContent className="flex justify-center py-12">
            <div className="text-center">
              <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No new suggestions at the moment. Keep up the great work!
              </p>
              <Button
                variant="outline"
                onClick={handleRegenerate}
                className="mt-4"
                disabled={regenerating}
              >
                {regenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Generate New Suggestions
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Suggestions Grid - Original Layout
        <div className="grid gap-4 lg:grid-cols-2">
          {suggestions.map((suggestion) => (
            <Card key={suggestion._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Habit Name and Category - Original Layout */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{suggestion.habitName}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">
                      {suggestion.category}
                    </Badge>
                  </div>

                  {/* Reason - Original Styling */}
                  <div className="rounded-lg bg-muted/50 p-3 border border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Why this habit?</p>
                    <p className="text-sm text-foreground">{suggestion.reason}</p>
                  </div>

                  {/* Details - Original Layout */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="text-sm font-medium text-foreground">{suggestion.timeCommitment}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Difficulty</p>
                        <Badge
                          variant="secondary"
                          className={`text-xs mt-1 ${getDifficultyColor(suggestion.difficulty)}`}
                        >
                          {suggestion.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - New Functionality */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleAccept(suggestion._id)}
                      disabled={accepting === suggestion._id}
                      className="flex-1"
                    >
                      {accepting === suggestion._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add to My Habits
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDismiss(suggestion._id)}
                      disabled={accepting === suggestion._id}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card - Original Design */}
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center">
            These suggestions are generated by AI based on your current habits, completion rates, and wellness goals.
            Feel free to add any that resonate with you, or generate new suggestions anytime.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
