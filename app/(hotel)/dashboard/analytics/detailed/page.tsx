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
  Activity,
  AlertTriangle,
  Star,
  Award,
  Target,
  Globe,
} from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

export default function HotelDetailedAnalyticsPage() {
  const { dashboardData, realTimeData, isLoading, error, getDashboardAnalytics, getRealTimeAnalytics } = useAnalytics()

  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>("30")
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    getDashboardAnalytics(selectedPeriod)
    getRealTimeAnalytics()
  }, [getDashboardAnalytics, getRealTimeAnalytics, selectedPeriod])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        getRealTimeAnalytics()
        getDashboardAnalytics(selectedPeriod)
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, getRealTimeAnalytics, getDashboardAnalytics, selectedPeriod])

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

  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading hotel analytics...</p>
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

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotel Analytics</h1>
          <p className="text-muted-foreground">Comprehensive hotel performance and operational insights</p>
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

      {realTimeData && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live Hotel Data</span>
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
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {dashboardData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <CardTitle className="text-sm font-medium text-blue-800">Occupancy Rate</CardTitle>
              <BedDouble className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {formatPercentage(dashboardData.summary.occupancyRate)}
              </div>
              <p className="text-xs text-blue-700 flex items-center mt-1">
                <Target className="mr-1 h-3 w-3" />
                Target: 85%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Guest Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {formatPercentage(dashboardData.summary.guestSatisfaction)}
              </div>
              <p className="text-xs text-purple-700 flex items-center mt-1">
                <Award className="mr-1 h-3 w-3" />
                Excellent rating
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Average Daily Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {formatCurrency(dashboardData.modules.revenue.averageInvoiceValue)}
              </div>
              <p className="text-xs text-orange-700 flex items-center mt-1">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                +5.2% from last period
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics */}
      {dashboardData && (
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="guests">Guests</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Performance
                  </CardTitle>
                  <CardDescription>Daily revenue trends and patterns</CardDescription>
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Booking Performance
                  </CardTitle>
                  <CardDescription>Booking volume and revenue correlation</CardDescription>
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

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Per Room</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      dashboardData.modules.revenue.totalRevenue / dashboardData.modules.rooms.totalRooms,
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Per available room</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Stay Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.modules.bookings.averageStayDuration?.toFixed(1) || 0} days
                  </div>
                  <p className="text-xs text-muted-foreground">Guest stay length</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPercentage(dashboardData.modules.bookings.cancellationRate)}
                  </div>
                  <p className="text-xs text-muted-foreground">Booking cancellations</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BedDouble className="h-5 w-5" />
                    Room Status Overview
                  </CardTitle>
                  <CardDescription>Current room availability and status</CardDescription>
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5" />
                    Restaurant Performance
                  </CardTitle>
                  <CardDescription>Popular menu items and order volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      quantity: {
                        label: "Quantity",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.modules.restaurant.popularItems.slice(0, 6)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="quantity" fill="hsl(var(--chart-1))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.modules.rooms.totalRooms}</div>
                  <p className="text-xs text-muted-foreground">Available inventory</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Restaurant Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.modules.restaurant.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">Total orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Maintenance Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.modules.maintenance.totalIssues}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(dashboardData.modules.maintenance.resolutionRate)} resolved
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.modules.staff.totalStaff}</div>
                  <p className="text-xs text-muted-foreground">{dashboardData.modules.staff.activeStaff} active</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="guests" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Guest Loyalty
                  </CardTitle>
                  <CardDescription>New vs returning guests</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      new: {
                        label: "New Guests",
                        color: "hsl(var(--chart-2))",
                      },
                      repeat: {
                        label: "Returning Guests",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "New Guests", value: dashboardData.modules.guests.repeatGuestData.new },
                            { name: "Returning Guests", value: dashboardData.modules.guests.repeatGuestData.repeat },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="hsl(var(--chart-2))" />
                          <Cell fill="hsl(var(--chart-1))" />
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.modules.guests.totalGuests}</div>
                  <p className="text-xs text-muted-foreground">In selected period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Countries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.modules.guests.uniqueCountries}</div>
                  <p className="text-xs text-muted-foreground">Unique countries</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Age</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(dashboardData.modules.guests.averageAge)}</div>
                  <p className="text-xs text-muted-foreground">Years old</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Loyalty Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.modules.guests.loyaltyRate}%</div>
                  <p className="text-xs text-muted-foreground">Returning guests</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Revenue Breakdown
                  </CardTitle>
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
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Payment Methods
                  </CardTitle>
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

            <div className="grid gap-4 md:grid-cols-4">
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
                  <CardTitle className="text-sm font-medium">Service Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(dashboardData.modules.revenue.serviceRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">Additional services</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(dashboardData.modules.revenue.totalInvoices)}</div>
                  <p className="text-xs text-muted-foreground">Paid invoices</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
