"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, Crown, Trash2, ExternalLink } from "lucide-react"
import type { News, User as SupaUser } from "@/lib/supabase"

interface NewsCardProps {
  news: News & { author: SupaUser }
  currentUserId?: string
  onClick: () => void
  onDelete?: () => void
  onProductClick?: (targetNumber: string) => void
  isVIP?: boolean
}

export function NewsCard({ news, currentUserId, onClick, onDelete, onProductClick, isVIP = false }: NewsCardProps) {
  const [imageError, setImageError] = useState(false)

  const canDelete = currentUserId === news.author_id

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        isVIP
          ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600 backdrop-blur-sm"
          : "bg-white/90 backdrop-blur-sm border-gray-200"
      }`}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-purple-400">
              <AvatarImage src={news.author.profile_image_url || "/placeholder.svg"} alt={news.author.name} />
              <AvatarFallback className="bg-purple-600 text-white font-bold">
                {news.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`font-semibold ${isVIP ? "text-white" : "text-gray-800"}`}>{news.author.name}</h4>
                <Crown className="w-4 h-4 text-yellow-400" />
              </div>
              <p className={`text-sm ${isVIP ? "text-purple-300" : "text-gray-500"}`}>@{news.author.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className={`w-3 h-3 ${isVIP ? "text-purple-400" : "text-gray-400"}`} />
                <span className={`text-xs ${isVIP ? "text-purple-400" : "text-gray-400"}`}>
                  {new Date(news.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {canDelete && onDelete && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div onClick={onClick} className="space-y-4">
          <h3 className={`text-xl font-bold line-clamp-2 ${isVIP ? "text-white" : "text-gray-800"}`}>{news.title}</h3>

          <p className={`line-clamp-3 ${isVIP ? "text-purple-100" : "text-gray-600"}`}>{news.content}</p>

          {/* Media Preview */}
          {news.video_url ? (
            <video src={news.video_url} className="w-full h-48 object-cover rounded-lg" controls />
          ) : news.images && news.images.length > 0 && !imageError ? (
            <img
              src={news.images[0] || "/placeholder.svg"}
              alt={news.title}
              className="w-full h-48 object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          ) : null}

          {/* Product Links */}
          {news.product_links && news.product_links.length > 0 && (
            <div className="space-y-2">
              <h5 className={`font-medium text-sm ${isVIP ? "text-purple-200" : "text-gray-700"}`}>
                Featured Products:
              </h5>
              <div className="flex flex-wrap gap-2">
                {news.product_links.map((link, index) => (
                  <Badge
                    key={index}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-pointer hover:from-blue-600 hover:to-purple-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      onProductClick?.(link)
                    }}
                  >
                    {link}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {news.social_links && news.social_links.length > 0 && (
            <div className="space-y-2">
              <h5 className={`font-medium text-sm ${isVIP ? "text-purple-200" : "text-gray-700"}`}>Follow Us:</h5>
              <div className="flex flex-wrap gap-2">
                {news.social_links.map((link, index) => (
                  <Badge
                    key={index}
                    className="bg-gradient-to-r from-green-500 to-blue-600 text-white cursor-pointer hover:from-green-600 hover:to-blue-700 flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(link.url.startsWith("http") ? link.url : `https://${link.url}`, "_blank")
                    }}
                  >
                    <span>{link.icon}</span>
                    {link.platform}
                    <ExternalLink className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
