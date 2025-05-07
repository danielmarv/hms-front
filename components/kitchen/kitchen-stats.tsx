"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useKitchenOrders } from "@/hooks/use-kitchen-orders"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, ChefHat, AlertTriangle, CheckCircle } from "lucide-react"

export function KitchenStats() {
  const { getKitchenStats, loading } = useKitchenOrders()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0]
      const result = await getKitchenStats(today, today)
      if (result) {
        setStats(result)
      }
    } catch (error) {
      console.error("Error fetching kitchen stats:", error)
    }
  }

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  // Calculate pending orders
  const pendingOrders = (stats.byStatus || [])
    .filter((s: any) => s._id === "Pending" || s._id === "In Progress")
    .reduce((acc: number, curr: any) => acc + curr.count, 0)

  // Calculate completion rate
  const completionRate = stats.totals?.totalOrders
    ? Math.round((stats.totals.completedOrders / stats.totals.totalOrders) * 100)
    : 0

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <div className="text-2xl font-bold">{pendingOrders}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Preparation Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <div className="text-2xl font-bold">
              {stats.preparationTime?.avgPreparationTime?.toFixed(0) || 0}
              <span className="text-sm ml-1">min</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div className="text-2xl font-bold">{completionRate}%</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <ChefHat className="h-5 w-5 text-purple-500 mr-2" />
            <div className="text-2xl font-bold">{stats.totals?.totalOrders || 0}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
