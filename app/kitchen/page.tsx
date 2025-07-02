"use client"

import { useState, useEffect } from "react"
import { useKitchenOrders } from "@/hooks/use-kitchen-orders"
import { KitchenOrderCard } from "@/components/kitchen/kitchen-order-card"
import { KitchenOrderFilter } from "@/components/kitchen/kitchen-order-filter"
import { KitchenStats } from "@/components/kitchen/kitchen-stats"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChefHat, Clock, AlertTriangle, RefreshCw, Info, Wifi, WifiOff } from "lucide-react"
import type { KitchenOrder, KitchenOrderFilters } from "@/types"

export default function KitchenPage() {
  const { getKitchenOrders, updateKitchenOrderStatus, loading: apiLoading, error } = useKitchenOrders()
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [filters, setFilters] = useState<KitchenOrderFilters>({
    sort: "-createdAt",
    limit: 50,
  })

  useEffect(() => {
    fetchOrders()
    // Set up polling for real-time updates
    const interval = setInterval(fetchOrders, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [filters])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const result = await getKitchenOrders(filters)
      console.log("Fetched kitchen orders:", result)
      if (result && result.data) {
        // Handle both success and mock data cases
        setOrders(Array.isArray(result.data) ? result.data : [])
        setLastUpdated(new Date())
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error("Error fetching kitchen orders:", error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    let statusFilter: string | undefined

    switch (value) {
      case "pending":
        statusFilter = "New,Preparing"
        break
      case "ready":
        statusFilter = "Ready"
        break
      case "completed":
        statusFilter = "Completed"
        break
      case "cancelled":
        statusFilter = "Cancelled"
        break
      case "all":
        statusFilter = undefined
        break
      default:
        statusFilter = "New,Preparing"
    }

    setFilters((prev) => ({
      ...prev,
      status: statusFilter,
    }))
  }

  const handleFilterChange = (newFilters: Partial<KitchenOrderFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }))
  }

  const handleUpdateStatus = async (orderId: string, status: string, notes?: string) => {
    const result = await updateKitchenOrderStatus(orderId, status, notes)
    if (result) {
      fetchOrders()
    }
  }

  const getOrdersByStatus = (status: string) => {
    return orders.filter((order) => {
      switch (status) {
        case "pending":
          return order.status === "New" || order.status === "Preparing"
        case "ready":
          return order.status === "Ready"
        case "completed":
          return order.status === "Completed"
        case "cancelled":
          return order.status === "Cancelled"
        default:
          return true
      }
    })
  }

  const isLoading = loading || apiLoading

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ChefHat className="h-8 w-8" />
            Kitchen Display System
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Manage and track food orders in real-time
            {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchOrders} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {lastUpdated && (
            <div className="text-sm text-muted-foreground flex items-center">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Status Alerts */}
      {!isOnline && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're currently offline. Some features may not work properly. Check your internet connection.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}. Showing cached data. Click refresh to try again.</AlertDescription>
        </Alert>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Orders are created by the restaurant staff. Use this dashboard to manage order preparation and track kitchen
          performance.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Status Tabs */}
          <Tabs defaultValue="pending" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-5 w-full max-w-2xl">
              <TabsTrigger value="pending" className="relative">
                Pending
                {getOrdersByStatus("pending").length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                    {getOrdersByStatus("pending").length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="ready" className="relative">
                Ready
                {getOrdersByStatus("ready").length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {getOrdersByStatus("ready").length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              <TabsTrigger value="all">All Orders</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters */}
          <KitchenOrderFilter onFilterChange={handleFilterChange} />

          {/* Orders Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div className="mt-4">
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : orders.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="mb-4 flex justify-center">
                <ChefHat className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No orders found</h3>
              <p className="text-muted-foreground mt-2">
                {error
                  ? "Unable to load orders. Please check your connection and try again."
                  : "There are no orders matching your current filters. Orders are created by the restaurant staff and will appear here automatically."}
              </p>
              <div className="mt-4 flex gap-2 justify-center">
                <Button onClick={() => handleTabChange("all")} variant="outline">
                  View All Orders
                </Button>
                <Button onClick={fetchOrders}>Refresh Orders</Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {orders.map((order) => (
                <KitchenOrderCard
                  key={order._id}
                  order={order}
                  onUpdateStatus={handleUpdateStatus}
                  onRefresh={fetchOrders}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Kitchen Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Kitchen Performance</CardTitle>
              <CardDescription>Today's kitchen metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <KitchenStats />
            </CardContent>
          </Card>

          {/* Pending Orders Summary */}
          <Card>
            <CardHeader className="bg-yellow-50">
              <CardTitle className="flex items-center text-yellow-800">
                <Clock className="mr-2 h-5 w-5" />
                Urgent Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-80 overflow-y-auto">
                {orders
                  .filter(
                    (order) => (order.status === "New" || order.status === "Preparing") && order.priority === "High",
                  )
                  .slice(0, 5)
                  .map((order) => (
                    <div key={order._id} className="p-4 hover:bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Order #{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items?.length || 0} items • {order.orderType}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <Badge variant="destructive" className="text-xs">
                            {order.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                {orders.filter(
                  (order) => (order.status === "New" || order.status === "Preparing") && order.priority === "High",
                ).length === 0 && <div className="p-4 text-center text-muted-foreground">No urgent orders</div>}
              </div>
            </CardContent>
          </Card>

          {/* Ready Orders */}
          <Card>
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center text-green-800">
                <ChefHat className="mr-2 h-5 w-5" />
                Ready for Pickup
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-60 overflow-y-auto">
                {orders
                  .filter((order) => order.status === "Ready")
                  .slice(0, 5)
                  .map((order) => (
                    <div key={order._id} className="p-4 hover:bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Order #{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.table ? `Table ${order.table}` : order.room ? `Room ${order.room}` : "Takeaway"}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order._id, "Completed")}>
                          Complete
                        </Button>
                      </div>
                    </div>
                  ))}
                {orders.filter((order) => order.status === "Ready").length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">No orders ready</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
