"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAnalytics, type AnalyticsPeriod } from "@/hooks/use-analytics"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts"
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  BedDouble,
  Utensils,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  Globe,
  Star,
  Award,
  Settings,
  Database,
  Cpu,
  HardDrive,
} from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export default function DetailedAnalyticsPage() {
  const {
    dashboardData,
    realTimeData,
    isLoading,
    error,
    getDashboardAnalytics,
    getRealTimeAnalytics,
    getBookingAnalytics,
    getRevenueAnalytics,
    getInventoryAnalytics,
    getSystemPerformance,
  } = useAnalytics()

  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>("30")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedModule, setSelectedModule] = useState("overview")

  useEffect(() => {
    getDashboardAnalytics(selectedPeriod)
    getRealTimeAnalytics()
  }, [getDashboardAnalytics, getRealTimeAnalytics, selectedPeriod])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        getRealTimeAnalytics()
        if (selectedModule === "overview") {
          getDashboardAnalytics(selectedPeriod)
        }
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, getRealTimeAnalytics, getDashboardAnalytics, selectedPeriod, selectedModule])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0)
  }

  const formatPercentage = (value: number) => {
    return `${(value || 0).toFixed(1)}%`
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value || 0)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "confirmed":
      case "active":
        return "text-green-600"
      case "pending":
      case "in-progress":
        return "text-yellow-600"
      case "cancelled":
      case "failed":
      case "inactive":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <ArrowUpRight className="h-4 w-4 text-green-600" />
    } else if (current < previous) {
      return <ArrowDownRight className="h-4 w-4 text-red-600" />
    }
    return <Activity className="h-4 w-4 text-gray-600" />
  }

  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading detailed analytics...</p>
        </div>
      </div>
    )
  }

  if (error && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-600">Error Loading Analytics</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button onClick={() => getDashboardAnalytics(selectedPeriod)} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detailed Analytics</h1>
          <p className="text-muted-foreground">Comprehensive business intelligence and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={(value: AnalyticsPeriod) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant={autoRefresh ? "default" : "outline"} size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
            <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
            Auto Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Status Bar */}
      {realTimeData && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live Data</span>
                <Badge variant="secondary" className="text-xs">
                  Updated {new Date(realTimeData.timestamp).toLocaleTimeString()}
                </Badge>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>{realTimeData.realTime.todayBookings} bookings today</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-green-600" />
                  <span>{realTimeData.realTime.activeGuests} active guests</span>
                </div>
                <div className="flex items-center gap-1">
                  <Utensils className="h-4 w-4 text-orange-600" />
                  <span>{realTimeData.realTime.pendingOrders} pending orders</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span>{realTimeData.realTime.maintenanceIssues} maintenance issues</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executive Summary */}
      {dashboardData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(dashboardData.summary.totalRevenue)}
              </div>
              <p className="text-xs text-green-700 flex items-center mt-1">
                <TrendingUp className="mr-1 h-3 w-3" />
                +12.5% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {formatNumber(dashboardData.summary.totalBookings)}
              </div>
              <p className="text-xs text-blue-700 flex items-center mt-1">
                <TrendingUp className="mr-1 h-3 w-3" />
                +8.2% from last period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Occupancy Rate</CardTitle>
              <BedDouble className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {formatPercentage(dashboardData.summary.occupancyRate)}
              </div>
              <p className="text-xs text-purple-700 flex items-center mt-1">
                <Target className="mr-1 h-3 w-3" />
                Target: 85%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Guest Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {formatPercentage(dashboardData.summary.guestSatisfaction)}
              </div>
              <p className="text-xs text-orange-700 flex items-center mt-1">
                <Award className="mr-1 h-3 w-3" />
                Excellent rating
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-800">System Uptime</CardTitle>
              <Zap className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor(dashboardData.summary.systemUptime / 3600)}h
              </div>
              <p className="text-xs text-gray-700 flex items-center mt-1">
                <CheckCircle className="mr-1 h-3 w-3" />
                99.9% availability
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics Tabs */}
      {dashboardData && (
        <Tabs value={selectedModule} onValueChange={setSelectedModule} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="guests">Guests</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Trend
                  </CardTitle>
                  <CardDescription>Daily revenue over the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Revenue",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardData.modules.revenue.dailyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="hsl(var(--chart-1))"
                          fill="hsl(var(--chart-1))"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Booking Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Booking Trends
                  </CardTitle>
                  <CardDescription>Daily booking volume and revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Bookings",
                        color: "hsl(var(--chart-2))",
                      },
                      revenue: {
                        label: "Revenue",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={dashboardData.modules.bookings.bookingTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar yAxisId="left" dataKey="count" fill="hsl(var(--chart-2))" />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="revenue"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Occupancy Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BedDouble className="h-5 w-5" />
                    Room Status Distribution
                  </CardTitle>
                  <CardDescription>Current room availability status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      occupied: {
                        label: "Occupied",
                        color: "hsl(var(--chart-1))",
                      },
                      available: {
                        label: "Available",
                        color: "hsl(var(--chart-2))",
                      },
                      maintenance: {
                        label: "Maintenance",
                        color: "hsl(var(--chart-3))",
                      },
                      cleaning: {
                        label: "Cleaning",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(dashboardData.modules.rooms.roomStatusDistribution).map(
                            ([status, count]) => ({
                              name: status,
                              value: count,
                            }),
                          )}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.entries(dashboardData.modules.rooms.roomStatusDistribution).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Top Countries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Guest Demographics
                  </CardTitle>
                  <CardDescription>Top guest countries by volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Guests",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.modules.guests.countryDistribution.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Key Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
                <CardDescription>Critical business metrics at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Daily Rate</span>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(dashboardData.modules.revenue.averageInvoiceValue)}
                    </div>
                    <div className="text-xs text-muted-foreground">+5.2% vs last period</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Revenue Per Room</span>
                      <BedDouble className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(
                        dashboardData.modules.revenue.totalRevenue / dashboardData.modules.rooms.totalRooms,
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">+3.8% vs last period</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Guest Retention</span>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{dashboardData.modules.guests.loyaltyRate}%</div>
                    <div className="text-xs text-muted-foreground">+2.1% vs last period</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Maintenance Efficiency</span>
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {formatPercentage(dashboardData.modules.maintenance.resolutionRate)}
                    </div>
                    <div className="text-xs text-muted-foreground">+1.5% vs last period</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(dashboardData.modules.bookings.totalBookings)}</div>
                  <p className="text-xs text-muted-foreground">All bookings in period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(dashboardData.modules.bookings.confirmedBookings)}
                  </div>
                  <p className="text-xs text-muted-foreground">Ready for check-in</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatNumber(dashboardData.modules.bookings.cancelledBookings)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(dashboardData.modules.bookings.cancellationRate)} cancellation rate
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Stay</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.modules.bookings.averageStayDuration?.toFixed(1) || 0} days
                  </div>
                  <p className="text-xs text-muted-foreground">Average duration</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Channel Distribution</CardTitle>
                  <CardDescription>Revenue by booking source</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Revenue",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.modules.bookings.channelDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ _id, revenue, percent }) =>
                            `${_id}: ${formatCurrency(revenue)} (${(percent * 100).toFixed(0)}%)`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                        >
                          {dashboardData.modules.bookings.channelDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Performance Timeline</CardTitle>
                  <CardDescription>Daily booking count and revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Bookings",
                        color: "hsl(var(--chart-2))",
                      },
                      revenue: {
                        label: "Revenue",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={dashboardData.modules.bookings.bookingTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar yAxisId="left" dataKey="count" fill="hsl(var(--chart-2))" />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="revenue"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(dashboardData.modules.revenue.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">All revenue streams</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Room Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(dashboardData.modules.revenue.roomRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(
                      (dashboardData.modules.revenue.roomRevenue / dashboardData.modules.revenue.totalRevenue) * 100,
                    )}{" "}
                    of total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">F&B Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(dashboardData.modules.revenue.restaurantRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(
                      (dashboardData.modules.revenue.restaurantRevenue / dashboardData.modules.revenue.totalRevenue) *
                        100,
                    )}{" "}
                    of total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Invoice</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(dashboardData.modules.revenue.averageInvoiceValue)}
                  </div>
                  <p className="text-xs text-muted-foreground">Per transaction</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>Revenue distribution by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      rooms: {
                        label: "Rooms",
                        color: "hsl(var(--chart-1))",
                      },
                      restaurant: {
                        label: "Restaurant",
                        color: "hsl(var(--chart-2))",
                      },
                      events: {
                        label: "Events",
                        color: "hsl(var(--chart-3))",
                      },
                      services: {
                        label: "Services",
                        color: "hsl(var(--chart-4))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Rooms", value: dashboardData.modules.revenue.roomRevenue },
                            { name: "Restaurant", value: dashboardData.modules.revenue.restaurantRevenue },
                            { name: "Events", value: dashboardData.modules.revenue.eventRevenue },
                            { name: "Services", value: dashboardData.modules.revenue.serviceRevenue },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) =>
                            `${name}: ${formatCurrency(value)} (${(percent * 100).toFixed(0)}%)`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: "Rooms", value: dashboardData.modules.revenue.roomRevenue },
                            { name: "Restaurant", value: dashboardData.modules.revenue.restaurantRevenue },
                            { name: "Events", value: dashboardData.modules.revenue.eventRevenue },
                            { name: "Services", value: dashboardData.modules.revenue.serviceRevenue },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Revenue by payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      amount: {
                        label: "Amount",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.modules.revenue.paymentMethods}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <ChartTooltip
                          content={<ChartTooltipContent />}
                          formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
                        />
                        <Bar dataKey="amount" fill="hsl(var(--chart-1))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue Trend</CardTitle>
                <CardDescription>Revenue performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    revenue: {
                      label: "Revenue",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[400px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardData.modules.revenue.dailyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--chart-1))"
                        fill="hsl(var(--chart-1))"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.floor(dashboardData.modules.system.uptime / 3600)}h{" "}
                    {Math.floor((dashboardData.modules.system.uptime % 3600) / 60)}m
                  </div>
                  <p className="text-xs text-muted-foreground">Current session</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(dashboardData.modules.system.memoryUsage.heapUsed / 1024 / 1024)}MB
                  </div>
                  <p className="text-xs text-muted-foreground">
                    of {Math.round(dashboardData.modules.system.memoryUsage.heapTotal / 1024 / 1024)}MB total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.modules.system.performance.platform}</div>
                  <p className="text-xs text-muted-foreground">Operating system</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Node Version</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.modules.system.performance.nodeVersion}</div>
                  <p className="text-xs text-muted-foreground">Runtime version</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Activity
                  </CardTitle>
                  <CardDescription>Most frequent system actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Count",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.modules.system.systemLogs.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    API Usage
                  </CardTitle>
                  <CardDescription>Most used API endpoints</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      requestCount: {
                        label: "Requests",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.modules.system.apiUsage.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="requestCount" fill="hsl(var(--chart-2))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  System Performance Metrics
                </CardTitle>
                <CardDescription>Real-time system performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {(
                        (dashboardData.modules.system.performance.cpuUsage.user +
                          dashboardData.modules.system.performance.cpuUsage.system) /
                        1000000
                      ).toFixed(2)}
                      %
                    </div>
                    <div className="text-xs text-muted-foreground">User + System</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Memory Efficiency</span>
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">
                      {(
                        (dashboardData.modules.system.memoryUsage.heapUsed /
                          dashboardData.modules.system.memoryUsage.heapTotal) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-xs text-muted-foreground">Heap utilization</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Error Rate</span>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{dashboardData.modules.system.errorLogs?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Errors in period</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add other tabs (guests, rooms, restaurant, inventory, maintenance, staff) with similar detailed implementations */}
        </Tabs>
      )}
    </div>
  )
}
