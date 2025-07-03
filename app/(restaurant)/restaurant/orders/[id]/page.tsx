"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useRestaurantOrders } from "@/hooks/use-restaurant-orders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Receipt,
  Printer,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  ChefHat,
} from "lucide-react"
import type { Order, OrderItem } from "@/types"

export default function RestaurantOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const { getOrder, updateOrderStatus, updatePaymentStatus, loading, error } = useRestaurantOrders()

  const [order, setOrder] = useState<Order | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showNotesDialog, setShowNotesDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [notes, setNotes] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("")

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const result = await getOrder(orderId)
      if (result) {
        setOrder(result)
      }
    } catch (error) {
      console.error("Error fetching order:", error)
    }
  }

  const handleStatusUpdate = async (newStatus: string, orderNotes?: string) => {
    if (!order) return

    setIsUpdating(true)
    try {
      const result = await updateOrderStatus(order._id, newStatus, orderNotes)
      if (result) {
        setOrder({ ...order, status: newStatus as any })
        setShowNotesDialog(false)
        setNotes("")
        setSelectedStatus("")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePaymentStatusUpdate = async (newPaymentStatus: string) => {
    if (!order) return

    setIsUpdating(true)
    try {
      const result = await updatePaymentStatus(order._id, newPaymentStatus)
      if (result) {
        setOrder({ ...order, paymentStatus: newPaymentStatus as any })
        setShowPaymentDialog(false)
        setSelectedPaymentStatus("")
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Ready":
        return "bg-green-100 text-green-800 border-green-200"
      case "Completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "Partially Paid":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Pending":
        return "bg-red-100 text-red-800 border-red-200"
      case "Complimentary":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Charged to Room":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4" />
      case "In Progress":
        return <ChefHat className="h-4 w-4" />
      case "Ready":
        return <CheckCircle className="h-4 w-4" />
      case "Completed":
        return <CheckCircle className="h-4 w-4" />
      case "Cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getNextStatusOptions = () => {
    if (!order) return []

    switch (order.status) {
      case "Pending":
        return [
          { value: "In Progress", label: "Start Preparing", variant: "default" as const },
          { value: "Cancelled", label: "Cancel Order", variant: "destructive" as const },
        ]
      case "In Progress":
        return [
          { value: "Ready", label: "Mark Ready", variant: "default" as const },
          { value: "Cancelled", label: "Cancel Order", variant: "destructive" as const },
        ]
      case "Ready":
        return [{ value: "Completed", label: "Complete Order", variant: "default" as const }]
      default:
        return []
    }
  }

  const getPaymentStatusOptions = () => {
    if (!order) return []

    const options = [
      { value: "Pending", label: "Pending" },
      { value: "Paid", label: "Paid" },
      { value: "Partially Paid", label: "Partially Paid" },
      { value: "Complimentary", label: "Complimentary" },
      { value: "Charged to Room", label: "Charged to Room" },
    ]

    return options.filter((option) => option.value !== order.paymentStatus)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getLocationDisplay = () => {
    if (!order) return "Unknown"

    if (order.table) {
      if (typeof order.table === "string" || typeof order.table === "number") {
        return `Table ${order.table}`
      }
      if (typeof order.table === "object" && order.table.number) {
        return `Table ${order.table.number}${order.table.section ? ` (${order.table.section})` : ""}`
      }
    }

    if (order.room) {
      if (typeof order.room === "string" || typeof order.room === "number") {
        return `Room ${order.room}`
      }
      if (typeof order.room === "object" && order.room.number) {
        return `Room ${order.room.number}`
      }
    }

    return order.orderType === "Delivery" ? "Delivery" : "Takeaway"
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || "Order not found. It may have been deleted or you don't have permission to view it."}
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/restaurant/orders")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    )
  }

  const statusOptions = getNextStatusOptions()
  const paymentOptions = getPaymentStatusOptions()

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/restaurant/orders")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(order.status)}>
            {getStatusIcon(order.status)}
            <span className="ml-2">{order.status}</span>
          </Badge>
          {order.priority && (
            <Badge variant={order.priority === "High" ? "destructive" : "secondary"}>{order.priority}</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Type</p>
                  <p className="font-medium">{order.orderType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {getLocationDisplay()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Time</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                {order.estimatedReadyTime && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estimated Ready</p>
                    <p className="font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {new Date(order.estimatedReadyTime).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>

              {(order.customerName || order.customerPhone || order.customerEmail) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {order.customerName && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Name</p>
                          <p>{order.customerName}</p>
                        </div>
                      )}
                      {order.customerPhone && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Phone</p>
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {order.customerPhone}
                          </p>
                        </div>
                      )}
                      {order.customerEmail && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Email</p>
                          <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {order.customerEmail}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {order.orderType === "Delivery" && (order.deliveryAddress || order.deliveryNotes) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Delivery Information
                    </h4>
                    {order.deliveryAddress && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                        <p>{order.deliveryAddress}</p>
                      </div>
                    )}
                    {order.deliveryNotes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Delivery Notes</p>
                        <p className="text-sm">{order.deliveryNotes}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      Special Instructions
                    </h4>
                    <div className="bg-yellow-50 p-3 rounded-md">
                      <p className="text-sm">{order.notes}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items ({order.items?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item: OrderItem, index: number) => (
                  <div key={index} className="flex justify-between items-start p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-lg">{item.quantity}x</span>
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                        </div>
                      </div>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="mt-2 ml-8">
                          <p className="text-sm font-medium text-muted-foreground">Modifications:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.modifiers.map((modifier: { name: string; price: number }, modIndex: number) => (
                              <Badge key={modIndex} variant="outline" className="text-xs">
                                + {modifier.name}
                                {modifier.price > 0 && ` (+${formatCurrency(modifier.price)})`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {item.notes && (
                        <div className="mt-2 ml-8">
                          <p className="text-sm text-muted-foreground italic">Note: {item.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency((item.price || item.unitPrice || 0) * item.quantity)}
                      </p>
                      {item.status && (
                        <Badge variant="outline" className="mt-1">
                          {item.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                )) || <p className="text-muted-foreground">No items in this order</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {order.status !== "Pending" && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Preparation Started</p>
                      <p className="text-sm text-muted-foreground">
                        {order.startedAt
                          ? new Date(order.startedAt).toLocaleString()
                          : order.updatedAt
                            ? new Date(order.updatedAt).toLocaleString()
                            : ""}
                      </p>
                    </div>
                  </div>
                )}

                {(order.status === "Ready" || order.status === "Completed") && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Order Ready</p>
                      <p className="text-sm text-muted-foreground">
                        {order.actualReadyTime
                          ? new Date(order.actualReadyTime).toLocaleString()
                          : order.updatedAt
                            ? new Date(order.updatedAt).toLocaleString()
                            : ""}
                      </p>
                    </div>
                  </div>
                )}

                {order.status === "Completed" && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Order Completed</p>
                      <p className="text-sm text-muted-foreground">
                        {order.completedAt
                          ? new Date(order.completedAt).toLocaleString()
                          : order.updatedAt
                            ? new Date(order.updatedAt).toLocaleString()
                            : ""}
                      </p>
                    </div>
                  </div>
                )}

                {order.status === "Cancelled" && order.cancelledAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Order Cancelled</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.cancelledAt).toLocaleString()}</p>
                      {order.cancellationReason && (
                        <p className="text-xs text-muted-foreground">Reason: {order.cancellationReason}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal || 0)}</span>
              </div>

              {order.taxAmount && order.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tax {order.taxRate ? `(${order.taxRate}%)` : ""}</span>
                  <span>{formatCurrency(order.taxAmount)}</span>
                </div>
              )}

              {order.tax && order.tax > 0 && !order.taxAmount && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
              )}

              {order.discountAmount && order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.discountPercentage ? `(${order.discountPercentage}%)` : ""}</span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}

              {order.discount && order.discount > 0 && !order.discountAmount && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}

              {order.deliveryFee && order.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}

              {order.serviceChargeAmount && order.serviceChargeAmount > 0 && (
                <div className="flex justify-between">
                  <span>
                    Service Charge {order.serviceChargePercentage ? `(${order.serviceChargePercentage}%)` : ""}
                  </span>
                  <span>{formatCurrency(order.serviceChargeAmount)}</span>
                </div>
              )}

              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(order.total || order.totalAmount || 0)}</span>
              </div>

              {order.paymentStatus && (
                <div className="mt-3">
                  <Badge
                    className={`w-full justify-center cursor-pointer ${getPaymentStatusColor(order.paymentStatus)}`}
                    onClick={() => setShowPaymentDialog(true)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {order.paymentStatus}
                  </Badge>
                </div>
              )}

              {order.paymentMethod && (
                <div className="text-center text-sm text-muted-foreground">Payment Method: {order.paymentMethod}</div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Status Update Buttons */}
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={option.variant}
                  className="w-full"
                  onClick={() => {
                    if (option.value === "Cancelled") {
                      setSelectedStatus(option.value)
                      setShowNotesDialog(true)
                    } else {
                      handleStatusUpdate(option.value)
                    }
                  }}
                  disabled={isUpdating}
                >
                  {option.label}
                </Button>
              ))}

              <Separator />

              {/* Other Actions */}
              <Button variant="outline" className="w-full bg-transparent">
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>

              <Button variant="outline" className="w-full bg-transparent">
                <Receipt className="h-4 w-4 mr-2" />
                Send Receipt
              </Button>

              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => router.push(`/restaurant/orders/${order._id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Order
              </Button>
            </CardContent>
          </Card>

          {/* Staff Assignment */}
          {order.waiter && (
            <Card>
              <CardHeader>
                <CardTitle>Staff Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 bg-muted rounded-full p-2" />
                  <div>
                    <p className="font-medium">
                      {typeof order.waiter === "object" ? order.waiter.full_name : "Assigned Waiter"}
                    </p>
                    <p className="text-sm text-muted-foreground">Waiter</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Status Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Current status: <span className="font-medium">{order.paymentStatus}</span>
              </p>
              <div className="space-y-2">
                {paymentOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => {
                      setSelectedPaymentStatus(option.value)
                      handlePaymentStatusUpdate(option.value)
                    }}
                    disabled={isUpdating}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog for Cancellation */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cancellation Reason</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Please provide a reason for cancellation..."
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate(selectedStatus, notes)}
                disabled={isUpdating || !notes.trim()}
              >
                {isUpdating ? "Cancelling..." : "Cancel Order"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
