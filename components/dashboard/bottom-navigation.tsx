"use client"
import { Home, Package, Newspaper, History, User, Crown, Settings } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"
import type { AuthUser } from "@/lib/auth"

interface BottomNavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
  user: AuthUser
  language: Language
}

export function BottomNavigation({ currentPage, onPageChange, user, language }: BottomNavigationProps) {
  const { t } = useTranslation(language)

  const isVIP = user.role === "VIP"

  const navItems = [
    { id: "home", icon: Home, label: t("home") },
    { id: "products", icon: Package, label: t("products") },
    { id: "news", icon: Newspaper, label: t("news") },
    { id: "history", icon: History, label: t("history") },
    { id: "profile", icon: User, label: t("profile") },
  ]

  // Add VIP management for VIP users
  if (isVIP) {
    navItems.push({ id: "manage", icon: Settings, label: "Manage" })
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 ${isVIP ? "bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900" : "bg-white"} border-t ${isVIP ? "border-purple-700" : "border-gray-200"} backdrop-blur-lg`}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                isActive
                  ? isVIP
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                  : isVIP
                    ? "text-purple-200 hover:text-white hover:bg-purple-800/50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive && isVIP ? "animate-pulse" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
              {isVIP && item.id === "manage" && <Crown className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
