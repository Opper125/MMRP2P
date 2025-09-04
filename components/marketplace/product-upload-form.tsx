"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Package, DollarSign, ImageIcon, Video } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useTranslation, type Language } from "@/lib/i18n"
import type { AuthUser } from "@/lib/auth"

interface ProductUploadFormProps {
  user: AuthUser
  language: Language
  onSuccess: () => void
  onCancel: () => void
}

export function ProductUploadForm({ user, language, onSuccess, onCancel }: ProductUploadFormProps) {
  const { t } = useTranslation(language)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    contact_platform: "",
    contact_info: "",
    icon_url: "",
    images: [] as string[],
    video_url: "",
  })

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

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const iconUrl = e.target?.result as string
      setFormData((prev) => ({ ...prev, icon_url: iconUrl }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name || !formData.description || !formData.price) {
      setError(t("fillAllFields"))
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            owner_id: user.id,
            name: formData.name,
            description: formData.description,
            price: Number.parseFloat(formData.price),
            contact_platform: formData.contact_platform,
            contact_info: formData.contact_info,
            icon_url: formData.icon_url,
            images: formData.images,
            video_url: formData.video_url,
          },
        ])
        .select()
        .single()

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
    <div
      className={`min-h-screen ${isVIP ? "bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"} p-4 pb-20`}
    >
      <div className="max-w-2xl mx-auto">
        <Card
          className={`${isVIP ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600 backdrop-blur-sm" : "bg-white/90 backdrop-blur-sm border-gray-200"} shadow-2xl`}
        >
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isVIP ? "text-white" : "text-gray-800"}`}>
              <Package className="w-5 h-5" />
              Add New Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {/* Product Name */}
              <div>
                <Label className={`${isVIP ? "text-purple-200" : "text-gray-700"} font-medium`}>Product Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`${isVIP ? "bg-purple-900/50 border-purple-600 text-white placeholder-purple-300" : "bg-white border-gray-200"} rounded-xl`}
                  placeholder="Enter product name"
                />
              </div>

              {/* Description */}
              <div>
                <Label className={`${isVIP ? "text-purple-200" : "text-gray-700"} font-medium`}>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`${isVIP ? "bg-purple-900/50 border-purple-600 text-white placeholder-purple-300" : "bg-white border-gray-200"} rounded-xl min-h-[100px]`}
                  placeholder="Describe your product"
                />
              </div>

              {/* Price */}
              <div>
                <Label className={`${isVIP ? "text-purple-200" : "text-gray-700"} font-medium`}>Price</Label>
                <div className="relative">
                  <DollarSign
                    className={`absolute left-3 top-3 w-4 h-4 ${isVIP ? "text-purple-300" : "text-gray-400"}`}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className={`pl-10 ${isVIP ? "bg-purple-900/50 border-purple-600 text-white placeholder-purple-300" : "bg-white border-gray-200"} rounded-xl`}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Product Icon */}
              <div>
                <Label className={`${isVIP ? "text-purple-200" : "text-gray-700"} font-medium`}>Product Icon</Label>
                <div className="flex items-center gap-4">
                  {formData.icon_url && (
                    <img
                      src={formData.icon_url || "/placeholder.svg"}
                      alt="Icon"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <Button
                    type="button"
                    onClick={() => iconInputRef.current?.click()}
                    variant="outline"
                    className={`${isVIP ? "border-purple-600 text-purple-200 hover:bg-purple-800/50" : "border-gray-300"}`}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Icon
                  </Button>
                  <input
                    ref={iconInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Product Images */}
              <div>
                <Label className={`${isVIP ? "text-purple-200" : "text-gray-700"} font-medium`}>Product Images</Label>
                <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    variant="outline"
                    className={`w-full ${isVIP ? "border-purple-600 text-purple-200 hover:bg-purple-800/50" : "border-gray-300"}`}
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
                            alt={`Product ${index + 1}`}
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

              {/* Product Video */}
              <div>
                <Label className={`${isVIP ? "text-purple-200" : "text-gray-700"} font-medium`}>Product Video</Label>
                <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    variant="outline"
                    className={`w-full ${isVIP ? "border-purple-600 text-purple-200 hover:bg-purple-800/50" : "border-gray-300"}`}
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

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className={`${isVIP ? "text-purple-200" : "text-gray-700"} font-medium`}>
                    Contact Platform
                  </Label>
                  <Input
                    value={formData.contact_platform}
                    onChange={(e) => setFormData({ ...formData, contact_platform: e.target.value })}
                    className={`${isVIP ? "bg-purple-900/50 border-purple-600 text-white placeholder-purple-300" : "bg-white border-gray-200"} rounded-xl`}
                    placeholder="e.g., Telegram, Viber"
                  />
                </div>
                <div>
                  <Label className={`${isVIP ? "text-purple-200" : "text-gray-700"} font-medium`}>Contact Info</Label>
                  <Input
                    value={formData.contact_info}
                    onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                    className={`${isVIP ? "bg-purple-900/50 border-purple-600 text-white placeholder-purple-300" : "bg-white border-gray-200"} rounded-xl`}
                    placeholder="@username or phone"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="outline"
                  className={`flex-1 ${isVIP ? "border-purple-600 text-purple-200 hover:bg-purple-800/50" : "border-gray-300"}`}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 ${isVIP ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"} text-white font-semibold py-3 rounded-xl transition-all duration-300`}
                >
                  {isLoading ? "Creating..." : "Create Product"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
