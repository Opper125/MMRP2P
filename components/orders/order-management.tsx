"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Clock, Package, Receipt } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Order, Product, User } from "@/lib/supabase"
import type { AuthUser } from "@/lib/auth"

interface OrderManagementProps {
  user: AuthUser
  isVIP?: boolean
}

type OrderWithDetails = Order & {
  product: Product
  buyer: User
  seller: User
}

export function OrderManagement({ user, isVIP = false }: OrderManagementProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received")

  useEffect(() => {
    fetchOrders()
  }, [user.id, activeTab])

  const fetchOrders = async () => {
    try {
      const query = supabase
        .from("orders")
        .select(
          `
          *,
          product:products(*),
          buyer:users!orders_buyer_id_fkey(*),
          seller:users!orders_seller_id_fkey(*)
        `,
        )
        .order("created_at", { ascending: false })

      if (activeTab === "received") {
        query.eq("seller_id", user.id)
      } else {
        query.eq("buyer_id", user.id)
      }

      const { data, error } = await query

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId)

      if (error) throw error

      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status } : order)))
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-500 text-white">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const generateOrderReceipt = (order: OrderWithDetails) => {
    // Create a simple receipt HTML
    const receiptHTML = `
      <div style="max-width: 400px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; border: 2px solid #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #333;">ORDER RECEIPT</h2>
          <p style="margin: 5px 0; color: #666;">Order #${order.order_number}</p>
        </div>
        
        <div style="border-bottom: 1px solid #ddd; padding-bottom: 15px; margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Product Details</h3>
          <p><strong>Product:</strong> ${order.product.name}</p>
          <p><strong>Target #:</strong> ${order.product.target_number}</p>
          <p><strong>Price:</strong> $${order.total_amount.toFixed(2)}</p>
        </div>
        
        <div style="border-bottom: 1px solid #ddd; padding-bottom: 15px; margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Buyer Information</h3>
          <p><strong>Name:</strong> ${order.buyer.name}</p>
          <p><strong>Username:</strong> @${order.buyer.username}</p>
        </div>
        
        <div style="border-bottom: 1px solid #ddd; padding-bottom: 15px; margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Seller Information</h3>
          <p><strong>Name:</strong> ${order.seller.name}</p>
          <p><strong>Username:</strong> @${order.seller.username}</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="margin: 0; color: #666; font-size: 12px;">Order Date: ${new Date(order.created_at).toLocaleDateString()}</p>
          <p style="margin: 0; color: #666; font-size: 12px;">Status: ${order.status.toUpperCase()}</p>
        </div>
      </div>
    `

    // Create a new window and print
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(receiptHTML)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div
      className={`min-h-screen ${isVIP ? "bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"} p-4 pb-20`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card
          className={`${isVIP ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600 backdrop-blur-sm" : "bg-white/90 backdrop-blur-sm border-gray-200"} shadow-2xl`}
        >
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isVIP ? "text-white" : "text-gray-800"}`}>
              <Package className="w-6 h-6" />
              Order Management
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab("received")}
            variant={activeTab === "received" ? "default" : "outline"}
            className={
              activeTab === "received"
                ? isVIP
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                : isVIP
                  ? "border-purple-600 text-purple-200 hover:bg-purple-800/50"
                  : "border-gray-300"
            }
          >
            Orders Received
          </Button>
          <Button
            onClick={() => setActiveTab("sent")}
            variant={activeTab === "sent" ? "default" : "outline"}
            className={
              activeTab === "sent"
                ? isVIP
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                : isVIP
                  ? "border-purple-600 text-purple-200 hover:bg-purple-800/50"
                  : "border-gray-300"
            }
          >
            Orders Sent
          </Button>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <Card
            className={`${isVIP ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600" : "bg-white/90 border-gray-200"}`}
          >
            <CardContent className="p-8 text-center">
              <div
                className={`w-8 h-8 border-4 ${isVIP ? "border-purple-400 border-t-transparent" : "border-blue-500 border-t-transparent"} rounded-full animate-spin mx-auto mb-4`}
              ></div>
              <p className={`${isVIP ? "text-purple-200" : "text-gray-600"}`}>Loading orders...</p>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card
            className={`${isVIP ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600" : "bg-white/90 border-gray-200"}`}
          >
            <CardContent className="p-8 text-center">
              <Package className={`w-16 h-16 mx-auto mb-4 ${isVIP ? "text-purple-400" : "text-gray-400"}`} />
              <p className={`text-lg ${isVIP ? "text-purple-200" : "text-gray-600"}`}>
                No {activeTab === "received" ? "orders received" : "orders sent"} yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card
                key={order.id}
                className={`${isVIP ? "bg-gradient-to-r from-purple-800/90 to-indigo-800/90 border-purple-600 backdrop-blur-sm" : "bg-white/90 backdrop-blur-sm border-gray-200"}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={
                            (activeTab === "received"
                              ? order.buyer.profile_image_url
                              : order.seller.profile_image_url) || "/placeholder.svg"
                          }
                          alt={activeTab === "received" ? order.buyer.name : order.seller.name}
                        />
                        <AvatarFallback
                          className={`${isVIP ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"}`}
                        >
                          {(activeTab === "received" ? order.buyer.name : order.seller.name).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className={`font-semibold ${isVIP ? "text-white" : "text-gray-800"}`}>
                          {activeTab === "received" ? order.buyer.name : order.seller.name}
                        </h3>
                        <p className={`text-sm ${isVIP ? "text-purple-300" : "text-gray-500"}`}>
                          @{activeTab === "received" ? order.buyer.username : order.seller.username}
                        </p>
                        <p className={`text-xs ${isVIP ? "text-purple-400" : "text-gray-400"}`}>
                          Order #{order.order_number}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className={`font-medium mb-2 ${isVIP ? "text-purple-200" : "text-gray-700"}`}>Product</h4>
                      <p className={`${isVIP ? "text-white" : "text-gray-800"}`}>{order.product.name}</p>
                      <p className={`text-sm ${isVIP ? "text-purple-300" : "text-gray-500"}`}>
                        {order.product.target_number}
                      </p>
                    </div>
                    <div>
                      <h4 className={`font-medium mb-2 ${isVIP ? "text-purple-200" : "text-gray-700"}`}>Amount</h4>
                      <p className={`font-bold text-xl ${isVIP ? "text-white" : "text-gray-800"}`}>
                        ${order.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {order.payment_proof_url && (
                    <div className="mb-4">
                      <h4 className={`font-medium mb-2 ${isVIP ? "text-purple-200" : "text-gray-700"}`}>
                        Payment Proof
                      </h4>
                      <img
                        src={order.payment_proof_url || "/placeholder.svg"}
                        alt="Payment Proof"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    {activeTab === "received" && order.status === "pending" && (
                      <>
                        <Button
                          onClick={() => updateOrderStatus(order.id, "approved")}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => updateOrderStatus(order.id, "rejected")}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    {order.status === "approved" && (
                      <Button
                        onClick={() => generateOrderReceipt(order)}
                        className={`${isVIP ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"} text-white`}
                      >
                        <Receipt className="w-4 h-4 mr-2" />
                        Print Receipt
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
