"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Calendar, Crown, ExternalLink } from "lucide-react"
import type { News, User } from "@/lib/supabase"

interface NewsDetailModalProps {
  news: News & { author: User }
  isOpen: boolean
  onClose: () => void
  onProductClick?: (targetNumber: string) => void
  isVIP?: boolean
}

export function NewsDetailModal({ news, isOpen, onClose, onProductClick, isVIP = false }: NewsDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!isOpen) return null

  const images = news.images || []
  const hasImages = images.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
          isVIP
            ? "bg-gradient-to-r from-purple-800/95 to-indigo-800/95 border-purple-600"
            : "bg-white/95 border-gray-200"
        } backdrop-blur-sm shadow-2xl`}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${isVIP ? "text-white" : "text-gray-800"}`}>
            <Crown className="w-5 h-5 text-yellow-400" />
            News Article
          </CardTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className={`${isVIP ? "text-purple-200 hover:bg-purple-700/50" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Author Info */}
          <div
            className={`p-4 rounded-lg ${isVIP ? "bg-purple-900/50 border border-purple-600" : "bg-gray-50 border border-gray-200"}`}
          >
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-purple-400">
                <AvatarImage src={news.author.profile_image_url || "/placeholder.svg"} alt={news.author.name} />
                <AvatarFallback className="bg-purple-600 text-white font-bold text-lg">
                  {news.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-lg ${isVIP ? "text-white" : "text-gray-800"}`}>{news.author.name}</h3>
                  <Crown className="w-5 h-5 text-yellow-400" />
                </div>
                <p className={`${isVIP ? "text-purple-300" : "text-gray-600"}`}>@{news.author.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className={`w-4 h-4 ${isVIP ? "text-purple-400" : "text-gray-400"}`} />
                  <span className={`text-sm ${isVIP ? "text-purple-400" : "text-gray-500"}`}>
                    {new Date(news.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className={`text-3xl font-bold ${isVIP ? "text-white" : "text-gray-800"}`}>{news.title}</h1>

          {/* Media */}
          {news.video_url ? (
            <video src={news.video_url} className="w-full h-64 object-cover rounded-lg" controls />
          ) : hasImages ? (
            <div className="space-y-4">
              <img
                src={images[currentImageIndex] || "/placeholder.svg"}
                alt={news.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index
                          ? isVIP
                            ? "border-purple-400"
                            : "border-blue-500"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${news.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* Content */}
          <div className={`prose max-w-none ${isVIP ? "prose-invert" : ""}`}>
            <p className={`text-lg leading-relaxed ${isVIP ? "text-purple-100" : "text-gray-700"}`}>{news.content}</p>
          </div>

          {/* Product Links */}
          {news.product_links && news.product_links.length > 0 && (
            <div
              className={`p-4 rounded-lg ${isVIP ? "bg-purple-900/50 border border-purple-600" : "bg-gray-50 border border-gray-200"}`}
            >
              <h3 className={`font-semibold mb-3 ${isVIP ? "text-purple-200" : "text-gray-700"}`}>Featured Products</h3>
              <div className="flex flex-wrap gap-3">
                {news.product_links.map((link, index) => (
                  <Badge
                    key={index}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-pointer hover:from-blue-600 hover:to-purple-700 px-4 py-2 text-sm"
                    onClick={() => onProductClick?.(link)}
                  >
                    {link}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {news.social_links && news.social_links.length > 0 && (
            <div
              className={`p-4 rounded-lg ${isVIP ? "bg-purple-900/50 border border-purple-600" : "bg-gray-50 border border-gray-200"}`}
            >
              <h3 className={`font-semibold mb-3 ${isVIP ? "text-purple-200" : "text-gray-700"}`}>Follow Us</h3>
              <div className="flex flex-wrap gap-3">
                {news.social_links.map((link, index) => (
                  <Badge
                    key={index}
                    className="bg-gradient-to-r from-green-500 to-blue-600 text-white cursor-pointer hover:from-green-600 hover:to-blue-700 flex items-center gap-2 px-4 py-2 text-sm"
                    onClick={() => {
                      window.open(link.url.startsWith("http") ? link.url : `https://${link.url}`, "_blank")
                    }}
                  >
                    <span className="text-lg">{link.icon}</span>
                    {link.platform}
                    <ExternalLink className="w-4 h-4" />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
