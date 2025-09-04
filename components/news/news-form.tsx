"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { X, Newspaper, ImageIcon, Video, Plus, Crown } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { AuthUser } from "@/lib/auth"

interface NewsFormProps {
  user: AuthUser
  onSuccess: () => void
  onCancel: () => void
}

export function NewsForm({ user, onSuccess, onCancel }: NewsFormProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    images: [] as string[],
    video_url: "",
    product_links: [] as string[],
    social_links: [] as { platform: string; url: string; icon: string }[],
  })

  const [newProductLink, setNewProductLink] = useState("")
  const [newSocialLink, setNewSocialLink] = useState({ platform: "", url: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, imageUrl],
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const videoUrl = e.target?.result as string
      setFormData((prev) => ({ ...prev, video_url: videoUrl }))
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const removeVideo = () => {
    setFormData((prev) => ({ ...prev, video_url: "" }))
  }

  const addProductLink = () => {
    if (newProductLink.trim()) {
      setFormData((prev) => ({
        ...prev,
        product_links: [...prev.product_links, newProductLink.trim()],
      }))
      setNewProductLink("")
    }
  }

  const removeProductLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      product_links: prev.product_links.filter((_, i) => i !== index),
    }))
  }

  const getSocialIcon = (platform: string) => {
    const platformLower = platform.toLowerCase()
    if (platformLower.includes("telegram")) return "📱"
    if (platformLower.includes("facebook")) return "📘"
    if (platformLower.includes("instagram")) return "📷"
    if (platformLower.includes("twitter")) return "🐦"
    if (platformLower.includes("youtube")) return "📺"
    if (platformLower.includes("tiktok")) return "🎵"
    if (platformLower.includes("viber")) return "💜"
    if (platformLower.includes("whatsapp")) return "💚"
    return "🔗"
  }

  const addSocialLink = () => {
    if (newSocialLink.platform.trim() && newSocialLink.url.trim()) {
      setFormData((prev) => ({
        ...prev,
        social_links: [
          ...prev.social_links,
          {
            platform: newSocialLink.platform.trim(),
            url: newSocialLink.url.trim(),
            icon: getSocialIcon(newSocialLink.platform),
          },
        ],
      }))
      setNewSocialLink({ platform: "", url: "" })
    }
  }

  const removeSocialLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title || !formData.content) {
      setError("Please fill in title and content")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.from("news").insert([
        {
          author_id: user.id,
          title: formData.title,
          content: formData.content,
          images: formData.images,
          video_url: formData.video_url,
          product_links: formData.product_links,
          social_links: formData.social_links,
        },
      ])

      if (error) throw error
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const isVIP = user.role === "VIP"

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Crown className="w-5 h-5 text-yellow-400" />
              <Newspaper className="w-5 h-5" />
              Create News Article (VIP Only)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {/* Title */}
              <div>
                <Label className="text-purple-200 font-medium">News Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-purple-900/50 border-purple-600 text-white placeholder-purple-300 rounded-xl"
                  placeholder="Enter news title"
                />
              </div>

              {/* Content */}
              <div>
                <Label className="text-purple-200 font-medium">Content</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="bg-purple-900/50 border-purple-600 text-white placeholder-purple-300 rounded-xl min-h-[150px]"
                  placeholder="Write your news content here..."
                />
              </div>

              {/* Images */}
              <div>
                <Label className="text-purple-200 font-medium">Images</Label>
                <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    variant="outline"
                    className="w-full border-purple-600 text-purple-200 hover:bg-purple-800/50"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Upload Images (Multiple)
                  </Button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`News ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Video */}
              <div>
                <Label className="text-purple-200 font-medium">Video</Label>
                <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    variant="outline"
                    className="w-full border-purple-600 text-purple-200 hover:bg-purple-800/50"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Upload Video (Max 1)
                  </Button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />

                  {formData.video_url && (
                    <div className="relative">
                      <video src={formData.video_url} className="w-full h-48 object-cover rounded-lg" controls />
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Links */}
              <div>
                <Label className="text-purple-200 font-medium">Product Links (Target Numbers)</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newProductLink}
                      onChange={(e) => setNewProductLink(e.target.value)}
                      className="bg-purple-900/50 border-purple-600 text-white placeholder-purple-300 rounded-xl"
                      placeholder="Enter product target number (e.g., #00000001)"
                    />
                    <Button
                      type="button"
                      onClick={addProductLink}
                      variant="outline"
                      className="border-purple-600 text-purple-200 hover:bg-purple-800/50 bg-transparent"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {formData.product_links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.product_links.map((link, index) => (
                        <Badge
                          key={index}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center gap-1"
                        >
                          {link}
                          <button
                            type="button"
                            onClick={() => removeProductLink(index)}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <Label className="text-purple-200 font-medium">Social Media Links</Label>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={newSocialLink.platform}
                      onChange={(e) => setNewSocialLink({ ...newSocialLink, platform: e.target.value })}
                      className="bg-purple-900/50 border-purple-600 text-white placeholder-purple-300 rounded-xl"
                      placeholder="Platform name (e.g., Telegram)"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={newSocialLink.url}
                        onChange={(e) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
                        className="bg-purple-900/50 border-purple-600 text-white placeholder-purple-300 rounded-xl"
                        placeholder="URL or username"
                      />
                      <Button
                        type="button"
                        onClick={addSocialLink}
                        variant="outline"
                        className="border-purple-600 text-purple-200 hover:bg-purple-800/50 bg-transparent"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {formData.social_links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.social_links.map((link, index) => (
                        <Badge
                          key={index}
                          className="bg-gradient-to-r from-green-500 to-blue-600 text-white flex items-center gap-1"
                        >
                          <span>{link.icon}</span>
                          {link.platform}
                          <button
                            type="button"
                            onClick={() => removeSocialLink(index)}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="outline"
                  className="flex-1 border-purple-600 text-purple-200 hover:bg-purple-800/50 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300"
                >
                  {isLoading ? "Publishing..." : "Publish News"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
