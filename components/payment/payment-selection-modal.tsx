"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, CreditCard, QrCode } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { PaymentMethod } from "@/lib/supabase"

interface PaymentSelectionModalProps {
  sellerId: string
  productName: string
  productPrice: number
  isOpen: boolean
  onClose: () => void
  onSelectPayment: (paymentMethod: PaymentMethod) => void
  isVIP?: boolean
}

export function PaymentSelectionModal({
  sellerId,
  productName,
  productPrice,
  isOpen,
  onClose,
  onSelectPayment,
  isVIP = false,
}: PaymentSelectionModalProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen && sellerId) {
      fetchPaymentMethods()
    }
  }, [isOpen, sellerId])

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", sellerId)
        .eq("is_active", true)

      if (error) throw error
      setPaymentMethods(data || [])
    } catch (error) {
      console.error("Error fetching payment methods:", error)
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
            <CreditCard className="w-5 h-5" />
            Select Payment Method
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
          {/* Order Summary */}
          <div
            className={`p-4 rounded-lg ${isVIP ? "bg-purple-900/50 border border-purple-600" : "bg-gray-50 border border-gray-200"}`}
          >
            <h3 className={`font-semibold mb-2 ${isVIP ? "text-purple-200" : "text-gray-700"}`}>Order Summary</h3>
            <div className="flex justify-between items-center">
              <span className={`${isVIP ? "text-purple-100" : "text-gray-600"}`}>{productName}</span>
              <span className={`font-bold text-xl ${isVIP ? "text-white" : "text-gray-800"}`}>
                ${productPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          {isLoading ? (
            <div className="text-center py-8">
              <div
                className={`w-8 h-8 border-4 ${isVIP ? "border-purple-400 border-t-transparent" : "border-blue-500 border-t-transparent"} rounded-full animate-spin mx-auto mb-4`}
              ></div>
              <p className={`${isVIP ? "text-purple-200" : "text-gray-600"}`}>Loading payment methods...</p>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className={`w-16 h-16 mx-auto mb-4 ${isVIP ? "text-purple-400" : "text-gray-400"}`} />
              <p className={`text-lg ${isVIP ? "text-purple-200" : "text-gray-600"}`}>No payment methods available</p>
              <p className={`text-sm ${isVIP ? "text-purple-300" : "text-gray-500"}`}>
                The seller hasn't set up payment methods yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className={`font-semibold ${isVIP ? "text-purple-200" : "text-gray-700"}`}>Choose Payment Method:</h3>
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    isVIP
                      ? "bg-purple-900/50 border-purple-600 hover:bg-purple-800/70"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => onSelectPayment(method)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {method.payment_icon_url && (
                          <img
                            src={method.payment_icon_url || "/placeholder.svg"}
                            alt={method.payment_name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h4 className={`font-semibold ${isVIP ? "text-white" : "text-gray-800"}`}>
                            {method.payment_name}
                          </h4>
                          <p className={`text-sm ${isVIP ? "text-purple-300" : "text-gray-500"}`}>{method.address}</p>
                          {method.description && (
                            <p className={`text-xs ${isVIP ? "text-purple-400" : "text-gray-400"} mt-1`}>
                              {method.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.qr_code_url && (
                          <Badge
                            className={`${
                              isVIP
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                                : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                            }`}
                          >
                            <QrCode className="w-3 h-3 mr-1" />
                            QR
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
