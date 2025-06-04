"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingCart, Users, DollarSign, Clock, ChefHat, AlertTriangle, Star, Utensils, Package } from "lucide-react"
import Link from "next/link"
import { workflowCoordinator, triggerRestaurantOrder } from "@/lib/workflow-coordinator"
import { useRestaurantOrders } from "@/hooks/use-restaurant-orders"
import { useMenuItems } from "@/hooks/use-menu-items"
import { useTables } from "@/hooks/use-tables"
import { useKitchenOrders } from "@/hooks/use-kitchen-orders"
import { toast } from "sonner"

interface OrderItem {
  id: string
  table: string
  items: number
  total: number
  status: string
  time: string
  priority: string
}

interface PopularItem {
  name: string
  orders: number
  revenue: number
}

interface TableItem {
  number: string
  status: string
  guests: number
  server: string | null
  time: string | null
}

export default function RestaurantDashboard() {
  const { getOrders, getOrderStats, loading: ordersLoading } = useRestaurantOrders()
  const { getMenuItems, loading: menuLoading } = useMenuItems()
  const { getTables, loading: tablesLoading } = useTables()
  const { getKitchenOrders, getKitchenStats, loading: kitchenLoading } = useKitchenOrders()

  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    tablesOccupied: 0,
    totalTables: 0,
    kitchenQueue: 0,
    averageWaitTime: 25,
    customerSatisfaction: 4.6,
  })

  const [activeOrders, setActiveOrders] = useState<OrderItem[]>([])
  const [popularItems, setPopularItems] = useState<PopularItem[]>([])
  const [tableStatus, setTableStatus] = useState<TableItem[]>([])

  useEffect(() => {
    loadRestaurantData()
  }, [])

  const loadRestaurantData = async () => {
    try {
      const orderStatsResponse = await getOrderStats()
      if (orderStatsResponse?.data) {
        setStats((prev) => ({
          ...prev,
          totalOrders: orderStatsResponse.data?.totalOrders || 0,
          totalRevenue: orderStatsResponse.data?.totalRevenue || 0,
          averageOrderValue: orderStatsResponse.data?.averageOrderValue || 0,
        }))
      }

      const ordersResponse = await getOrders({
        limit: 10,
        sort: "-createdAt",
      })
      if (ordersResponse?.data && Array.isArray(ordersResponse.data)) {
        setActiveOrders(
          ordersResponse.data.map((order: any) => ({
            id: order._id,
            table: order.table?.number ? `Table ${order.table.number}` : order.deliveryInfo?.room || "Takeaway",
            items: order.items?.length || 0,
            total: order.totalAmount || 0,
            status: order.status,
            time: new Date(order.createdAt).toLocaleTimeString(),
            priority: order.priority || "normal",
          })),
        )

        setStats((prev) => ({
          ...prev,
          activeOrders: Array.isArray(ordersResponse.data)
            ? ordersResponse.data.filter((o: any) => ["pending", "preparing"].includes(o.status)).length
            : 0,
          completedOrders: Array.isArray(ordersResponse.data)
            ? ordersResponse.data.filter((o: any) => o.status === "completed").length
            : 0,
        }))
      }

      const kitchenStatsResponse = await getKitchenStats()
      if (kitchenStatsResponse?.data) {
        setStats((prev) => ({
          ...prev,
          kitchenQueue: kitchenStatsResponse.data?.activeOrders || 0,
        }))
      }

      const tablesResponse = await getTables()
      if (tablesResponse?.data && Array.isArray(tablesResponse.data)) {
        const tables = tablesResponse.data
        setTableStatus(
          tables.slice(0, 5).map((table: any) => ({
            number: table.number,
            status: table.status,
            guests: table.currentGuests || 0,
            server: table.assignedServer || null,
            time: table.lastUpdated ? new Date(table.lastUpdated).toLocaleTimeString() : null,
          })),
        )

        setStats((prev) => ({
          ...prev,
          totalTables: tables.length,
          tablesOccupied: tables.filter((t: any) => t.status === "occupied").length,
        }))
      }

      const menuResponse = await getMenuItems({
        featured: true,
        limit: 4,
        sort: "-popularity",
      })
      if (menuResponse?.data && Array.isArray(menuResponse.data)) {
        setPopularItems(
          menuResponse.data.map((item: any) => ({
            name: item.name,
            orders: item.orderCount || Math.floor(Math.random() * 20),
            revenue: (item.orderCount || 5) * item.price,
          })),
        )
      }
    } catch (error) {
      console.error("Error loading restaurant data:", error)
      toast.error("Failed to load restaurant data")
    }
  }

  useEffect(() => {
    const handleWorkflowEvent = (event: any) => {
      console.log("Restaurant received workflow event:", event)
      if (event.type === "order.created" || event.type === "order.updated") {
        loadRestaurantData()
      }
    }

    workflowCoordinator.addEventListener("order.created", handleWorkflowEvent)
    workflowCoordinator.addEventListener("order.updated", handleWorkflowEvent)

    return () => {
      workflowCoordinator.removeEventListener("order.created", handleWorkflowEvent)
      workflowCoordinator.removeEventListener("order.updated", handleWorkflowEvent)
    }
  }, [])

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>
      case "preparing":
        return <Badge className="bg-yellow-100 text-yellow-800">Preparing</Badge>
      case "ready":
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>
      case "served":
        return <Badge className="bg-purple-100 text-purple-800">Served</Badge>
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTableStatusBadge = (status: string) => {
    switch (status) {
      case "occupied":
        return <Badge className="bg-red-100 text-red-800">Occupied</Badge>
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>
      case "reserved":
        return <Badge className="bg-blue-100 text-blue-800">Reserved</Badge>
      case "cleaning":
        return <Badge className="bg-yellow-100 text-yellow-800">Cleaning</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleNewOrder = () => {
    triggerRestaurantOrder({
      orderId: `ORD-${Date.now()}`,
      table: "Table 10",
      items: [{ name: "Sample Item", quantity: 1, price: 25.0 }],
      total: 25.0,
    })

    // Refresh data after creating order
    setTimeout(() => {
      loadRestaurantData()
    }, 1000)
  }

  const isLoading = ordersLoading || menuLoading || tablesLoading || kitchenLoading

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[500px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="h-3 w-[120px] mt-2" />
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
          <h1 className="text-3xl font-bold tracking-tight">Restaurant Dashboard</h1>
          <p className="text-muted-foreground">Monitor restaurant operations and manage orders efficiently</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewOrder}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            New Order
          </Button>
          <Button variant="outline" asChild>
            <Link href="/restaurant/kitchen">
              <ChefHat className="mr-2 h-4 w-4" />
              Kitchen View
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">{stats.totalOrders} total today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">${stats.averageOrderValue.toFixed(2)} avg order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables Occupied</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.tablesOccupied}/{stats.totalTables}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTables > 0 ? ((stats.tablesOccupied / stats.totalTables) * 100).toFixed(0) : 0}% occupancy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kitchen Queue</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kitchenQueue}</div>
            <p className="text-xs text-muted-foreground">{stats.averageWaitTime} min avg wait</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customerSatisfaction}/5</div>
            <p className="text-xs text-muted-foreground">Based on reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Active Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
            <CardDescription>Orders currently being processed</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {activeOrders.length > 0 ? (
                  activeOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{order.id.slice(-6)}</p>
                            {order.priority === "high" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {order.table} • {order.items} items • ${order.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {order.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getOrderStatusBadge(order.status)}
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/restaurant/orders/${order.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No active orders</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Items Today</CardTitle>
            <CardDescription>Best selling menu items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularItems.length > 0 ? (
                popularItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.orders} orders</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">${item.revenue.toFixed(0)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No popular items data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table Status */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Table Status</CardTitle>
            <CardDescription>Current status of restaurant tables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {tableStatus.length > 0 ? (
                tableStatus.map((table) => (
                  <div key={table.number} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Table {table.number}</h3>
                      {getTableStatusBadge(table.status)}
                    </div>
                    {table.guests > 0 && <p className="text-sm text-muted-foreground">{table.guests} guests</p>}
                    {table.server && <p className="text-sm text-muted-foreground">Server: {table.server}</p>}
                    {table.time && (
                      <p className="text-xs text-muted-foreground">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {table.time}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground col-span-5">No table data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used restaurant functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/restaurant/orders/new">
                <ShoppingCart className="h-6 w-6" />
                New Order
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/restaurant/menu">
                <Utensils className="h-6 w-6" />
                Manage Menu
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/restaurant/tables">
                <Users className="h-6 w-6" />
                Table Management
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/restaurant/inventory">
                <Package className="h-6 w-6" />
                Check Inventory
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
