"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, DollarSign, MessageCircle, Package, ShoppingCart } from "lucide-react"
import { PaymentSelectionModal } from "@/components/payment/payment-selection-modal"
import { PaymentProofModal } from "@/components/payment/payment-proof-modal"
import type { Product, User, PaymentMethod } from "@/lib/supabase"
import type { AuthUser } from "@/lib/auth"

interface ProductDetailModalProps {
  product: Product & { owner: User }
  currentUser: AuthUser
  isOpen: boolean
  onClose: () => void
  isVIP?: boolean
}

export function ProductDetailModal({ product, currentUser, isOpen, onClose, isVIP = false }: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showPaymentSelection, setShowPaymentSelection] = useState(false)
  const [showPaymentProof, setShowPaymentProof] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)

  if (!isOpen) return null

  const images = product.images || []
  const hasImages = images.length > 0

  const handleBuyClick = () => {
    setShowPaymentSelection(true)
  }

  const handlePaymentMethodSelect = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod)
    setShowPaymentSelection(false)
    setShowPaymentProof(true)
  }

  const handleOrderSuccess = () => {
    setShowPaymentProof(false)
    setSelectedPaymentMethod(null)
    onClose()
    alert("Order placed successfully! The seller will review your payment.")
  }

  return (
    <>
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
              <Package className="w-5 h-5" />
              Product Details
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
            <div className="grid md:grid-cols-2 gap-6">
              {/* Media Section */}
              <div className="space-y-4">
                {/* Main Image/Video */}
                <div className="relative">
                  {product.video_url ? (
                    <video src={product.video_url} className="w-full h-64 object-cover rounded-lg" controls />
                  ) : hasImages ? (
                    <img
                      src={images[currentImageIndex] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div
                      className={`w-full h-64 ${isVIP ? "bg-purple-700" : "bg-gray-200"} rounded-lg flex items-center justify-center`}
                    >
                      <span className={`text-6xl ${isVIP ? "text-purple-300" : "text-gray-400"}`}>📦</span>
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

                {/* Image Thumbnails */}
                {hasImages && images.length > 1 && (
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
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <h2 className={`text-2xl font-bold mb-2 ${isVIP ? "text-white" : "text-gray-800"}`}>
                    {product.name}
                  </h2>
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className={`w-5 h-5 ${isVIP ? "text-purple-300" : "text-gray-500"}`} />
                    <span className={`font-bold text-3xl ${isVIP ? "text-white" : "text-gray-800"}`}>
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className={`font-semibold mb-2 ${isVIP ? "text-purple-200" : "text-gray-700"}`}>Description</h3>
                  <p className={`${isVIP ? "text-purple-100" : "text-gray-600"} leading-relaxed`}>
                    {product.description}
                  </p>
                </div>

                {/* Owner Info */}
                <div
                  className={`p-4 rounded-lg ${isVIP ? "bg-purple-900/50 border border-purple-600" : "bg-gray-50 border border-gray-200"}`}
                >
                  <h3 className={`font-semibold mb-3 ${isVIP ? "text-purple-200" : "text-gray-700"}`}>Seller</h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={product.owner.profile_image_url || "/placeholder.svg"}
                        alt={product.owner.name}
                      />
                      <AvatarFallback className={`${isVIP ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                        {product.owner.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className={`font-medium ${isVIP ? "text-white" : "text-gray-800"}`}>{product.owner.name}</p>
                      <p className={`text-sm ${isVIP ? "text-purple-300" : "text-gray-500"}`}>
                        @{product.owner.username}
                      </p>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          product.owner.role === "VIP"
                            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                            : product.owner.role === "admin"
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                              : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        }`}
                      >
                        {product.owner.role.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                {product.contact_platform && product.contact_info && (
                  <div
                    className={`p-4 rounded-lg ${isVIP ? "bg-purple-900/50 border border-purple-600" : "bg-gray-50 border border-gray-200"}`}
                  >
                    <h3 className={`font-semibold mb-2 ${isVIP ? "text-purple-200" : "text-gray-700"}`}>Contact</h3>
                    <div className="flex items-center gap-2">
                      <MessageCircle className={`w-4 h-4 ${isVIP ? "text-purple-300" : "text-gray-500"}`} />
                      <span className={`${isVIP ? "text-purple-100" : "text-gray-600"}`}>
                        {product.contact_platform}: {product.contact_info}
                      </span>
                    </div>
                  </div>
                )}

                {/* Buy Button */}
                {currentUser.id !== product.owner_id && (
                  <Button
                    onClick={handleBuyClick}
                    className={`w-full ${isVIP ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"} text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105`}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy Now
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Selection Modal */}
      <PaymentSelectionModal
        sellerId={product.owner_id}
        productName={product.name}
        productPrice={product.price}
        isOpen={showPaymentSelection}
        onClose={() => setShowPaymentSelection(false)}
        onSelectPayment={handlePaymentMethodSelect}
        isVIP={isVIP}
      />

      {/* Payment Proof Modal */}
      {selectedPaymentMethod && (
        <PaymentProofModal
          product={product}
          paymentMethod={selectedPaymentMethod}
          buyer={currentUser}
          isOpen={showPaymentProof}
          onClose={() => {
            setShowPaymentProof(false)
            setSelectedPaymentMethod(null)
          }}
          onSuccess={handleOrderSuccess}
          isVIP={isVIP}
        />
      )}
    </>
  )
}
