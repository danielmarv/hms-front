"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ShoppingCart,
  Search,
  Plus,
  Eye,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useRestaurantOrders } from "@/hooks/use-restaurant-orders"
import { toast } from "sonner"

export default function OrdersPage() {
  const { getOrders, updateOrderStatus, loading } = useRestaurantOrders()
  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter, priorityFilter])

  const loadOrders = async () => {
    try {
      const response = await getOrders({ limit: 100, sort: "-createdAt" })
      if (response?.data && Array.isArray(response.data)) {
        setOrders(response.data)
      }
    } catch (error) {
      console.error("Error loading orders:", error)
      toast.error("Failed to load orders")
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.table?.number?.toString().includes(searchTerm),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((order) => order.priority === priorityFilter)
    }

    setFilteredOrders(filtered)
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      await loadOrders() // Refresh orders
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-blue-100 text-blue-800", icon: Clock },
      preparing: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      ready: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      served: { color: "bg-purple-100 text-purple-800", icon: CheckCircle },
      completed: { color: "bg-gray-100 text-gray-800", icon: CheckCircle },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    }

    return (
      <Badge className={colors[priority as keyof typeof colors] || colors.medium}>
        {priority === "high" && <AlertTriangle className="w-3 h-3 mr-1" />}
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  const getOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.status === status)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[400px]" />
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage restaurant orders and track their progress</p>
        </div>
        <Button asChild>
          <Link href="/restaurant/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search orders by ID, customer, or table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="served">Served</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Order Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({getOrdersByStatus("pending").length})</TabsTrigger>
          <TabsTrigger value="preparing">Preparing ({getOrdersByStatus("preparing").length})</TabsTrigger>
          <TabsTrigger value="ready">Ready ({getOrdersByStatus("ready").length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({getOrdersByStatus("completed").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <OrdersList orders={filteredOrders} onStatusUpdate={handleStatusUpdate} />
        </TabsContent>
        <TabsContent value="pending">
          <OrdersList orders={getOrdersByStatus("pending")} onStatusUpdate={handleStatusUpdate} />
        </TabsContent>
        <TabsContent value="preparing">
          <OrdersList orders={getOrdersByStatus("preparing")} onStatusUpdate={handleStatusUpdate} />
        </TabsContent>
        <TabsContent value="ready">
          <OrdersList orders={getOrdersByStatus("ready")} onStatusUpdate={handleStatusUpdate} />
        </TabsContent>
        <TabsContent value="completed">
          <OrdersList orders={getOrdersByStatus("completed")} onStatusUpdate={handleStatusUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  )

  function OrdersList({
    orders,
    onStatusUpdate,
  }: { orders: any[]; onStatusUpdate: (id: string, status: string) => void }) {
    return (
      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <h3 className="font-semibold">Order #{order._id.slice(-6)}</h3>
                      {getStatusBadge(order.status)}
                      {order.priority && getPriorityBadge(order.priority)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {order.table?.number ? `Table ${order.table.number}` : order.deliveryInfo?.room || "Takeaway"}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShoppingCart className="h-4 w-4" />
                        {order.items?.length || 0} items
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />${order.totalAmount?.toFixed(2) || "0.00"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    {order.customerName && <p className="text-sm">Customer: {order.customerName}</p>}
                    {order.specialInstructions && (
                      <p className="text-sm text-muted-foreground">Notes: {order.specialInstructions}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={order.status} onValueChange={(value) => onStatusUpdate(order._id, value)}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="served">Served</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/restaurant/orders/${order._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-4">No orders match your current filters.</p>
              <Button asChild>
                <Link href="/restaurant/orders/new">Create New Order</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }
}
