"use client"

import { useState, useEffect } from "react"
import { BottomNavigation } from "./bottom-navigation"
import { ProfilePage } from "./profile-page"
import { ProductsPage } from "./products-page"
import { NewsPage } from "./news-page"
import { VIPManagement } from "./vip-management"
import { LanguageSwitcher } from "@/components/language-switcher"
import type { Language } from "@/lib/i18n"
import type { AuthUser } from "@/lib/auth"

interface DashboardLayoutProps {
  user: AuthUser
  language: Language
  onLanguageChange: (lang: Language) => void
  onLogout: () => void
}

export function DashboardLayout({ user, language, onLanguageChange, onLogout }: DashboardLayoutProps) {
  const [currentPage, setCurrentPage] = useState("home")
  const [currentUser, setCurrentUser] = useState(user)

  const isVIP = currentUser.role === "VIP"

  // Update URL for VIP users
  useEffect(() => {
    if (isVIP && typeof window !== "undefined") {
      const currentUrl = window.location.href
      if (!currentUrl.includes("#vip")) {
        window.history.replaceState({}, "", `${window.location.origin}${window.location.pathname}#vip`)
      }
    }
  }, [isVIP])

  const handleUserUpdate = (updatedUser: AuthUser) => {
    setCurrentUser(updatedUser)
  }

  const handleProductClick = (targetNumber: string) => {
    // Switch to products page and search for the target number
    setCurrentPage("products")
    // You could implement a search functionality here
    console.log("Navigate to product:", targetNumber)
  }

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <div
            className={`min-h-screen ${isVIP ? "bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"} p-4 pb-20`}
          >
            <div className="max-w-4xl mx-auto text-center pt-8">
              <h1 className={`text-4xl font-bold mb-4 ${isVIP ? "text-white" : "text-gray-800"}`}>
                Welcome, {currentUser.name}!
              </h1>
              <p className={`text-lg mb-8 ${isVIP ? "text-purple-200" : "text-gray-600"}`}>Role: {currentUser.role}</p>
              {isVIP && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full inline-flex items-center gap-2 font-semibold">
                  <span>VIP Access Granted</span>
                </div>
              )}
            </div>
          </div>
        )

      case "products":
        return <ProductsPage user={currentUser} language={language} />

      case "news":
        return <NewsPage user={currentUser} language={language} onProductClick={handleProductClick} />

      case "history":
        return (
          <div
            className={`min-h-screen ${isVIP ? "bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"} p-4 pb-20`}
          >
            <div className="max-w-4xl mx-auto text-center pt-8">
              <h1 className={`text-3xl font-bold mb-4 ${isVIP ? "text-white" : "text-gray-800"}`}>History</h1>
              <p className={`${isVIP ? "text-purple-200" : "text-gray-600"}`}>Transaction history coming soon...</p>
            </div>
          </div>
        )

      case "profile":
        return <ProfilePage user={currentUser} language={language} onUserUpdate={handleUserUpdate} />

      case "manage":
        return isVIP ? <VIPManagement currentUser={currentUser} /> : null

      default:
        return null
    }
  }

  return (
    <div className="relative">
      <LanguageSwitcher onLanguageChange={onLanguageChange} currentLang={language} />

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className={`fixed top-4 left-4 z-50 px-4 py-2 rounded-lg font-medium transition-colors ${
          isVIP
            ? "bg-purple-800/90 hover:bg-purple-700 text-white border border-purple-600"
            : "bg-white/90 hover:bg-gray-50 text-gray-700 border border-gray-200"
        } backdrop-blur-sm`}
      >
        Logout
      </button>

      {renderPage()}

      <BottomNavigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        user={currentUser}
        language={language}
      />
    </div>
  )
}
