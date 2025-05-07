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
import { ChefHat, Clock, AlertTriangle } from "lucide-react"
import type { KitchenOrder, KitchenOrderFilters } from "@/types"

export default function KitchenPage() {
  const { getOrders, updateOrderStatus, loading: apiLoading } = useKitchenOrders()
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [filters, setFilters] = useState<KitchenOrderFilters>({
    status: "New,Preparing",
    sort: "priority,-createdAt",
  })

  useEffect(() => {
    fetchOrders()
    // Set up polling for real-time updates
    const interval = setInterval(fetchOrders, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [filters])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const result = await getOrders(filters)
      if (result && result.success && result.data) {
        setOrders(result.data)
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

  const handleUpdateStatus = async (orderId: string, status: string) => {
    const result = await updateOrderStatus(orderId, status)
    if (result) {
      fetchOrders()
    }
  }

  const isLoading = loading || apiLoading

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-3/4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Kitchen Display System</h1>
              <p className="text-muted-foreground">Manage and track food orders in real-time</p>
            </div>
            <Button onClick={fetchOrders} variant="outline" className="mt-2 md:mt-0">
              Refresh Orders
            </Button>
          </div>

          <Tabs defaultValue="pending" value={activeTab} onValueChange={handleTabChange} className="mb-6">
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="ready">Ready</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="all">All Orders</TabsTrigger>
            </TabsList>
          </Tabs>

          <KitchenOrderFilter onFilterChange={handleFilterChange} />

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
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
            <Card className="p-8 text-center mt-6">
              <div className="mb-4 flex justify-center">
                <ChefHat className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No orders found</h3>
              <p className="text-muted-foreground mt-2">
                There are no orders matching your current filters. Try changing your filters or check back later.
              </p>
              <Button className="mt-4" onClick={() => handleTabChange("all")}>
                View All Orders
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
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

        <div className="w-full lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Kitchen Stats</CardTitle>
              <CardDescription>Today's kitchen performance</CardDescription>
            </CardHeader>
            <CardContent>
              <KitchenStats />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="flex items-center text-yellow-800">
                <Clock className="mr-2 h-5 w-5" />
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {orders
                  .filter((order) => order.status === "New" || order.status === "Preparing")
                  .slice(0, 5)
                  .map((order) => (
                    <div key={order._id} className="p-4 hover:bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Order #{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} items • {order.orderType}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {order.priority === "High" && (
                            <span className="mr-2 text-red-500">
                              <AlertTriangle className="h-4 w-4" />
                            </span>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(order._id, "Ready")}>
                            Mark Ready
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                {orders.filter((order) => order.status === "New" || order.status === "Preparing").length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">No pending orders</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
