"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShoppingCart,
  Users,
  DollarSign,
  Clock,
  ChefHat,
  AlertTriangle,
  Star,
  Utensils,
  Package,
  TrendingUp,
  RefreshCw,
  Eye,
  Calendar,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { workflowCoordinator, triggerRestaurantOrder } from "@/lib/workflow-coordinator"
import { useRestaurantOrders } from "@/hooks/use-restaurant-orders"
import { useMenuItems } from "@/hooks/use-menu-items"
import { useTables } from "@/hooks/use-tables"
import { useKitchenOrders } from "@/hooks/use-kitchen-orders"
import { toast } from "sonner"

// Currency conversion rate (UGX to USD)
const UGX_TO_USD = 0.00027 // 1 UGX = 0.00027 USD (approximate)

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
  category: string
}

interface TableItem {
  number: string
  status: string
  guests: number
  server: string | null
  time: string | null
  capacity: number
}

interface RestaurantStats {
  totalOrders: number
  activeOrders: number
  completedOrders: number
  totalRevenue: number
  averageOrderValue: number
  tablesOccupied: number
  totalTables: number
  kitchenQueue: number
  averageWaitTime: number
  customerSatisfaction: number
  todayGrowth: number
  weeklyGrowth: number
}

// Helper function to format currency in dual format
const formatDualCurrency = (amount: number) => {
  const usd = amount
  const ugx = amount / UGX_TO_USD
  return {
    usd: `$${usd.toFixed(2)}`,
    ugx: `UGX ${ugx.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
  }
}

export default function RestaurantDashboard() {
  const { getOrders, getOrderStats, loading: ordersLoading } = useRestaurantOrders()
  const { getMenuItems, loading: menuLoading } = useMenuItems()
  const { getTables, loading: tablesLoading } = useTables()
  const { getKitchenOrders, getKitchenStats, loading: kitchenLoading } = useKitchenOrders()

  const [stats, setStats] = useState<RestaurantStats>({
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
    todayGrowth: 12.5,
    weeklyGrowth: 8.3,
  })

  const [activeOrders, setActiveOrders] = useState<OrderItem[]>([])
  const [popularItems, setPopularItems] = useState<PopularItem[]>([])
  const [tableStatus, setTableStatus] = useState<TableItem[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadRestaurantData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadRestaurantData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadRestaurantData = async () => {
    setRefreshing(true)
    try {
      // Load order statistics
      const orderStatsResponse = await getOrderStats()
      if (orderStatsResponse?.data) {
        setStats((prev) => ({
          ...prev,
          totalOrders: orderStatsResponse.data?.totalOrders || 0,
          totalRevenue: orderStatsResponse.data?.totalRevenue || 0,
          averageOrderValue: orderStatsResponse.data?.averageOrderValue || 0,
        }))
      }

      // Load active orders
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

      // Load kitchen statistics
      const kitchenStatsResponse = await getKitchenStats()
      if (kitchenStatsResponse?.data) {
        setStats((prev) => ({
          ...prev,
          kitchenQueue: kitchenStatsResponse.data?.activeOrders || 0,
        }))
      }

      // Load tables data
      const tablesResponse = await getTables()
      if (tablesResponse?.data && Array.isArray(tablesResponse.data)) {
        const tables = tablesResponse.data
        setTableStatus(
          tables.slice(0, 8).map((table: any) => ({
            number: table.number,
            status: table.status,
            guests: table.currentGuests || 0,
            server: table.assignedServer || null,
            time: table.lastUpdated ? new Date(table.lastUpdated).toLocaleTimeString() : null,
            capacity: table.capacity || 4,
          })),
        )

        setStats((prev) => ({
          ...prev,
          totalTables: tables.length,
          tablesOccupied: tables.filter((t: any) => t.status === "occupied").length,
        }))
      }

      // Load popular menu items
      const menuResponse = await getMenuItems({
        featured: true,
        limit: 6,
        sort: "-popularity",
      })
      if (menuResponse?.data && Array.isArray(menuResponse.data)) {
        setPopularItems(
          menuResponse.data.map((item: any) => ({
            name: item.name,
            orders: item.orderCount || Math.floor(Math.random() * 20) + 5,
            revenue: (item.orderCount || 5) * item.price,
            category: item.category || "Main Course",
          })),
        )
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading restaurant data:", error)
      toast.error("Failed to load restaurant data")
    } finally {
      setRefreshing(false)
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
    const statusConfig = {
      pending: { color: "bg-blue-500", text: "text-white", label: "Pending" },
      preparing: { color: "bg-yellow-500", text: "text-white", label: "Preparing" },
      ready: { color: "bg-green-500", text: "text-white", label: "Ready" },
      served: { color: "bg-purple-500", text: "text-white", label: "Served" },
      completed: { color: "bg-gray-500", text: "text-white", label: "Completed" },
      cancelled: { color: "bg-red-500", text: "text-white", label: "Cancelled" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={`${config.color} ${config.text} border-0`}>{config.label}</Badge>
  }

  const getTableStatusBadge = (status: string) => {
    const statusConfig = {
      occupied: { color: "bg-red-500", text: "text-white", label: "Occupied", icon: Users },
      available: { color: "bg-green-500", text: "text-white", label: "Available", icon: Users },
      reserved: { color: "bg-blue-500", text: "text-white", label: "Reserved", icon: Calendar },
      cleaning: { color: "bg-yellow-500", text: "text-white", label: "Cleaning", icon: RefreshCw },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available
    const Icon = config.icon

    return (
      <Badge className={`${config.color} ${config.text} border-0 flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const handleNewOrder = () => {
    triggerRestaurantOrder({
      orderId: `ORD-${Date.now()}`,
      table: "Table 10",
      items: [{ name: "Sample Item", quantity: 1, price: 25.0 }],
      total: 25.0,
    })

    setTimeout(() => {
      loadRestaurantData()
    }, 1000)
  }

  const isLoading = ordersLoading || menuLoading || tablesLoading || kitchenLoading

  if (isLoading && !stats.totalOrders) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[500px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
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

  const occupancyRate = stats.totalTables > 0 ? (stats.tablesOccupied / stats.totalTables) * 100 : 0
  const completionRate = stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Restaurant Dashboard</h1>
          <p className="text-gray-600">Monitor restaurant operations and manage orders efficiently</p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refresh every 30s
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadRestaurantData} variant="outline" disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleNewOrder} className="bg-orange-600 hover:bg-orange-700">
            <ShoppingCart className="mr-2 h-4 w-4" />
            New Order
          </Button>
          <Button variant="outline" asChild>
            <Link href="/kitchen">
              <ChefHat className="mr-2 h-4 w-4" />
              Kitchen View
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Orders */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Active Orders</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.activeOrders}</div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-blue-700">{stats.totalOrders} total today</p>
              <Badge variant="outline" className="text-xs bg-blue-200 text-blue-800 border-blue-300">
                <TrendingUp className="h-3 w-3 mr-1" />+{stats.todayGrowth}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Today */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Revenue Today</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{formatDualCurrency(stats.totalRevenue).usd}</div>
            <div className="space-y-1">
              <p className="text-xs text-green-700">{formatDualCurrency(stats.totalRevenue).ugx}</p>
              <p className="text-xs text-green-600">Avg: {formatDualCurrency(stats.averageOrderValue).usd}</p>
            </div>
          </CardContent>
        </Card>

        {/* Table Occupancy */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Table Occupancy</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {stats.tablesOccupied}/{stats.totalTables}
            </div>
            <div className="space-y-2 mt-2">
              <Progress value={occupancyRate} className="h-2" />
              <p className="text-xs text-purple-700">{occupancyRate.toFixed(0)}% occupied</p>
            </div>
          </CardContent>
        </Card>

        {/* Kitchen Performance */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Kitchen Queue</CardTitle>
            <div className="p-2 bg-orange-500 rounded-lg">
              <ChefHat className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.kitchenQueue}</div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-orange-700">{stats.averageWaitTime} min avg</p>
              {stats.kitchenQueue > 5 && <AlertTriangle className="h-4 w-4 text-red-500" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Customer Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.customerSatisfaction}/5.0</div>
            <p className="text-xs text-muted-foreground">Based on reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{completionRate.toFixed(0)}%</div>
            <Progress value={completionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Weekly Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">+{stats.weeklyGrowth}%</div>
            <p className="text-xs text-muted-foreground">vs last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              Avg Wait Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stats.averageWaitTime} min</div>
            <p className="text-xs text-muted-foreground">Kitchen to table</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Active Orders</TabsTrigger>
          <TabsTrigger value="tables">Table Status</TabsTrigger>
          <TabsTrigger value="popular">Popular Items</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Active Orders ({activeOrders.length})
              </CardTitle>
              <CardDescription>Orders currently being processed</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {activeOrders.length > 0 ? (
                    activeOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">#{order.id.slice(-6)}</p>
                              {order.priority === "high" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            </div>
                            <p className="text-sm text-gray-600">
                              {order.table} • {order.items} items
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {order.time}
                              </span>
                              <span>{formatDualCurrency(order.total).usd}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getOrderStatusBadge(order.status)}
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/restaurant/orders/${order.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active orders</p>
                      <p className="text-sm">New orders will appear here</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Table Status ({stats.tablesOccupied}/{stats.totalTables} occupied)
              </CardTitle>
              <CardDescription>Current status of restaurant tables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {tableStatus.length > 0 ? (
                  tableStatus.map((table) => (
                    <div key={table.number} className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Table {table.number}</h3>
                        {getTableStatusBadge(table.status)}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium">{table.capacity} seats</span>
                        </div>

                        {table.guests > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Current:</span>
                            <span className="font-medium">{table.guests} guests</span>
                          </div>
                        )}

                        {table.server && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Server:</span>
                            <span className="font-medium">{table.server}</span>
                          </div>
                        )}

                        {table.time && (
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Last updated:</span>
                            <span>{table.time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No table data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Popular Items Today
              </CardTitle>
              <CardDescription>Best selling menu items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularItems.length > 0 ? (
                  popularItems.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>{item.orders} orders</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatDualCurrency(item.revenue).usd}</p>
                        <p className="text-xs text-gray-500">{formatDualCurrency(item.revenue).ugx}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No popular items data</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used restaurant functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 hover:bg-orange-50 hover:border-orange-200 bg-transparent"
                  asChild
                >
                  <Link href="/restaurant/orders/new">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <ShoppingCart className="h-6 w-6 text-orange-600" />
                    </div>
                    <span className="font-medium">New Order</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200 bg-transparent"
                  asChild
                >
                  <Link href="/restaurant/menu">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Utensils className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="font-medium">Manage Menu</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 hover:bg-green-50 hover:border-green-200 bg-transparent"
                  asChild
                >
                  <Link href="/restaurant/tables">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="font-medium">Table Management</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 hover:bg-purple-50 hover:border-purple-200 bg-transparent"
                  asChild
                >
                  <Link href="/restaurant/inventory">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="font-medium">Check Inventory</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 hover:bg-indigo-50 hover:border-indigo-200 bg-transparent"
                  asChild
                >
                  <Link href="/restaurant/analytics">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-indigo-600" />
                    </div>
                    <span className="font-medium">Analytics</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 hover:bg-yellow-50 hover:border-yellow-200 bg-transparent"
                  asChild
                >
                  <Link href="/kitchen">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <ChefHat className="h-6 w-6 text-yellow-600" />
                    </div>
                    <span className="font-medium">Kitchen View</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 hover:bg-pink-50 hover:border-pink-200 bg-transparent"
                  asChild
                >
                  <Link href="/restaurant/reports">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-pink-600" />
                    </div>
                    <span className="font-medium">Reports</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2 hover:bg-gray-50 hover:border-gray-200 bg-transparent"
                  onClick={handleNewOrder}
                >
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <RefreshCw className="h-6 w-6 text-gray-600" />
                  </div>
                  <span className="font-medium">Demo Order</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
