"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Eye, ShoppingCart, Users, DollarSign, Clock } from "lucide-react"
import Link from "next/link"
import { useRestaurantOrders } from "@/hooks/use-restaurant-orders"
import { toast } from "sonner"

// Import new consistent components
import { PageHeader } from "@/components/ui/page-header"
import { StatsGrid, StatCard } from "@/components/ui/stats-grid"
import { FilterBar } from "@/components/ui/filter-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { Card, CardContent } from "@/components/ui/card"

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

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.table?.number?.toString().includes(searchTerm),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((order) => order.priority === priorityFilter)
    }

    setFilteredOrders(filtered)
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      await loadOrders()
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const getOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.status === status)
  }

  const calculateStats = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

    return {
      total: orders.length,
      pending: getOrdersByStatus("pending").length,
      preparing: getOrdersByStatus("preparing").length,
      ready: getOrdersByStatus("ready").length,
      revenue: totalRevenue,
      avgValue: avgOrderValue,
    }
  }

  const stats = calculateStats()

  if (loading) {
    return <LoadingSkeleton variant="page" />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Orders"
        description="Manage restaurant orders and track their progress"
        action={
          <Button asChild>
            <Link href="/restaurant/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <StatsGrid>
        <StatCard title="Total Orders" value={stats.total} icon={ShoppingCart} />
        <StatCard title="Pending" value={stats.pending} icon={Clock} />
        <StatCard title="In Progress" value={stats.preparing + stats.ready} icon={Users} />
        <StatCard title="Revenue" value={`$${stats.revenue.toFixed(2)}`} icon={DollarSign} />
      </StatsGrid>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search orders by ID, customer, or table..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            placeholder: "Filter by status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "all", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "preparing", label: "Preparing" },
              { value: "ready", label: "Ready" },
              { value: "served", label: "Served" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ],
          },
          {
            placeholder: "Filter by priority",
            value: priorityFilter,
            onChange: setPriorityFilter,
            options: [
              { value: "all", label: "All Priorities" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ],
          },
        ]}
      />

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
    if (orders.length === 0) {
      return (
        <EmptyState
          icon={ShoppingCart}
          title="No orders found"
          description="No orders match your current filters."
          action={{
            label: "Create New Order",
            href: "/restaurant/orders/new",
          }}
        />
      )
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order._id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold">Order #{order._id.slice(-6)}</h3>
                    <StatusBadge status={order.status} />
                    {order.priority && <StatusBadge status={order.priority} variant={order.priority} />}
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
        ))}
      </div>
    )
  }
}
