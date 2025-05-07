"use client"

import { useState, useEffect } from "react"
import { useKitchenOrders } from "@/hooks/use-kitchen-orders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, ChefHat, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"

export function KitchenStats() {
  const { getKitchenStats } = useKitchenOrders()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        // Get today's stats
        const today = format(new Date(), "yyyy-MM-dd")
        const result = await getKitchenStats(today, today)
        setStats(result)
      } catch (error) {
        console.error("Error fetching kitchen stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kitchen Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Today's Orders</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
                <div className="text-2xl font-bold">{stats?.totals?.totalOrders || 0}</div>
                <div className="text-xs text-muted-foreground">Total Orders</div>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-md">
                <div className="text-2xl font-bold">{stats?.totals?.completedOrders || 0}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-2">Order Status</h3>
            <div className="space-y-2">
              {stats?.byStatus?.map((status: any) => (
                <div key={status._id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {status._id === "Pending" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    {status._id === "Cooking" && <ChefHat className="h-4 w-4 text-blue-500" />}
                    {status._id === "Ready" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {status._id === "Completed" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {status._id === "Cancelled" && <XCircle className="h-4 w-4 text-red-500" />}
                    <span>{status._id}</span>
                  </div>
                  <Badge variant="outline">{status.count}</Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-2">Preparation Time</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Average</span>
                </div>
                <span className="font-medium">{stats?.preparationTime?.avgPreparationTime?.toFixed(0) || 0} min</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>Fastest</span>
                </div>
                <span className="font-medium">{stats?.preparationTime?.minPreparationTime?.toFixed(0) || 0} min</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-red-500" />
                  <span>Slowest</span>
                </div>
                <span className="font-medium">{stats?.preparationTime?.maxPreparationTime?.toFixed(0) || 0} min</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
