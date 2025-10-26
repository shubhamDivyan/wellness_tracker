"use client"

import { useState, useEffect } from "react"
import { LoginPage } from "@/components/auth/login-page"
import { SignupPage } from "@/components/auth/signup-page"
import { Dashboard } from "@/components/dashboard"
import { getAuthToken, setAuthToken } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user has token in sessionStorage
    checkAuth()
  }, [])

  const checkAuth = () => {
    try {
      const token = getAuthToken()
      
      console.log("[HOME] Token exists:", !!token)

      if (token) {
        // Token exists - just use it
        // Get user data from sessionStorage too
        const userDataStr = sessionStorage.getItem('userData')
        
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr)
            console.log("[HOME] ✅ Found token and user data, auto-login")
            setUser(userData)
            setIsAuthenticated(true)
          } catch {
            console.log("[HOME] User data invalid, use empty")
            setUser({})
            setIsAuthenticated(true)
          }
        } else {
          console.log("[HOME] No user data, but token exists")
          setUser({})
          setIsAuthenticated(true)
        }
      } else {
        console.log("[HOME] No token found")
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("[HOME] Auth check error:", error)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (userData: any) => {
    console.log("[HOME] User logged in:", userData)
    // Save user data to sessionStorage
    sessionStorage.setItem('userData', JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleSignup = (userData: any) => {
    console.log("[HOME] User signed up:", userData)
    // Save user data to sessionStorage
    sessionStorage.setItem('userData', JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    console.log("[HOME] User logged out")
    setAuthToken(null)
    sessionStorage.removeItem('userData')
    setUser(null)
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return showSignup ? (
      <SignupPage
        onSignup={handleSignup}
        onSwitchToLogin={() => setShowSignup(false)}
      />
    ) : (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToSignup={() => setShowSignup(true)}
      />
    )
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}
