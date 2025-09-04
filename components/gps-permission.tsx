"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, AlertCircle } from "lucide-react"
import { useTranslation, type Language } from "@/lib/i18n"

interface GPSPermissionProps {
  onPermissionGranted: (location: GeolocationPosition) => void
  language: Language
}

export function GPSPermission({ onPermissionGranted, language }: GPSPermissionProps) {
  const { t } = useTranslation(language)
  const [isRequesting, setIsRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestGPSPermission = async () => {
    setIsRequesting(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("GPS not supported on this device")
      setIsRequesting(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsRequesting(false)
        onPermissionGranted(position)
      },
      (error) => {
        setIsRequesting(false)
        setError("GPS permission denied or unavailable")
        console.error("GPS Error:", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t("gpsRequired")}
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">{t("gpsMessage")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <Button
            onClick={requestGPSPermission}
            disabled={isRequesting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            {isRequesting ? t("loading") : t("enableGPS")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
