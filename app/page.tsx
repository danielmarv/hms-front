"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import { useAnalytics } from "@/hooks/use-analytics"
import { useRooms } from "@/hooks/use-rooms"
import { useGuests } from "@/hooks/use-guests"
import { useMaintenanceRequests } from "@/hooks/use-maintenance"
import {
  Users,
  BedDouble,
  CreditCard,
  Calendar,
  ChefHat,
  Settings,
  TrendingUp,
  AlertTriangle,
  Clock,
  UserCheck,
  Wrench,
  UtensilsCrossed,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CustomizationPanel } from "@/components/dashboard/customization-panel"
import { NotificationCenter } from "@/components/dashboard/notification-center"
import { CalendarWidget } from "@/components/dashboard/calendar-widget"
import { WeatherWidget } from "@/components/dashboard/weather-widget"
import { RealTimeWidget } from "@/components/dashboard/real-time-widget"
import { MobileNavigation } from "@/components/dashboard/mobile-navigation"

interface DepartmentCard {
  id: string
  title: string
  description: string
  icon: React.ElementType
  href: string
  color: string
  stats?: {
    primary: string | number
    secondary?: string
    trend?: {
      value: number
      isPositive: boolean
    }
  }
}

interface KPICard {
  id: string
  title: string
  value: string | number
  change?: {
    value: number
    isPositive: boolean
    period: string
  }
  icon: React.ElementType
  color: string
  description?: string
}

