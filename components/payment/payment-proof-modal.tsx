"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Upload, Receipt, QrCode } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { PaymentMethod, Product, User } from "@/lib/supabase"
import type { AuthUser } from "@/lib/auth"

interface PaymentProofModalProps {
  product: Product & { owner: User }
  paymentMethod: PaymentMethod
  buyer: AuthUser
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  isVIP?: boolean
}

export function PaymentProofModal({
  product,
  paymentMethod,
  buyer,
  isOpen,
  onClose,
  onSuccess,
  isVIP = false,
}: PaymentProofModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [paymentProof, setPaymentProof] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleProofUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const proofUrl = e.target?.result as string
      setPaymentProof(proofUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmitOrder = async () => {
    if (!paymentProof) {
      setError("Please upload payment proof")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.from("orders").insert([
        {
          product_id: product.id,
          buyer_id: buyer.id,
          seller_id: product.owner_id,
          payment_method_id: paymentMethod.id,
          payment_proof_url: paymentProof,
          total_amount: product.price,
          status: "pending",
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
          isVIP
            ? "bg-gradient-to-r from-purple-800/95 to-indigo-800/95 border-purple-600"
            : "bg-white/95 border-gray-200"
        } backdrop-blur-sm shadow-2xl`}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${isVIP ? "text-white" : "text-gray-800"}`}>
            <Receipt className="w-5 h-5" />
            Complete Payment
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
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Payment Details */}
          <div
            className={`p-4 rounded-lg ${isVIP ? "bg-purple-900/50 border border-purple-600" : "bg-gray-50 border border-gray-200"}`}
          >
            <h3 className={`font-semibold mb-4 ${isVIP ? "text-purple-200" : "text-gray-700"}`}>Payment Details</h3>

            <div className="space-y-4">
              {/* Payment Method Info */}
              <div className="flex items-center gap-4">
                {paymentMethod.payment_icon_url && (
                  <img
                    src={paymentMethod.payment_icon_url || "/placeholder.svg"}
                    alt={paymentMethod.payment_name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h4 className={`font-semibold ${isVIP ? "text-white" : "text-gray-800"}`}>
                    {paymentMethod.payment_name}
                  </h4>
                  <p className={`${isVIP ? "text-purple-300" : "text-gray-600"}`}>{paymentMethod.address}</p>
                  {paymentMethod.description && (
                    <p className={`text-sm ${isVIP ? "text-purple-400" : "text-gray-500"} mt-1`}>
                      {paymentMethod.description}
                    </p>
                  )}
                </div>
              </div>

              {/* QR Code */}
              {paymentMethod.qr_code_url && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <QrCode className={`w-4 h-4 ${isVIP ? "text-purple-300" : "text-gray-500"}`} />
                    <span className={`font-medium ${isVIP ? "text-purple-200" : "text-gray-700"}`}>
                      Scan QR Code to Pay
                    </span>
                  </div>
                  <img
                    src={paymentMethod.qr_code_url || "/placeholder.svg"}
                    alt="Payment QR Code"
                    className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200 mx-auto"
                  />
                </div>
              )}

              {/* Amount */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200/20">
                <span className={`font-medium ${isVIP ? "text-purple-200" : "text-gray-700"}`}>Total Amount:</span>
                <span className={`font-bold text-2xl ${isVIP ? "text-white" : "text-gray-800"}`}>
                  ${product.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Proof Upload */}
          <div>
            <h3 className={`font-semibold mb-4 ${isVIP ? "text-purple-200" : "text-gray-700"}`}>
              Upload Payment Proof
            </h3>
            <div className="space-y-4">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className={`w-full ${isVIP ? "border-purple-600 text-purple-200 hover:bg-purple-800/50" : "border-gray-300"}`}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Payment Screenshot
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProofUpload} className="hidden" />

              {paymentProof && (
                <div className="text-center">
                  <img
                    src={paymentProof || "/placeholder.svg"}
                    alt="Payment Proof"
                    className="w-full max-w-md h-64 object-cover rounded-lg border-2 border-gray-200 mx-auto"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitOrder}
            disabled={isLoading || !paymentProof}
            className={`w-full ${isVIP ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"} text-white font-semibold py-3 rounded-xl transition-all duration-300`}
          >
            {isLoading ? "Processing..." : "Confirm Order"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
