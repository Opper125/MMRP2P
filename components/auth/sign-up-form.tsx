"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Mail, Lock, UserPlus } from "lucide-react"
import { authService } from "@/lib/auth"
import { useTranslation, type Language } from "@/lib/i18n"

interface SignUpFormProps {
  onSuccess: (user: any) => void
  onSwitchToLogin: () => void
  language: Language
}

export function SignUpForm({ onSuccess, onSwitchToLogin, language }: SignUpFormProps) {
  const { t } = useTranslation(language)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      setError(t("fillAllFields"))
      return
    }

    setIsLoading(true)

    try {
      const user = await authService.signUp(formData)

      // Track user session
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${screen.width}x${screen.height}`,
      }

      await authService.trackUserSession(user, deviceInfo)
      onSuccess(user)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
          {t("signUp")}
        </CardTitle>
        <CardDescription className="text-gray-600">{t("welcome")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-medium">
              {t("name")}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                placeholder={t("name")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-700 font-medium">
              {t("username")}
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                placeholder={t("username")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              {t("email")}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                placeholder={t("email")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">
              {t("password")}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                placeholder={t("password")}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("loading")}
              </>
            ) : (
              t("createAccount")
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              {t("alreadyHaveAccount")} {t("signIn")}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
