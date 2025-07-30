"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  RefreshCw,
  TrendingUp,
  Calendar,
  Users,
  ChefHat,
  AlertTriangle,
  Star,
  Download,
  PrinterIcon as Print,
  Send,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useRestaurantOrders } from "@/hooks/use-restaurant-orders"
import { useCurrency } from "@/hooks/use-currency"
import { toast } from "sonner"
import { format } from "date-fns"

const orderStatusColors = {
  New: "bg-blue-500 text-white",
  "In Progress": "bg-yellow-500 text-white",
  Ready: "bg-green-500 text-white",
  Served: "bg-purple-500 text-white",
  Completed: "bg-gray-500 text-white",
  Cancelled: "bg-red-500 text-white",
}

const paymentStatusColors = {
  Pending: "bg-orange-500 text-white",
  Paid: "bg-green-500 text-white",
  "Partially Paid": "bg-yellow-500 text-white",
  Complimentary: "bg-blue-500 text-white",
  "Charged to Room": "bg-purple-500 text-white",
}

const priorityColors = {
  Normal: "bg-gray-500 text-white",
  High: "bg-orange-500 text-white",
  Rush: "bg-red-500 text-white",
}

export default function RestaurantOrdersPage() {
  const router = useRouter()
  const { getOrders, updateOrderStatus, updatePaymentStatus, getOrderStats, loading } = useRestaurantOrders()
  const { getDisplayAmounts } = useCurrency()

  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("today")
  const [refreshing, setRefreshing] = useState(false)

  // Statistics
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    newOrders: 0,
    inProgressOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    pendingPayments: 0,
    paidOrders: 0,
  })

  // Dialog states
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
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
      setRefreshing(true)
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

      const [ordersResponse, statsResponse] = await Promise.all([
        getOrders({
          startDate,
          endDate,
          limit: 100,
          sort: "-orderedAt",
        }),
        getOrderStats ? getOrderStats(startDate, endDate) : Promise.resolve(null),
      ])

      if (ordersResponse?.data) {
        setOrders(ordersResponse.data)
      }

      if (statsResponse) {
        setStats({
          totalOrders: statsResponse.totalOrders || 0,
          totalRevenue: statsResponse.totalRevenue || 0,
          averageOrderValue: statsResponse.averageOrderValue || 0,
          newOrders: statsResponse.newOrders || 0,
          inProgressOrders: statsResponse.inProgressOrders || 0,
          readyOrders: statsResponse.readyOrders || 0,
          completedOrders: statsResponse.completedOrders || 0,
          cancelledOrders: statsResponse.cancelledOrders || 0,
          pendingPayments: statsResponse.pendingPayments || 0,
          paidOrders: statsResponse.paidOrders || 0,
        })
      }
    } catch (error) {
      console.error("Error loading orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setRefreshing(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      const result = await updateOrderStatus(
        selectedOrder._id,
        newStatus,
        newStatus === "Cancelled" ? cancellationReason : undefined,
      )

      if (result) {
        await loadOrders()
        setShowStatusDialog(false)
        setSelectedOrder(null)
        setNewStatus("")
        setCancellationReason("")
        toast.success("Order status updated successfully")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
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
        toast.success("Payment status updated successfully")
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast.error("Failed to update payment status")
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

  const formatDualCurrency = (amount: number) => {
    const displayAmounts = getDisplayAmounts(amount)
    return {
      usd: displayAmounts.formattedUsd,
      ugx: displayAmounts.formattedUgx,
    }
  }

  const getCompletionRate = () => {
    if (stats.totalOrders === 0) return 0
    return Math.round((stats.completedOrders / stats.totalOrders) * 100)
  }

  const getPaymentRate = () => {
    if (stats.totalOrders === 0) return 0
    return Math.round((stats.paidOrders / stats.totalOrders) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Restaurant Orders
          </h1>
          <p className="text-muted-foreground text-lg">Manage and track all restaurant orders efficiently</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={loadOrders}
            disabled={refreshing}
            className="border-orange-200 hover:bg-orange-50 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => router.push("/restaurant/orders/new")}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Calendar className="h-4 w-4" />
              <span>{dateFilter === "today" ? "Today" : dateFilter === "week" ? "This Week" : "This Month"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDualCurrency(stats.totalRevenue).usd}</div>
            <div className="text-sm opacity-90">{formatDualCurrency(stats.totalRevenue).ugx}</div>
            <div className="flex items-center gap-1 text-sm opacity-90">
              <TrendingUp className="h-4 w-4" />
              <span>Avg: {formatDualCurrency(stats.averageOrderValue).usd}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Order Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getCompletionRate()}%</div>
            <Progress value={getCompletionRate()} className="mt-2 bg-purple-400" />
            <div className="text-sm opacity-90 mt-1">
              {stats.completedOrders} of {stats.totalOrders} completed
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Payment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getPaymentRate()}%</div>
            <Progress value={getPaymentRate()} className="mt-2 bg-orange-400" />
            <div className="text-sm opacity-90 mt-1">
              {stats.paidOrders} of {stats.totalOrders} paid
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-orange-600" />
            Order Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.newOrders}</div>
              <div className="text-sm text-blue-600">New Orders</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgressOrders}</div>
              <div className="text-sm text-yellow-600">In Progress</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.readyOrders}</div>
              <div className="text-sm text-green-600">Ready</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{stats.completedOrders}</div>
              <div className="text-sm text-purple-600">Completed</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="text-2xl font-bold text-red-600">{stats.cancelledOrders}</div>
              <div className="text-sm text-red-600">Cancelled</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</div>
              <div className="text-sm text-orange-600">Pending Payment</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-orange-600" />
            Advanced Filters
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
                className="pl-10 border-orange-200 focus:border-orange-400"
              />
            </div>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="border-orange-200 focus:border-orange-400">
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
              <SelectTrigger className="border-orange-200 focus:border-orange-400">
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
              <SelectTrigger className="border-orange-200 focus:border-orange-400">
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
              <SelectTrigger className="border-orange-200 focus:border-orange-400">
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
              <SelectTrigger className="border-orange-200 focus:border-orange-400">
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
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-orange-600" />
              Orders ({filteredOrders.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50 bg-transparent">
                <Print className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const customerInfo = getCustomerInfo(order)
                const locationInfo = getLocationInfo(order)
                const orderTotal = formatDualCurrency(order.totalAmount || 0)

                return (
                  <Card
                    key={order._id}
                    className="border-l-4 border-l-orange-400 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-orange-50/30"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          {/* Order Header */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              {getOrderTypeIcon(order.orderType)}
                              <h3 className="font-bold text-lg text-gray-800">{order.orderNumber}</h3>
                            </div>
                            <Badge className={orderStatusColors[order.orderStatus as keyof typeof orderStatusColors]}>
                              {order.orderStatus}
                            </Badge>
                            <Badge
                              className={paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]}
                            >
                              {order.paymentStatus}
                            </Badge>
                            <Badge className={priorityColors[order.priority as keyof typeof priorityColors]}>
                              {order.priority}
                              {order.priority === "Rush" && <AlertTriangle className="h-3 w-3 ml-1" />}
                            </Badge>
                            {order.isCorporate && (
                              <Badge variant="outline" className="border-blue-300 text-blue-700">
                                Corporate
                              </Badge>
                            )}
                            {order.isGroupBooking && (
                              <Badge variant="outline" className="border-purple-300 text-purple-700">
                                Group
                              </Badge>
                            )}
                          </div>

                          {/* Customer & Location Info */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-orange-600" />
                              <div>
                                {customerInfo ? (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{customerInfo.name}</span>
                                    {customerInfo.isVip && (
                                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                        <Star className="h-3 w-3 mr-1" />
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
                              <MapPin className="h-4 w-4 text-orange-600" />
                              <span className="font-medium">{locationInfo}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-orange-600" />
                              <span className="font-medium">{format(new Date(order.orderedAt), "MMM dd, HH:mm")}</span>
                            </div>
                          </div>

                          {/* Waiter & Booking Info */}
                          {(order.waiter || order.booking) && (
                            <div className="flex items-center gap-4 text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                              {order.waiter && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Waiter: {order.waiter.full_name}
                                </span>
                              )}
                              {order.booking && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Booking: {order.booking.confirmation_number}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Order Items Preview */}
                          <div className="space-y-2">
                            <div className="text-sm font-semibold text-gray-700">
                              Items ({order.items?.length || 0}):
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {order.items?.slice(0, 3).map((item: any, index: number) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs border-orange-200 text-orange-700"
                                >
                                  {item.quantity}x {item.name}
                                  {item.modifiers && item.modifiers.length > 0 && (
                                    <span className="ml-1 text-muted-foreground">(+{item.modifiers.length})</span>
                                  )}
                                </Badge>
                              ))}
                              {(order.items?.length || 0) > 3 && (
                                <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                                  +{(order.items?.length || 0) - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <div>
                                  <div className="font-bold text-lg text-green-700">{orderTotal.usd}</div>
                                  <div className="text-xs text-green-600">{orderTotal.ugx}</div>
                                </div>
                              </div>
                              {order.discountAmount > 0 && (
                                <div className="text-red-600">
                                  <div className="font-medium">-{order.discountPercentage}%</div>
                                  <div className="text-xs">({formatDualCurrency(order.discountAmount).usd})</div>
                                </div>
                              )}
                            </div>

                            {/* Special Notes */}
                            {order.notes && (
                              <div className="text-xs text-muted-foreground max-w-xs">
                                <div className="font-medium">Note:</div>
                                <div className="truncate">{order.notes}</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowOrderDetails(true)
                            }}
                            className="border-orange-200 hover:bg-orange-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-orange-200 hover:bg-orange-50 bg-transparent"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setNewStatus(order.orderStatus)
                                  setShowStatusDialog(true)
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Update Status
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setNewPaymentStatus(order.paymentStatus)
                                  setShowPaymentDialog(true)
                                }}
                              >
                                <DollarSign className="h-4 w-4 mr-2" />
                                Update Payment
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/restaurant/orders/${order._id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Order
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Print className="h-4 w-4 mr-2" />
                                Print Receipt
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="h-4 w-4 mr-2" />
                                Send to Kitchen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card className="border-dashed border-2 border-orange-200">
                <CardContent className="text-center py-12">
                  <Utensils className="h-16 w-16 mx-auto mb-4 text-orange-300" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-700">No orders found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                      ? "Try adjusting your filters to see more results"
                      : "Create your first order to get started with restaurant operations"}
                  </p>
                  <Button
                    onClick={() => router.push("/restaurant/orders/new")}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Order
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-orange-600" />
              Order Details - {selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>Complete order information and management</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Order Number:</span>
                      <span className="font-medium">{selectedOrder.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{selectedOrder.orderType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={orderStatusColors[selectedOrder.orderStatus as keyof typeof orderStatusColors]}>
                        {selectedOrder.orderStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Priority:</span>
                      <Badge className={priorityColors[selectedOrder.priority as keyof typeof priorityColors]}>
                        {selectedOrder.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Ordered At:</span>
                      <span className="font-medium">
                        {format(new Date(selectedOrder.orderedAt), "MMM dd, yyyy HH:mm")}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Payment Status:</span>
                      <Badge
                        className={paymentStatusColors[selectedOrder.paymentStatus as keyof typeof paymentStatusColors]}
                      >
                        {selectedOrder.paymentStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <div className="text-right">
                        <div className="font-medium">{formatDualCurrency(selectedOrder.subtotal || 0).usd}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDualCurrency(selectedOrder.subtotal || 0).ugx}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <div className="text-right">
                        <div className="font-medium">{formatDualCurrency(selectedOrder.taxAmount || 0).usd}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDualCurrency(selectedOrder.taxAmount || 0).ugx}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <div className="text-right">
                        <div className="font-medium text-red-600">
                          -{formatDualCurrency(selectedOrder.discountAmount || 0).usd}
                        </div>
                        <div className="text-xs text-red-500">
                          -{formatDualCurrency(selectedOrder.discountAmount || 0).ugx}
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <div className="text-right">
                        <div className="text-lg text-green-600">
                          {formatDualCurrency(selectedOrder.totalAmount || 0).usd}
                        </div>
                        <div className="text-sm text-green-500">
                          {formatDualCurrency(selectedOrder.totalAmount || 0).ugx}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">Quantity: {item.quantity}</div>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Modifiers: {item.modifiers.map((mod: any) => mod.name).join(", ")}
                            </div>
                          )}
                          {item.notes && <div className="text-xs text-muted-foreground">Notes: {item.notes}</div>}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatDualCurrency(item.price * item.quantity).usd}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDualCurrency(item.price * item.quantity).ugx}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              {getCustomerInfo(selectedOrder) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Name:</span>
                      <span className="font-medium">{getCustomerInfo(selectedOrder)?.name}</span>
                    </div>
                    {getCustomerInfo(selectedOrder)?.phone && (
                      <div className="flex justify-between">
                        <span>Phone:</span>
                        <span className="font-medium">{getCustomerInfo(selectedOrder)?.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium">{getLocationInfo(selectedOrder)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Special Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
              <Button
                onClick={handleStatusUpdate}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
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
              <Button
                onClick={handlePaymentUpdate}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {loading ? "Updating..." : "Update Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
