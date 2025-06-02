"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useKitchenOrders } from "@/hooks/use-kitchen-orders"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, ChefHat, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { KitchenOrder } from "@/types"

export function KitchenStats() {
  const { getKitchenStats, getKitchenOrders, loading, error } = useKitchenOrders()
  const [stats, setStats] = useState<any>(null)
  const [liveStats, setLiveStats] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    initializeStats()
  }, [])

  const initializeStats = async () => {
    setFetchError(null)
    try {
      await Promise.all([fetchStats(), fetchLiveStats()])
      setIsInitialized(true)
    } catch (error) {
      console.error("Error initializing stats:", error)
      setFetchError("Failed to load kitchen statistics")
      // Set fallback data so component doesn't stay in loading state
      setLiveStats({
        pending: 0,
        ready: 0,
        completed: 0,
        highPriority: 0,
        avgPrepTime: 0,
        total: 0,
      })
      setIsInitialized(true)
    }
  }

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const result = await getKitchenStats(today, today)
      if (result) {
        setStats(result)
      }
    } catch (error) {
      console.error("Error fetching kitchen stats:", error)
    }
  }

  const fetchLiveStats = async () => {
    try {
      const result = await getKitchenOrders({ limit: 100 })

      // Handle both success and error cases
      let orders: KitchenOrder[] = []

      if (result && result.success && Array.isArray(result.data)) {
        orders = result.data
      } else if (result && Array.isArray(result.data)) {
        orders = result.data
      } else {
        console.warn("No orders data received or invalid format:", result)
        orders = []
      }

      const pending = orders.filter(
        (o: KitchenOrder) => o.status === "New" || o.status === "Preparing" || o.status === "Pending",
      ).length

      const ready = orders.filter((o: KitchenOrder) => o.status === "Ready").length
      const completed = orders.filter((o: KitchenOrder) => o.status === "Completed").length
      const highPriority = orders.filter(
        (o: KitchenOrder) =>
          (o.priority === "High" || o.priority === "Urgent") &&
          (o.status === "New" || o.status === "Preparing" || o.status === "Pending"),
      ).length

      // Calculate average preparation time for completed orders today
      const today = new Date().toISOString().split("T")[0]
      const completedToday = orders.filter(
        (o: KitchenOrder) => o.status === "Completed" && o.completedAt && o.completedAt.startsWith(today),
      )

      let avgPrepTime = 0
      if (completedToday.length > 0) {
        const totalPrepTime = completedToday.reduce((acc: number, order: KitchenOrder) => {
          if (order.startedAt && order.completedAt) {
            const start = new Date(order.startedAt).getTime()
            const end = new Date(order.completedAt).getTime()
            return acc + (end - start)
          }
          return acc
        }, 0)
        avgPrepTime = Math.round(totalPrepTime / completedToday.length / 1000 / 60) // minutes
      }

      const newLiveStats = {
        pending,
        ready,
        completed,
        highPriority,
        avgPrepTime,
        total: orders.length,
      }

      setLiveStats(newLiveStats)
      setLastUpdated(new Date())
      setFetchError(null)
    } catch (error) {
      console.error("Error fetching live stats:", error)
      setFetchError("Failed to fetch live statistics")

      // Don't clear existing data on error, just show error message
      if (!liveStats) {
        setLiveStats({
          pending: 0,
          ready: 0,
          completed: 0,
          highPriority: 0,
          avgPrepTime: 0,
          total: 0,
        })
      }
    }
  }

  const handleRefresh = () => {
    initializeStats()
  }

  // Show loading only if not initialized
  if (!isInitialized || (loading && !liveStats)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Kitchen Statistics</h3>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        {Array(5)
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

  // Show error state if there's an error and no data
  if (fetchError && !liveStats) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{fetchError}. Please check your connection and try again.</AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} variant="outline" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  const completionRate = liveStats.total > 0 ? Math.round((liveStats.completed / liveStats.total) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Kitchen Statistics</h3>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">Updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {fetchError && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{fetchError}. Showing cached data.</AlertDescription>
        </Alert>
      )}

      {/* Pending Orders */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            Pending Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{liveStats.pending}</div>
            {liveStats.highPriority > 0 && (
              <div className="text-sm text-red-600 font-medium">{liveStats.highPriority} urgent</div>
            )}
          </div>
          {liveStats.pending > 0 && liveStats.total > 0 && (
            <Progress value={(liveStats.pending / liveStats.total) * 100} className="mt-2 h-2" />
          )}
        </CardContent>
      </Card>

      {/* Ready Orders */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Ready for Pickup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{liveStats.ready}</div>
          {liveStats.ready > 0 && <div className="text-sm text-green-600 mt-1">Awaiting service</div>}
        </CardContent>
      </Card>

      {/* Average Preparation Time */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Avg. Prep Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {liveStats.avgPrepTime}
              <span className="text-sm ml-1">min</span>
            </div>
            {liveStats.avgPrepTime > 0 && (
              <div className="flex items-center text-sm">
                {liveStats.avgPrepTime <= 15 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-purple-500" />
            Completion Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          {liveStats.total > 0 && <Progress value={completionRate} className="mt-2 h-2" />}
          <div className="text-sm text-muted-foreground mt-1">
            {liveStats.completed} of {liveStats.total} orders
          </div>
        </CardContent>
      </Card>

      {/* Today's Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Today's Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Orders:</span>
              <span className="font-medium">{liveStats.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed:</span>
              <span className="font-medium text-green-600">{liveStats.completed}</span>
            </div>
            <div className="flex justify-between">
              <span>In Progress:</span>
              <span className="font-medium text-yellow-600">{liveStats.pending}</span>
            </div>
            <div className="flex justify-between">
              <span>Ready:</span>
              <span className="font-medium text-blue-600">{liveStats.ready}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {liveStats.total === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders found for today.</p>
              <p className="text-sm">Orders will appear here when created by the restaurant.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
