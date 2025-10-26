"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Share2, UserPlus, Flame, TrendingUp, MessageCircle, Loader2, X, CheckCircle } from "lucide-react"
import { socialAPI, type Friend, type Activity } from "@/lib/api"

export function SocialFeatures() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [activity, setActivity] = useState<Activity[]>([])
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [activeTab, setActiveTab] = useState<"friends" | "activity" | "share">("friends")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setMessage(null)
      
      const [friendsRes, activityRes] = await Promise.all([
        socialAPI.getFriends(),
        socialAPI.getActivity(),
      ])

      const friendsData = friendsRes as { friends?: Friend[] } | undefined
      const activityData = activityRes as { activities?: Activity[] } | undefined

      setFriends(friendsData?.friends ?? [])
      setActivity(activityData?.activities ?? [])
    } catch (err: any) {
      console.error("Error fetching social data:", err)
      setMessage({ type: 'error', text: err.message || "Failed to load social data" })
    } finally {
      setLoading(false)
    }
  }

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      setSending(true)
      setMessage(null)
      await socialAPI.sendRequest(email)
      setEmail("")
      setMessage({ type: 'success', text: 'Friend request sent successfully!' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Failed to send friend request" })
    } finally {
      setSending(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      if (minutes < 1) return "Just now"
      return `${minutes}m ago`
    }
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const renderMessage = () => {
    if (!message) return null
    
    const isError = message.type === 'error'
    
    return (
      <div className={`flex items-center justify-between p-3 mb-4 rounded-lg border ${
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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6">
      {/* Message Area */}
      {renderMessage()}

      {/* Tabs - Original Design */}
      <div className="flex gap-2 border-b border-border">
        {[
          { id: "friends", label: "Friends", icon: "👥" },
          { id: "activity", label: "Activity Feed", icon: "📣" },
          { id: "share", label: "Share Progress", icon: "📤" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
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

      {/* Friends Tab */}
      {activeTab === "friends" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Add Friend - Original Layout */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Add Friends</CardTitle>
              <CardDescription>Search and add friends to stay motivated together</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddFriend} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={sending}
                />
                <Button type="submit" disabled={sending}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Friends List - Original Grid Layout */}
          {friends.length === 0 ? (
             <Card className="lg:col-span-3">
               <CardContent className="text-center text-muted-foreground py-12">
                 No friends yet. Add friends to see their progress!
               </CardContent>
             </Card>
          ) : (
            friends.map((friend) => (
              <Card key={friend.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Friend Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                            {friend.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">{friend.name}</h3>
                          {/* lastActive is not in the new API response, so it's omitted */}
                        </div>
                      </div>
                      {/* Remove button logic is not in the new file, so button is omitted */}
                    </div>

                    {/* Stats - Original Layout */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted/50 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Flame className="h-4 w-4 text-accent" />
                          <span className="text-xs text-muted-foreground">Streak</span>
                        </div>
                        <p className="text-lg font-bold text-foreground">{friend.streak}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-xs text-muted-foreground">Completion</span>
                        </div>
                        <p className="text-lg font-bold text-foreground">{friend.completionRate}%</p>
                      </div>
                    </div>

                    {/* Top Habit - Original Layout */}
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Top Habit</p>
                      <Badge variant="secondary">{friend.topHabit}</Badge>
                    </div>

                    {/* Actions - Original Layout */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Activity Feed Tab - Original Design */}
      {activeTab === "activity" && (
        <Card>
          <CardHeader>
            <CardTitle>Friends Activity</CardTitle>
            <CardDescription>See what your friends are up to</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  No recent activity. Your friends' achievements will appear here!
                </p>
              ) : (
                activity.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="text-2xl flex-shrink-0">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{item.friendName}</span> {item.action}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{formatTimestamp(item.timestamp)}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Share Progress Tab - Original Static Design */}
      {activeTab === "share" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Share Options */}
          <Card>
            <CardHeader>
              <CardTitle>Share Your Progress</CardTitle>
              <CardDescription>Let your friends know about your achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Current Streak
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Share Weekly Stats
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Flame className="h-4 w-4 mr-2" />
                  Share Achievement
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Share Custom Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Share Preview */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your share will look</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      YOU
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Your Name</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
                <p className="text-sm text-foreground">
                  I'm on a 12-day streak with WellnessTrack! Join me and build better habits together.
                </p>
                <div className="flex gap-2">
                  <Badge>12-day streak</Badge>
                  <Badge variant="secondary">75% completion</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
