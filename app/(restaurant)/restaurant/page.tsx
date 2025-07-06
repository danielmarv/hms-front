"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  ChefHat,
  Utensils,
  MapPin,
  Star,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Timer,
  Target,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useCurrency } from "@/hooks/use-currency"
import { useRestaurantOrders } from "@/hooks/use-restaurant-orders"
import { toast } from "sonner"
import { format } from "date-fns"

export default function RestaurantDashboard() {
  const router = useRouter()
  const { getDisplayAmounts } = useCurrency()
  const { getOrders, getOrderStats, loading } = useRestaurantOrders()

  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    averageOrderValue: 0,
    activeOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    tablesOccupied: 0,
    totalTables: 20,
    popularItems: [] as any[],
    recentOrders: [] as any[],
    hourlyRevenue: [] as any[],
    ordersByType: [] as any[],
    paymentMethods: [] as any[],
    customerSatisfaction: 4.5,
    averageWaitTime: 15,
    kitchenEfficiency: 85,
    staffPerformance: [] as any[],
  })

  // Growth indicators
  const [growthData, setGrowthData] = useState({
    revenueGrowth: 12.5,
    orderGrowth: 8.3,
    customerGrowth: 15.2,
    efficiencyGrowth: 5.7,
  })

  useEffect(() => {
    loadDashboardData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setRefreshing(true)
      const today = new Date()
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

      // Load today's orders and stats
      const [ordersResponse, statsResponse] = await Promise.all([
        getOrders({
          startDate: startOfDay,
          endDate: endOfDay,
          limit: 50,
          sort: "-orderedAt",
        }),
        getOrderStats ? getOrderStats(startOfDay, endOfDay) : Promise.resolve(null),
      ])

      const orders = ordersResponse?.data || []

      // Calculate dashboard metrics
      const todayRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0)
      const activeOrders = orders.filter((order: any) =>
        ["New", "In Progress", "Ready"].includes(order.orderStatus),
      ).length
      const completedOrders = orders.filter((order: any) => order.orderStatus === "Completed").length
      const pendingOrders = orders.filter((order: any) => order.orderStatus === "New").length
      const cancelledOrders = orders.filter((order: any) => order.orderStatus === "Cancelled").length

      // Mock popular items (in real app, this would come from API)
      const popularItems = [
        { name: "Grilled Salmon", orders: 45, revenue: 1350, growth: 12 },
        { name: "Beef Steak", orders: 38, revenue: 1520, growth: 8 },
        { name: "Chicken Pasta", orders: 52, revenue: 1040, growth: 15 },
        { name: "Caesar Salad", orders: 29, revenue: 435, growth: -3 },
        { name: "Chocolate Cake", orders: 33, revenue: 495, growth: 22 },
      ]

      // Mock hourly revenue data
      const hourlyRevenue = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        revenue: Math.random() * 500 + 100,
        orders: Math.floor(Math.random() * 20) + 5,
      }))

      // Order types distribution
      const ordersByType = [
        { type: "Dine In", count: orders.filter((o: any) => o.orderType === "Dine In").length, percentage: 65 },
        {
          type: "Room Service",
          count: orders.filter((o: any) => o.orderType === "Room Service").length,
          percentage: 20,
        },
        { type: "Takeaway", count: orders.filter((o: any) => o.orderType === "Takeaway").length, percentage: 10 },
        { type: "Delivery", count: orders.filter((o: any) => o.orderType === "Delivery").length, percentage: 5 },
      ]

      setDashboardData({
        todayRevenue,
        todayOrders: orders.length,
        averageOrderValue: orders.length > 0 ? todayRevenue / orders.length : 0,
        activeOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        tablesOccupied: Math.floor(Math.random() * 15) + 8, // Mock data
        totalTables: 20,
        popularItems,
        recentOrders: orders.slice(0, 10),
        hourlyRevenue,
        ordersByType,
        paymentMethods: [
          { method: "Cash", amount: todayRevenue * 0.4, percentage: 40 },
          { method: "Card", amount: todayRevenue * 0.45, percentage: 45 },
          { method: "Room Charge", amount: todayRevenue * 0.15, percentage: 15 },
        ],
        customerSatisfaction: 4.5 + Math.random() * 0.4,
        averageWaitTime: 12 + Math.floor(Math.random() * 8),
        kitchenEfficiency: 80 + Math.floor(Math.random() * 15),
        staffPerformance: [
          { name: "John Smith", orders: 25, rating: 4.8, tips: 120 },
          { name: "Sarah Johnson", orders: 22, rating: 4.6, tips: 95 },
          { name: "Mike Wilson", orders: 18, rating: 4.4, tips: 85 },
        ],
      })

      setLastRefresh(new Date())
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setRefreshing(false)
    }
  }

  const formatDualCurrency = (amount: number) => {
    const displayAmounts = getDisplayAmounts(amount)
    return {
      usd: displayAmounts.formattedUsd,
      ugx: displayAmounts.formattedUgx,
    }
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Restaurant Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">Real-time overview of restaurant operations and performance</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Clock className="h-4 w-4" />
            <span>Last updated: {format(lastRefresh, "MMM dd, HH:mm:ss")}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={loadDashboardData}
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

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center justify-between">
              Today's Revenue
              {getGrowthIcon(growthData.revenueGrowth)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDualCurrency(dashboardData.todayRevenue).usd}</div>
            <div className="text-sm opacity-90">{formatDualCurrency(dashboardData.todayRevenue).ugx}</div>
            <div className={`text-sm opacity-90 ${getGrowthColor(growthData.revenueGrowth)}`}>
              {growthData.revenueGrowth >= 0 ? "+" : ""}
              {growthData.revenueGrowth}% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center justify-between">
              Today's Orders
              {getGrowthIcon(growthData.orderGrowth)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.todayOrders}</div>
            <div className="text-sm opacity-90">Avg: {formatDualCurrency(dashboardData.averageOrderValue).usd}</div>
            <div className={`text-sm opacity-90 ${getGrowthColor(growthData.orderGrowth)}`}>
              {growthData.orderGrowth >= 0 ? "+" : ""}
              {growthData.orderGrowth}% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center justify-between">
              Active Orders
              <Activity className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.activeOrders}</div>
            <div className="text-sm opacity-90">
              {dashboardData.pendingOrders} pending, {dashboardData.activeOrders - dashboardData.pendingOrders} in
              progress
            </div>
            <div className="flex items-center gap-1 text-sm opacity-90">
              <Timer className="h-3 w-3" />
              <span>Avg wait: {dashboardData.averageWaitTime}min</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90 flex items-center justify-between">
              Table Occupancy
              <Users className="h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {dashboardData.tablesOccupied}/{dashboardData.totalTables}
            </div>
            <Progress
              value={(dashboardData.tablesOccupied / dashboardData.totalTables) * 100}
              className="mt-2 bg-orange-400"
            />
            <div className="text-sm opacity-90 mt-1">
              {Math.round((dashboardData.tablesOccupied / dashboardData.totalTables) * 100)}% occupied
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Customer Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.customerSatisfaction.toFixed(1)}/5.0</div>
            <Progress value={dashboardData.customerSatisfaction * 20} className="mt-2" />
            <div className={`text-sm mt-1 ${getGrowthColor(growthData.customerGrowth)}`}>
              {growthData.customerGrowth >= 0 ? "+" : ""}
              {growthData.customerGrowth}% this week
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-orange-500" />
              Kitchen Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.kitchenEfficiency}%</div>
            <Progress value={dashboardData.kitchenEfficiency} className="mt-2" />
            <div className={`text-sm mt-1 ${getGrowthColor(growthData.efficiencyGrowth)}`}>
              {growthData.efficiencyGrowth >= 0 ? "+" : ""}
              {growthData.efficiencyGrowth}% this week
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Completed Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.completedOrders}</div>
            <div className="text-sm text-muted-foreground">
              Success rate:{" "}
              {dashboardData.todayOrders > 0
                ? Math.round((dashboardData.completedOrders / dashboardData.todayOrders) * 100)
                : 0}
              %
            </div>
            <div className="text-sm text-green-600 mt-1">{dashboardData.cancelledOrders} cancelled today</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Daily Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((dashboardData.todayRevenue / 5000) * 100)}%</div>
            <Progress value={(dashboardData.todayRevenue / 5000) * 100} className="mt-2" />
            <div className="text-sm text-muted-foreground mt-1">Target: {formatDualCurrency(5000).usd}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-orange-200">
          <TabsTrigger value="orders" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
            Orders Overview
          </TabsTrigger>
          <TabsTrigger value="tables" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
            Table Status
          </TabsTrigger>
          <TabsTrigger
            value="popular"
            className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
          >
            Popular Items
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
          >
            Quick Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Orders */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-orange-600" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.recentOrders.slice(0, 5).map((order: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.orderType} • {format(new Date(order.orderedAt), "HH:mm")}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            order.orderStatus === "New"
                              ? "bg-blue-500 text-white"
                              : order.orderStatus === "In Progress"
                                ? "bg-yellow-500 text-white"
                                : order.orderStatus === "Ready"
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-500 text-white"
                          }
                        >
                          {order.orderStatus}
                        </Badge>
                        <div className="text-sm font-medium mt-1">{formatDualCurrency(order.totalAmount || 0).usd}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 border-orange-200 hover:bg-orange-50 bg-transparent"
                  onClick={() => router.push("/restaurant/orders")}
                >
                  View All Orders
                </Button>
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-orange-600" />
                  Order Types Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.ordersByType.map((type: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{type.type}</span>
                        <span>{type.count} orders</span>
                      </div>
                      <Progress value={type.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                Table Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((tableNum) => {
                  const isOccupied = tableNum <= dashboardData.tablesOccupied
                  const needsCleaning = Math.random() > 0.8
                  const hasReservation = Math.random() > 0.7

                  return (
                    <div
                      key={tableNum}
                      className={`p-4 rounded-lg border-2 text-center cursor-pointer transition-all ${
                        isOccupied
                          ? "bg-red-100 border-red-300 text-red-700"
                          : needsCleaning
                            ? "bg-yellow-100 border-yellow-300 text-yellow-700"
                            : hasReservation
                              ? "bg-blue-100 border-blue-300 text-blue-700"
                              : "bg-green-100 border-green-300 text-green-700"
                      }`}
                    >
                      <div className="font-bold text-lg">T{tableNum}</div>
                      <div className="text-xs mt-1">
                        {isOccupied
                          ? "Occupied"
                          : needsCleaning
                            ? "Cleaning"
                            : hasReservation
                              ? "Reserved"
                              : "Available"}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                  <span>Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
                  <span>Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                  <span>Cleaning</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-orange-600" />
                Popular Items Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.popularItems.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.orders} orders • {formatDualCurrency(item.revenue).usd}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 text-sm ${getGrowthColor(item.growth)}`}>
                        {getGrowthIcon(item.growth)}
                        <span>
                          {item.growth >= 0 ? "+" : ""}
                          {item.growth}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">vs yesterday</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card
              className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => router.push("/restaurant/orders/new")}
            >
              <CardContent className="p-6 text-center">
                <Plus className="h-12 w-12 mx-auto mb-4 text-orange-500" />
                <h3 className="font-semibold mb-2">Create New Order</h3>
                <p className="text-sm text-muted-foreground">Start a new restaurant order</p>
              </CardContent>
            </Card>

            <Card
              className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => router.push("/restaurant/menu")}
            >
              <CardContent className="p-6 text-center">
                <Utensils className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="font-semibold mb-2">Manage Menu</h3>
                <p className="text-sm text-muted-foreground">Update menu items and prices</p>
              </CardContent>
            </Card>

            <Card
              className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => router.push("/restaurant/tables")}
            >
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-semibold mb-2">Table Management</h3>
                <p className="text-sm text-muted-foreground">Manage table reservations</p>
              </CardContent>
            </Card>

            <Card
              className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => router.push("/restaurant/inventory")}
            >
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <h3 className="font-semibold mb-2">Inventory</h3>
                <p className="text-sm text-muted-foreground">Track stock and supplies</p>
              </CardContent>
            </Card>

            <Card
              className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => router.push("/restaurant/analytics")}
            >
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="font-semibold mb-2">Analytics</h3>
                <p className="text-sm text-muted-foreground">View detailed reports</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="font-semibold mb-2">Alerts</h3>
                <p className="text-sm text-muted-foreground">View system notifications</p>
              </CardContent>
            </Card>
          </div>

          {/* Staff Performance */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Staff Performance Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.staffPerformance.map((staff: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-full flex items-center justify-center font-bold">
                        {staff.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="font-semibold">{staff.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {staff.orders} orders • Rating: {staff.rating}/5.0
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{formatDualCurrency(staff.tips).usd}</div>
                      <div className="text-xs text-muted-foreground">Tips earned</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
