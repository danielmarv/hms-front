"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAnalytics } from "@/hooks/use-analytics"
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface RealTimeMetric {
  id: string
  label: string
  value: string | number
  change?: {
    value: number
    trend: "up" | "down" | "stable"
  }
  status: "good" | "warning" | "critical"
}

export function RealTimeWidget() {
  const { getRealTimeAnalytics, realTimeData, isLoading } = useAnalytics()
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        await getRealTimeAnalytics()
        setLastUpdate(new Date())
      } catch (error) {
        console.error("Error fetching real-time data:", error)
      }
    }

    // Initial fetch
    fetchRealTimeData()

    // Set up interval for real-time updates
    const interval = setInterval(fetchRealTimeData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [getRealTimeAnalytics])

  useEffect(() => {
    if (realTimeData) {
      const newMetrics: RealTimeMetric[] = [
        {
          id: "bookings",
          label: "Today's Bookings",
          value: realTimeData.realTime.todayBookings,
          change: { value: 5, trend: "up" },
          status: "good",
        },
        {
          id: "guests",
          label: "Active Guests",
          value: realTimeData.realTime.activeGuests,
          change: { value: 2, trend: "up" },
          status: "good",
        },
        {
          id: "orders",
          label: "Pending Orders",
          value: realTimeData.realTime.pendingOrders,
          change: { value: 1, trend: "down" },
          status: realTimeData.realTime.pendingOrders > 10 ? "warning" : "good",
        },
        {
          id: "maintenance",
          label: "Maintenance Issues",
          value: realTimeData.realTime.maintenanceIssues,
          change: { value: 0, trend: "stable" },
          status: realTimeData.realTime.maintenanceIssues > 5 ? "critical" : "good",
        },
      ]
      setMetrics(newMetrics)
    }
  }, [realTimeData])

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-600" />
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-600" />
      case "stable":
        return <Minus className="h-3 w-3 text-gray-600" />
    }
  }

  const getStatusColor = (status: "good" | "warning" | "critical") => {
    switch (status) {
      case "good":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "critical":
        return "text-red-600"
    }
  }

  const getStatusBadge = (status: "good" | "warning" | "critical") => {
    switch (status) {
      case "good":
        return <Badge className="bg-green-100 text-green-800">Good</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-6 w-[60px]" />
                <Skeleton className="h-3 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Real-Time Metrics
        </CardTitle>
        <CardDescription>Live data updates • Last updated: {lastUpdate.toLocaleTimeString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {metrics.map((metric) => (
            <div key={metric.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{metric.label}</span>
                {getStatusBadge(metric.status)}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>{metric.value}</span>
                {metric.change && (
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.change.trend)}
                    <span className="text-xs text-muted-foreground">
                      {metric.change.value > 0 && "+"}
                      {metric.change.value}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