export default function HomePage() {
  const { user } = useAuth()
  const { getDashboardAnalytics, dashboardData, isLoading: analyticsLoading } = useAnalytics()
  const { fetchRoomStats, roomStats, isLoading: roomsLoading } = useRooms()
  const { getGuestStatistics, guestStats, isLoading: guestsLoading } = useGuests()
  const { getMaintenanceRequests, isLoading: maintenanceLoading } = useMaintenanceRequests()

  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [maintenanceCount, setMaintenanceCount] = useState(0)
  const [customLayout, setCustomLayout] = useState<string[]>(["overview", "departments", "activity", "quick-actions"])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        getDashboardAnalytics("30"),
        fetchRoomStats(),
        getGuestStatistics(),
        loadMaintenanceData(),
        loadRecentActivity(),
      ])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    }
  }

  const loadMaintenanceData = async () => {
    try {
      const response = await getMaintenanceRequests({ status: "pending", limit: 5 })
      if ("data" in response && Array.isArray(response.data)) {
        setMaintenanceCount(response.data.length)
      }
    } catch (error) {
      console.error("Error loading maintenance data:", error)
    }
  }

  const loadRecentActivity = async () => {
    // Simulate recent activity - in real app, this would come from activity logs API
    setRecentActivity([
      {
        id: 1,
        type: "checkin",
        description: "Guest checked in to Room 301",
        time: "2 minutes ago",
        user: "Front Desk",
      },
      {
        id: 2,
        type: "maintenance",
        description: "Maintenance request for Room 205",
        time: "15 minutes ago",
        user: "Housekeeping",
      },
      {
        id: 3,
        type: "booking",
        description: "New reservation for next week",
        time: "1 hour ago",
        user: "Reservations",
      },
      {
        id: 4,
        type: "payment",
        description: "Payment processed for Room 412",
        time: "2 hours ago",
        user: "Finance",
      },
    ])
  }

  const isLoading = analyticsLoading || roomsLoading || guestsLoading || maintenanceLoading

  // Calculate KPIs
  const occupancyRate = roomStats ? Math.round(((roomStats.total - roomStats.available) / roomStats.total) * 100) : 0
  const totalRevenue = dashboardData?.summary?.totalRevenue || 0
  const totalGuests = guestStats?.totalGuests || 0
  const pendingIssues = maintenanceCount

  const kpiCards: KPICard[] = [
    {
      id: "occupancy",
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      change: {
        value: 5.2,
        isPositive: true,
        period: "vs last month",
      },
      icon: BedDouble,
      color: "text-blue-600",
      description: `${roomStats?.available || 0} rooms available`,
    },
    {
      id: "revenue",
      title: "Monthly Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      change: {
        value: 12.5,
        isPositive: true,
        period: "vs last month",
      },
      icon: CreditCard,
      color: "text-green-600",
      description: "Total revenue this month",
    },
    {
      id: "guests",
      title: "Active Guests",
      value: totalGuests,
      change: {
        value: 8.1,
        isPositive: true,
        period: "vs last week",
      },
      icon: Users,
      color: "text-purple-600",
      description: `${guestStats?.vipGuests || 0} VIP guests`,
    },
    {
      id: "issues",
      title: "Pending Issues",
      value: pendingIssues,
      change: {
        value: 15.3,
        isPositive: false,
        period: "vs last week",
      },
      icon: AlertTriangle,
      color: "text-orange-600",
      description: "Maintenance requests",
    },
  ]

  const departmentCards: DepartmentCard[] = [
    {
      id: "frontdesk",
      title: "Front Desk",
      description: "Check-ins, check-outs, and guest services",
      icon: UserCheck,
      href: "/frontdesk",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      stats: {
        primary: `${occupancyRate}% occupied`,
        secondary: `${roomStats?.available || 0} available rooms`,
        trend: { value: 5.2, isPositive: true },
      },
    },
    {
      id: "housekeeping",
      title: "Housekeeping",
      description: "Room cleaning and maintenance schedules",
      icon: Wrench,
      href: "/dashboard/housekeeping",
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      stats: {
        primary: `${roomStats?.cleaning || 0} rooms cleaning`,
        secondary: "12 tasks completed today",
        trend: { value: 3.1, isPositive: true },
      },
    },
    {
      id: "reservations",
      title: "Reservations",
      description: "Booking management and availability",
      icon: Calendar,
      href: "/dashboard/bookings",
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      stats: {
        primary: `${dashboardData?.summary?.totalBookings || 0} bookings`,
        secondary: "15 arriving today",
        trend: { value: 8.7, isPositive: true },
      },
    },
    {
      id: "restaurant",
      title: "Restaurant",
      description: "Kitchen orders and dining services",
      icon: UtensilsCrossed,
      href: "/restaurant",
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
      stats: {
        primary: "24 active orders",
        secondary: "Average 15min prep time",
        trend: { value: 2.3, isPositive: false },
      },
    },
    {
      id: "finance",
      title: "Finance",
      description: "Payments, invoicing, and financial reports",
      icon: CreditCard,
      href: "/dashboard/payments",
      color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
      stats: {
        primary: `$${totalRevenue.toLocaleString()}`,
        secondary: "Monthly revenue",
        trend: { value: 12.5, isPositive: true },
      },
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "Performance metrics and insights",
      icon: BarChart3,
      href: "/dashboard/analytics",
      color: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
      stats: {
        primary: "95% satisfaction",
        secondary: "Guest satisfaction rate",
        trend: { value: 1.2, isPositive: true },
      },
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "checkin":
        return <UserCheck className="h-4 w-4 text-green-600" />
      case "maintenance":
        return <Wrench className="h-4 w-4 text-orange-600" />
      case "booking":
        return <Calendar className="h-4 w-4 text-blue-600" />
      case "payment":
        return <CreditCard className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/40 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[400px]" />
            <Skeleton className="h-4 w-[600px]" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-[100px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[80px]" />
                  <Skeleton className="h-3 w-[120px] mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hotel Management Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.full_name || "User"}. Here's your hotel overview for today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MobileNavigation />
            <NotificationCenter />
            <CustomizationPanel
              onSave={(config) => {
                console.log("Dashboard configuration saved:", config)
                // Here you would save the configuration to localStorage or API
              }}
            />
            <Button asChild className="hidden md:flex">
              <Link href="/admin">
                <Settings className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Overview */}
        {customLayout.includes("overview") && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Key Performance Indicators</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {kpiCards.map((kpi) => (
                <Card key={kpi.id} className="relative overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                    <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    {kpi.change && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        {kpi.change.isPositive ? (
                          <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                        ) : (
                          <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                        )}
                        <span className={kpi.change.isPositive ? "text-green-600" : "text-red-600"}>
                          {kpi.change.value}%
                        </span>
                        <span className="ml-1">{kpi.change.period}</span>
                      </div>
                    )}
                    {kpi.description && <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Department Dashboards */}
        {customLayout.includes("departments") && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Department Dashboards</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {departmentCards.map((dept) => (
                <Link href={dept.href} passHref legacyBehavior>
                  <Card key={dept.id} className={cn("transition-colors cursor-pointer", dept.color)}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center space-x-2">
                        <dept.icon className="h-5 w-5" />
                        <CardTitle className="text-base">{dept.title}</CardTitle>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-3">{dept.description}</CardDescription>
                      {dept.stats && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{dept.stats.primary}</span>
                            {dept.stats.trend && (
                              <Badge
                                variant={dept.stats.trend.isPositive ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {dept.stats.trend.isPositive ? "+" : "-"}
                                {dept.stats.trend.value}%
                              </Badge>
                            )}
                          </div>
                          {dept.stats.secondary && (
                            <p className="text-xs text-muted-foreground">{dept.stats.secondary}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          {customLayout.includes("activity") && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates across all departments</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <span>{activity.user}</span>
                            <span className="mx-1">•</span>
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Calendar Widget */}
          <CalendarWidget />

          {/* Quick Actions */}
          {customLayout.includes("quick-actions") && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used functions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/frontdesk/checkin">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Quick Check-in
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/bookings/new">
                    <Calendar className="mr-2 h-4 w-4" />
                    New Reservation
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/housekeeping/new">
                    <Wrench className="mr-2 h-4 w-4" />
                    Schedule Cleaning
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/payments/new">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Process Payment
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/restaurant">
                    <ChefHat className="mr-2 h-4 w-4" />
                    Kitchen Orders
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/dashboard/analytics">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Reports
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Additional Widgets Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <RealTimeWidget />
          <WeatherWidget />

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system health and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">All Systems Operational</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Database Connected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Payment Gateway Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Backup In Progress</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
