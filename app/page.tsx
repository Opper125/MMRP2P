"use client"

import { useState, useEffect } from "react"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { LoginForm } from "@/components/auth/login-form"
import { GPSPermission } from "@/components/gps-permission"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { LanguageSwitcher } from "@/components/language-switcher"
import { authService } from "@/lib/auth"
import type { Language } from "@/lib/i18n"
import type { AuthUser } from "@/lib/auth"

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [hasGPSPermission, setHasGPSPermission] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [language, setLanguage] = useState<Language>("en")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing user session
    const user = authService.getCurrentUser()
    if (user) {
      setCurrentUser(user)
      // Check GPS permission for existing users
      checkGPSPermission()
    }
    setIsLoading(false)

    // Load saved language preference
    const savedLang = localStorage.getItem("preferred_language") as Language
    if (savedLang) {
      setLanguage(savedLang)
    }
  }, [])

  const checkGPSPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setHasGPSPermission(true),
        () => setHasGPSPermission(false),
        { timeout: 5000 },
      )
    }
  }

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("preferred_language", lang)
  }

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user)
    checkGPSPermission()
  }

  const handleGPSPermission = (position: GeolocationPosition) => {
    setHasGPSPermission(true)
    console.log("GPS Permission granted:", position.coords)
  }

  const handleLogout = () => {
    authService.signOut()
    setCurrentUser(null)
    setHasGPSPermission(false)

    // Reset URL for VIP users
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", window.location.origin)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show GPS permission screen if user is logged in but no GPS permission
  if (currentUser && !hasGPSPermission) {
    return (
      <>
        <LanguageSwitcher onLanguageChange={handleLanguageChange} currentLang={language} />
        <GPSPermission onPermissionGranted={handleGPSPermission} language={language} />
      </>
    )
  }

  // Show dashboard if user is logged in and has GPS permission
  if (currentUser && hasGPSPermission) {
    return (
      <DashboardLayout
        user={currentUser}
        language={language}
        onLanguageChange={handleLanguageChange}
        onLogout={handleLogout}
      />
    )
  }

  // Show authentication forms
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <LanguageSwitcher onLanguageChange={handleLanguageChange} currentLang={language} />

      {isSignUp ? (
        <SignUpForm onSuccess={handleAuthSuccess} onSwitchToLogin={() => setIsSignUp(false)} language={language} />
      ) : (
        <LoginForm onSuccess={handleAuthSuccess} onSwitchToSignUp={() => setIsSignUp(true)} language={language} />
      )}
    </div>
  )
}
