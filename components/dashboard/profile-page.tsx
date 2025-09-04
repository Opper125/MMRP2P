"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, User, Crown } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"
import { supabase } from "@/lib/supabase"
import type { AuthUser } from "@/lib/auth"

interface ProfilePageProps {
  user: AuthUser
  language: Language
  onUserUpdate: (user: AuthUser) => void
}

export function ProfilePage({ user, language, onUserUpdate }: ProfilePageProps) {
  const { t } = useTranslation(language)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    profile_image_url: user.profile_image_url || "",
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Create local URL for the image (stored in browser's local storage)
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setFormData({ ...formData, profile_image_url: imageUrl })

      // Store in localStorage for persistence
      localStorage.setItem(`profile_image_${user.id}`, imageUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Update user in database
      const { data, error } = await supabase
        .from("users")
        .update({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          profile_image_url: formData.profile_image_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single()

      if (error) throw error

      // Update local storage
      const updatedUser = { ...user, ...formData }
      localStorage.setItem("auth_user", JSON.stringify(updatedUser))

      onUserUpdate(updatedUser)
      setSuccess(t("success"))
      setIsEditing(false)
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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card
          className={`${isVIP ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600 backdrop-blur-sm" : "bg-white/90 backdrop-blur-sm border-gray-200"} shadow-2xl`}
        >
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="w-24 h-24 mx-auto border-4 border-white shadow-lg">
                <AvatarImage src={formData.profile_image_url || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback
                  className={`text-2xl font-bold ${isVIP ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"}`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`absolute bottom-0 right-0 p-2 rounded-full ${isVIP ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-500 hover:bg-blue-600"} text-white shadow-lg transition-colors`}
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              <CardTitle className={`text-2xl font-bold ${isVIP ? "text-white" : "text-gray-800"}`}>
                {user.name}
              </CardTitle>
              {isVIP && <Crown className="w-6 h-6 text-yellow-400" />}
            </div>

            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user.role === "VIP"
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                  : user.role === "admin"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              }`}
            >
              {user.role.toUpperCase()}
            </div>
          </CardHeader>
        </Card>

        {/* Profile Form */}
        <Card
          className={`${isVIP ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600 backdrop-blur-sm" : "bg-white/90 backdrop-blur-sm border-gray-200"} shadow-2xl`}
        >
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isVIP ? "text-white" : "text-gray-800"}`}>
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label className={`${isVIP ? "text-purple-200" : "text-gray-700"} font-medium`}>{t("name")}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className={`${isVIP ? "bg-purple-900/50 border-purple-600 text-white placeholder-purple-300" : "bg-white border-gray-200"} rounded-xl`}
                />
              </div>

              <div>
                <Label className={`${isVIP ? "text-purple-200" : "text-gray-700"} font-medium`}>{t("username")}</Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!isEditing}
                  className={`${isVIP ? "bg-purple-900/50 border-purple-600 text-white placeholder-purple-300" : "bg-white border-gray-200"} rounded-xl`}
                />
              </div>

              <div>
                <Label className={`${isVIP ? "text-purple-200" : "text-gray-700"} font-medium`}>{t("email")}</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className={`${isVIP ? "bg-purple-900/50 border-purple-600 text-white placeholder-purple-300" : "bg-white border-gray-200"} rounded-xl`}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className={`flex-1 ${isVIP ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"} text-white font-semibold py-3 rounded-xl transition-all duration-300`}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        profile_image_url: user.profile_image_url || "",
                      })
                    }}
                    variant="outline"
                    className={`flex-1 ${isVIP ? "border-purple-600 text-purple-200 hover:bg-purple-800/50" : "border-gray-300 text-gray-700 hover:bg-gray-50"} rounded-xl`}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className={`flex-1 ${isVIP ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"} text-white font-semibold py-3 rounded-xl transition-all duration-300`}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? t("loading") : "Save Changes"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
