"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, CreditCard, QrCode } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { AuthUser } from "@/lib/auth"

interface PaymentMethodFormProps {
  user: AuthUser
  onSuccess: () => void
  onCancel: () => void
}

export function PaymentMethodForm({ user, onSuccess, onCancel }: PaymentMethodFormProps) {
  const qrInputRef = useRef<HTMLInputElement>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    payment_name: "",
    address: "",
    description: "",
    payment_icon_url: "",
    qr_code_url: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleQRUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const qrUrl = e.target?.result as string
      setFormData({ ...formData, qr_code_url: qrUrl })
    }
    reader.readAsDataURL(file)
  }

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const iconUrl = e.target?.result as string
      setFormData({ ...formData, payment_icon_url: iconUrl })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.payment_name || !formData.address) {
      setError("Please fill in payment name and address")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.from("payment_methods").insert([
        {
          user_id: user.id,
          ...formData,
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
    <div
      className={`min-h-screen ${isVIP ? "bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"} p-4 pb-20`}
    >
      <div className="max-w-2xl mx-auto">
        <Card
          className={`${isVIP ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600 backdrop-blur-sm" : "bg-white/90 backdrop-blur-sm border-gray-200"} shadow-2xl`}
        >
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isVIP ? "text-white" : "text-gray-800"}`}>
              <CreditCard className="w-5 h-5" />
              Add Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {/* Payment Name */}
              <div>
                <Label className={`${isVIP ? "text-purple-200" : "text-gray-700"} font-medium`}>Payment Name</Label>
                <Input
                  value={formData.payment_name}
                  onChange={(e) => setFormData({ ...formData, payment_name: e.target.value })}
                  className={`${isVIP ? "bg-purple-900/50 border-purple-600 text-white placeholder-purple-300" : "bg-white border-gray-200"} rounded-xl`}
                  placeholder="e.g., KBZ Pay, Wave Money, AYA Pay"
                />
              </div>

              {/* Address */}
              <div>
                <Label className={`${isVIP ? "text-purple-200" : "text-gray-700"} font-medium`}>
                  Payment Address/Account
                </Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`${isVIP ? "bg-purple-900/50 border-purple-600 text-white placeholder-purple-300" : "bg-white border-gray-200"} rounded-xl`}
                  placeholder="Phone number, account number, or wallet address"
                />
              </div>

              {/* Description */}
              <div>
                <Label className={`${isVIP ? "text-purple-200" : "text-gray-700"} font-medium`}>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`${isVIP ? "bg-purple-900/50 border-purple-600 text-white placeholder-purple-300" : "bg-white border-gray-200"} rounded-xl`}
                  placeholder="Additional payment instructions or notes"
                />
              </div>

              {/* Payment Icon */}
              <div>
                <Label className={`${isVIP ? "text-purple-200" : "text-gray-700"} font-medium`}>Payment Icon</Label>
                <div className="flex items-center gap-4">
                  {formData.payment_icon_url && (
                    <img
                      src={formData.payment_icon_url || "/placeholder.svg"}
                      alt="Payment Icon"
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

              {/* QR Code */}
              <div>
                <Label className={`${isVIP ? "text-purple-200" : "text-gray-700"} font-medium`}>QR Code</Label>
                <div className="space-y-4">
                  <Button
                    type="button"
                    onClick={() => qrInputRef.current?.click()}
                    variant="outline"
                    className={`w-full ${isVIP ? "border-purple-600 text-purple-200 hover:bg-purple-800/50" : "border-gray-300"}`}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    Upload QR Code
                  </Button>
                  <input ref={qrInputRef} type="file" accept="image/*" onChange={handleQRUpload} className="hidden" />

                  {formData.qr_code_url && (
                    <div className="flex justify-center">
                      <img
                        src={formData.qr_code_url || "/placeholder.svg"}
                        alt="QR Code"
                        className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                      />
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
                  className={`flex-1 ${isVIP ? "border-purple-600 text-purple-200 hover:bg-purple-800/50" : "border-gray-300"}`}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 ${isVIP ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"} text-white font-semibold py-3 rounded-xl transition-all duration-300`}
                >
                  {isLoading ? "Adding..." : "Add Payment Method"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
