"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Newspaper, Crown } from "lucide-react"
import { NewsForm } from "@/components/news/news-form"
import { NewsCard } from "@/components/news/news-card"
import { NewsDetailModal } from "@/components/news/news-detail-modal"
import { supabase } from "@/lib/supabase"
import { useTranslation, type Language } from "@/lib/i18n"
import type { AuthUser } from "@/lib/auth"
import type { News, User } from "@/lib/supabase"

interface NewsPageProps {
  user: AuthUser
  language: Language
  onProductClick?: (targetNumber: string) => void
}

export function NewsPage({ user, language, onProductClick }: NewsPageProps) {
  const { t } = useTranslation(language)
  const [showNewsForm, setShowNewsForm] = useState(false)
  const [news, setNews] = useState<(News & { author: User })[]>([])
  const [selectedNews, setSelectedNews] = useState<(News & { author: User }) | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isVIP = user.role === "VIP"
  const canCreateNews = user.role === "VIP"

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select(
          `
          *,
          author:users(*)
        `,
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setNews(data || [])
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewsSuccess = () => {
    setShowNewsForm(false)
    fetchNews()
  }

  const handleDeleteNews = async (newsId: string) => {
    if (!confirm("Are you sure you want to delete this news article?")) return

    try {
      const { error } = await supabase.from("news").update({ is_active: false }).eq("id", newsId)

      if (error) throw error
      setNews(news.filter((item) => item.id !== newsId))
    } catch (error) {
      console.error("Error deleting news:", error)
    }
  }

  if (showNewsForm) {
    return <NewsForm user={user} onSuccess={handleNewsSuccess} onCancel={() => setShowNewsForm(false)} />
  }

  return (
    <div
      className={`min-h-screen ${isVIP ? "bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"} p-4 pb-20`}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card
          className={`${isVIP ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600 backdrop-blur-sm" : "bg-white/90 backdrop-blur-sm border-gray-200"} shadow-2xl`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={`flex items-center gap-2 ${isVIP ? "text-white" : "text-gray-800"}`}>
                <Newspaper className="w-6 h-6" />
                {t("news")}
                {isVIP && <Crown className="w-5 h-5 text-yellow-400" />}
              </CardTitle>
              {canCreateNews && (
                <Button
                  onClick={() => setShowNewsForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create News
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* VIP Notice for non-VIP users */}
        {!canCreateNews && (
          <Card className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-yellow-400/50 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-yellow-700 font-medium">Only VIP users can create news articles</p>
            </CardContent>
          </Card>
        )}

        {/* News Grid */}
        {isLoading ? (
          <Card
            className={`${isVIP ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600" : "bg-white/90 border-gray-200"}`}
          >
            <CardContent className="p-8 text-center">
              <div
                className={`w-8 h-8 border-4 ${isVIP ? "border-purple-400 border-t-transparent" : "border-blue-500 border-t-transparent"} rounded-full animate-spin mx-auto mb-4`}
              ></div>
              <p className={`${isVIP ? "text-purple-200" : "text-gray-600"}`}>Loading news...</p>
            </CardContent>
          </Card>
        ) : news.length === 0 ? (
          <Card
            className={`${isVIP ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600" : "bg-white/90 border-gray-200"}`}
          >
            <CardContent className="p-8 text-center">
              <Newspaper className={`w-16 h-16 mx-auto mb-4 ${isVIP ? "text-purple-400" : "text-gray-400"}`} />
              <p className={`text-lg ${isVIP ? "text-purple-200" : "text-gray-600"}`}>No news articles yet</p>
              {canCreateNews && (
                <Button
                  onClick={() => setShowNewsForm(true)}
                  className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Article
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {news.map((article) => (
              <NewsCard
                key={article.id}
                news={article}
                currentUserId={user.id}
                onClick={() => setSelectedNews(article)}
                onDelete={canCreateNews ? () => handleDeleteNews(article.id) : undefined}
                onProductClick={onProductClick}
                isVIP={isVIP}
              />
            ))}
          </div>
        )}

        {/* News Detail Modal */}
        <NewsDetailModal
          news={selectedNews!}
          isOpen={!!selectedNews}
          onClose={() => setSelectedNews(null)}
          onProductClick={onProductClick}
          isVIP={isVIP}
        />
      </div>
    </div>
  )
}
