"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, CreditCard } from "lucide-react"
import { ProductUploadForm } from "@/components/marketplace/product-upload-form"
import { ProductCard } from "@/components/marketplace/product-card"
import { ProductDetailModal } from "@/components/marketplace/product-detail-modal"
import { ProductSearch } from "@/components/marketplace/product-search"
import { PaymentMethodForm } from "@/components/payment/payment-method-form"
import { OrderManagement } from "@/components/orders/order-management"
import { useTranslation, type Language } from "@/lib/i18n"
import type { AuthUser } from "@/lib/auth"
import type { Product, User } from "@/lib/supabase"

interface ProductsPageProps {
  user: AuthUser
  language: Language
}

export function ProductsPage({ user, language }: ProductsPageProps) {
  const { t } = useTranslation(language)
  const [currentView, setCurrentView] = useState<"products" | "upload" | "payments" | "orders">("products")
  const [products, setProducts] = useState<(Product & { owner: User })[]>([])
  const [selectedProduct, setSelectedProduct] = useState<(Product & { owner: User }) | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isVIP = user.role === "VIP"
  const canCreateProducts = user.role === "admin" || user.role === "VIP"

  const handleProductsUpdate = (newProducts: (Product & { owner: User })[]) => {
    setProducts(newProducts)
    setIsLoading(false)
  }

  const handleUploadSuccess = () => {
    setCurrentView("products")
    // Refresh products list
    window.location.reload()
  }

  const handlePaymentSuccess = () => {
    setCurrentView("products")
  }

  if (currentView === "upload") {
    return (
      <ProductUploadForm
        user={user}
        language={language}
        onSuccess={handleUploadSuccess}
        onCancel={() => setCurrentView("products")}
      />
    )
  }

  if (currentView === "payments") {
    return (
      <PaymentMethodForm user={user} onSuccess={handlePaymentSuccess} onCancel={() => setCurrentView("products")} />
    )
  }

  if (currentView === "orders") {
    return <OrderManagement user={user} isVIP={isVIP} />
  }

  return (
    <div
      className={`min-h-screen ${isVIP ? "bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"} p-4 pb-20`}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card
          className={`${isVIP ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600 backdrop-blur-sm" : "bg-white/90 backdrop-blur-sm border-gray-200"} shadow-2xl`}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={`flex items-center gap-2 ${isVIP ? "text-white" : "text-gray-800"}`}>
                <Package className="w-6 h-6" />
                {t("products")}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentView("orders")}
                  variant="outline"
                  className={`${isVIP ? "border-purple-600 text-purple-200 hover:bg-purple-800/50" : "border-gray-300"}`}
                >
                  Orders
                </Button>
                {canCreateProducts && (
                  <>
                    <Button
                      onClick={() => setCurrentView("payments")}
                      variant="outline"
                      className={`${isVIP ? "border-purple-600 text-purple-200 hover:bg-purple-800/50" : "border-gray-300"}`}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment Methods
                    </Button>
                    <Button
                      onClick={() => setCurrentView("upload")}
                      className={`${isVIP ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"} text-white font-semibold rounded-xl transition-all duration-300`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Search */}
        <Card
          className={`${isVIP ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600 backdrop-blur-sm" : "bg-white/90 backdrop-blur-sm border-gray-200"}`}
        >
          <CardContent className="p-4">
            <ProductSearch onResults={handleProductsUpdate} isVIP={isVIP} />
          </CardContent>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
          <Card
            className={`${isVIP ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600" : "bg-white/90 border-gray-200"}`}
          >
            <CardContent className="p-8 text-center">
              <div
                className={`w-8 h-8 border-4 ${isVIP ? "border-purple-400 border-t-transparent" : "border-blue-500 border-t-transparent"} rounded-full animate-spin mx-auto mb-4`}
              ></div>
              <p className={`${isVIP ? "text-purple-200" : "text-gray-600"}`}>Loading products...</p>
            </CardContent>
          </Card>
        ) : products.length === 0 ? (
          <Card
            className={`${isVIP ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600" : "bg-white/90 border-gray-200"}`}
          >
            <CardContent className="p-8 text-center">
              <Package className={`w-16 h-16 mx-auto mb-4 ${isVIP ? "text-purple-400" : "text-gray-400"}`} />
              <p className={`text-lg ${isVIP ? "text-purple-200" : "text-gray-600"}`}>No products found</p>
              {canCreateProducts && (
                <Button
                  onClick={() => setCurrentView("upload")}
                  className={`mt-4 ${isVIP ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"} text-white font-semibold rounded-xl`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Product
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => setSelectedProduct(product)}
                isVIP={isVIP}
              />
            ))}
          </div>
        )}

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct!}
          currentUser={user}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isVIP={isVIP}
        />
      </div>
    </div>
  )
}
