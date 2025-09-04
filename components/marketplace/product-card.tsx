"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, DollarSign } from "lucide-react"
import type { Product, User } from "@/lib/supabase"

interface ProductCardProps {
  product: Product & { owner: User }
  onClick: () => void
  isVIP?: boolean
}

export function ProductCard({ product, onClick, isVIP = false }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        isVIP
          ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600 backdrop-blur-sm"
          : "bg-white/90 backdrop-blur-sm border-gray-200"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Product Image */}
        <div className="relative mb-4">
          {product.images && product.images.length > 0 && !imageError ? (
            <img
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          ) : product.icon_url && !imageError ? (
            <img
              src={product.icon_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className={`w-full h-48 ${isVIP ? "bg-purple-700" : "bg-gray-200"} rounded-lg flex items-center justify-center`}
            >
              <span className={`text-4xl ${isVIP ? "text-purple-300" : "text-gray-400"}`}>📦</span>
            </div>
          )}

          {/* Target Number Badge */}
          <Badge
            className={`absolute top-2 right-2 ${
              isVIP
                ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            }`}
          >
            {product.target_number}
          </Badge>
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <h3 className={`font-semibold text-lg line-clamp-2 ${isVIP ? "text-white" : "text-gray-800"}`}>
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <DollarSign className={`w-4 h-4 ${isVIP ? "text-purple-300" : "text-gray-500"}`} />
            <span className={`font-bold text-xl ${isVIP ? "text-white" : "text-gray-800"}`}>
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Owner Info */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-200/20">
            <Avatar className="w-8 h-8">
              <AvatarImage src={product.owner.profile_image_url || "/placeholder.svg"} alt={product.owner.name} />
              <AvatarFallback className={`text-xs ${isVIP ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                {product.owner.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className={`text-sm font-medium ${isVIP ? "text-white" : "text-gray-800"}`}>{product.owner.name}</p>
              <p className={`text-xs ${isVIP ? "text-purple-300" : "text-gray-500"}`}>@{product.owner.username}</p>
            </div>
          </div>

          {/* Contact Platform */}
          {product.contact_platform && (
            <div className="flex items-center gap-2">
              <MessageCircle className={`w-4 h-4 ${isVIP ? "text-purple-300" : "text-gray-500"}`} />
              <span className={`text-sm ${isVIP ? "text-purple-200" : "text-gray-600"}`}>
                {product.contact_platform}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
