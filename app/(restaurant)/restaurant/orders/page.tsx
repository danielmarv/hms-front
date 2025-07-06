"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Clock,
  User,
  MapPin,
  Phone,
  Home,
  Utensils,
  DollarSign,
  CheckCircle,
  MoreHorizontal,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useRestaurantOrders } from "@/hooks/use-restaurant-orders"
import { toast } from "sonner"
import { format } from "date-fns"

const orderStatusColors = {
  New: "bg-blue-100 text-blue-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Ready: "bg-green-100 text-green-800",
  Served: "bg-purple-100 text-purple-800",
  Completed: "bg-gray-100 text-gray-800",
  Cancelled: "bg-red-100 text-red-800",
}

const paymentStatusColors = {
  Pending: "bg-orange-100 text-orange-800",
  Paid: "bg-green-100 text-green-800",
  "Partially Paid": "bg-yellow-100 text-yellow-800",
  Complimentary: "bg-blue-100 text-blue-800",
  "Charged to Room": "bg-purple-100 text-purple-800",
}

const priorityColors = {
  Normal: "bg-gray-100 text-gray-800",
  High: "bg-orange-100 text-orange-800",
  Rush: "bg-red-100 text-red-800",
}

export default function RestaurantOrdersPage() {
  const router = useRouter()
  const { getOrders, updateOrderStatus, updatePaymentStatus, loading } = useRestaurantOrders()

  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("today")

  // Dialog states
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [newPaymentStatus, setNewPaymentStatus] = useState("")
  const [cancellationReason, setCancellationReason] = useState("")

  useEffect(() => {
    loadOrders()
  }, [dateFilter])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter, typeFilter, paymentFilter, priorityFilter])

  const loadOrders = async () => {
    try {
      const today = new Date()
      let startDate, endDate

      switch (dateFilter) {
        case "today":
          startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString()
          endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString()
          break
        case "week":
          const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
          startDate = new Date(weekStart.setHours(0, 0, 0, 0)).toISOString()
          endDate = new Date().toISOString()
          break
        case "month":
          startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
          endDate = new Date().toISOString()
          break
        default:
          startDate = undefined
          endDate = undefined
      }

      const response = await getOrders({
        startDate,
        endDate,
        limit: 100,
        sort: "-orderedAt",
      })

      if (response?.data) {
        setOrders(response.data)
      }
    } catch (error) {
      console.error("Error loading orders:", error)
      toast.error("Failed to load orders")
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.guest?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.table?.number?.toString().includes(searchTerm) ||
          order.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filters
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((order) => order.orderType === typeFilter)
    }

    if (paymentFilter !== "all") {
      filtered = filtered.filter((order) => order.paymentStatus === paymentFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((order) => order.priority === priorityFilter)
    }

    setFilteredOrders(filtered)
  }

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return

    try {
      const additionalData = newStatus === "Cancelled" ? { cancellationReason } : {}
      const result = await updateOrderStatus(selectedOrder._id, newStatus, additionalData)

      if (result) {
        await loadOrders()
        setShowStatusDialog(false)
        setSelectedOrder(null)
        setNewStatus("")
        setCancellationReason("")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const handlePaymentUpdate = async () => {
    if (!selectedOrder || !newPaymentStatus) return

    try {
      const result = await updatePaymentStatus(selectedOrder._id, newPaymentStatus)

      if (result) {
        await loadOrders()
        setShowPaymentDialog(false)
        setSelectedOrder(null)
        setNewPaymentStatus("")
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
    }
  }

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case "Dine In":
        return <Utensils className="h-4 w-4" />
      case "Room Service":
        return <Home className="h-4 w-4" />
      case "Takeaway":
        return <User className="h-4 w-4" />
      case "Delivery":
        return <MapPin className="h-4 w-4" />
      default:
        return <Utensils className="h-4 w-4" />
    }
  }

  const getCustomerInfo = (order: any) => {
    if (order.guest) {
      return {
        name: order.guest.full_name,
        phone: order.guest.phone,
        isVip: order.guest.vip,
      }
    } else if (order.customerName) {
      return {
        name: order.customerName,
        phone: order.customerPhone,
        isVip: false,
      }
    }
    return null
  }

  const getLocationInfo = (order: any) => {
    if (order.table) {
      return `Table ${order.table.number} (${order.table.section})`
    } else if (order.room) {
      return `Room ${order.room.roomNumber}`
    } else if (order.deliveryAddress) {
      return order.deliveryAddress
    }
    return "N/A"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Orders</h1>
          <p className="text-muted-foreground">Manage all restaurant orders</p>
        </div>
        <Button onClick={() => router.push("/restaurant/orders/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Served">Served</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Order Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Dine In">Dine In</SelectItem>
                <SelectItem value="Room Service">Room Service</SelectItem>
                <SelectItem value="Takeaway">Takeaway</SelectItem>
                <SelectItem value="Delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                <SelectItem value="Complimentary">Complimentary</SelectItem>
                <SelectItem value="Charged to Room">Charged to Room</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Rush">Rush</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const customerInfo = getCustomerInfo(order)
            const locationInfo = getLocationInfo(order)

            return (
              <Card key={order._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Order Header */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getOrderTypeIcon(order.orderType)}
                          <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                        </div>
                        <Badge className={orderStatusColors[order.orderStatus as keyof typeof orderStatusColors]}>
                          {order.orderStatus}
                        </Badge>
                        <Badge className={paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]}>
                          {order.paymentStatus}
                        </Badge>
                        <Badge className={priorityColors[order.priority as keyof typeof priorityColors]}>
                          {order.priority}
                        </Badge>
                        {order.isCorporate && <Badge variant="outline">Corporate</Badge>}
                        {order.isGroupBooking && <Badge variant="outline">Group</Badge>}
                      </div>

                      {/* Customer & Location Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            {customerInfo ? (
                              <div className="flex items-center gap-2">
                                <span>{customerInfo.name}</span>
                                {customerInfo.isVip && (
                                  <Badge variant="secondary" className="text-xs">
                                    VIP
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Walk-in Customer</span>
                            )}
                            {customerInfo?.phone && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{customerInfo.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{locationInfo}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(order.orderedAt), "MMM dd, HH:mm")}</span>
                        </div>
                      </div>

                      {/* Waiter & Booking Info */}
                      {(order.waiter || order.booking) && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {order.waiter && <span>Waiter: {order.waiter.full_name}</span>}
                          {order.booking && <span>Booking: {order.booking.confirmation_number}</span>}
                        </div>
                      )}

                      {/* Order Items Preview */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Items ({order.items.length}):</div>
                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 3).map((item: any, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item.quantity}x {item.name}
                              {item.modifiers && item.modifiers.length > 0 && (
                                <span className="ml-1 text-muted-foreground">(+{item.modifiers.length})</span>
                              )}
                            </Badge>
                          ))}
                          {order.items.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{order.items.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                          </div>
                          {order.discountAmount > 0 && (
                            <span className="text-red-600">
                              -{order.discountPercentage}% (${order.discountAmount.toFixed(2)})
                            </span>
                          )}
                        </div>

                        {/* Special Notes */}
                        {order.notes && (
                          <div className="text-xs text-muted-foreground max-w-xs truncate">Note: {order.notes}</div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/restaurant/orders/${order._id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Order Actions</DialogTitle>
                            <DialogDescription>Manage order {order.orderNumber}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Button
                              className="w-full justify-start bg-transparent"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order)
                                setNewStatus(order.orderStatus)
                                setShowStatusDialog(true)
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Update Order Status
                            </Button>

                            <Button
                              className="w-full justify-start bg-transparent"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order)
                                setNewPaymentStatus(order.paymentStatus)
                                setShowPaymentDialog(true)
                              }}
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Update Payment Status
                            </Button>

                            <Button
                              className="w-full justify-start bg-transparent"
                              variant="outline"
                              onClick={() => router.push(`/restaurant/orders/${order._id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Order
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first order to get started"}
              </p>
              <Button onClick={() => router.push("/restaurant/orders/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>Change status for order {selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Ready">Ready</SelectItem>
                  <SelectItem value="Served">Served</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === "Cancelled" && (
              <div className="space-y-2">
                <Label>Cancellation Reason</Label>
                <Textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowStatusDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={loading} className="flex-1">
                {loading ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Status Update Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>Change payment status for order {selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Payment Status</Label>
              <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                  <SelectItem value="Complimentary">Complimentary</SelectItem>
                  <SelectItem value="Charged to Room">Charged to Room</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handlePaymentUpdate} disabled={loading} className="flex-1">
                {loading ? "Updating..." : "Update Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
