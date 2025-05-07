"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApi } from "@/hooks/use-api"
import { Loader2, Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

export function KitchenStats() {
  const { request } = useApi()
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const response = await request("/kitchen/orders/stats")
        if (response.data) {
          setStats(response.data.data)
        } else {
          setError(response.error || "Failed to fetch kitchen statistics")
        }
      } catch (error) {
        console.error("Error fetching kitchen stats:", error)
        setError("An error occurred while fetching kitchen statistics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [request])

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Kitchen Statistics</CardTitle>
          <CardDescription>Loading kitchen performance metrics...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Kitchen Statistics</CardTitle>
          <CardDescription>Error loading statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Kitchen Statistics</CardTitle>
        <CardDescription>Overview of kitchen performance</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="status">By Status</TabsTrigger>
            <TabsTrigger value="priority">By Priority</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                title="Total Orders"
                value={stats?.totals?.totalOrders || 0}
                icon={<Clock className="h-4 w-4 text-blue-500" />}
              />
              <StatCard
                title="Completed"
                value={stats?.totals?.completedOrders || 0}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
              />
              <StatCard
                title="Cancelled"
                value={stats?.totals?.cancelledOrders || 0}
                icon={<XCircle className="h-4 w-4 text-red-500" />}
              />
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Preparation Time</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                  title="Average"
                  value={`${Math.round(stats?.preparationTime?.avgPreparationTime || 0)} min`}
                  icon={<Clock className="h-4 w-4 text-blue-500" />}
                />
                <StatCard
                  title="Minimum"
                  value={`${Math.round(stats?.preparationTime?.minPreparationTime || 0)} min`}
                  icon={<Clock className="h-4 w-4 text-green-500" />}
                />
                <StatCard
                  title="Maximum"
                  value={`${Math.round(stats?.preparationTime?.maxPreparationTime || 0)} min`}
                  icon={<Clock className="h-4 w-4 text-amber-500" />}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="status" className="pt-4">
            <div className="space-y-4">
              {stats?.byStatus?.map((item: any) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item._id)}
                    <span>{item._id}</span>
                  </div>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="priority" className="pt-4">
            <div className="space-y-4">
              {stats?.byPriority?.map((item: any) => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(item._id)}
                    <span>{item._id}</span>
                  </div>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}

function getStatusIcon(status: string) {
  switch (status) {
    case "Pending":
      return <Clock className="h-4 w-4 text-yellow-500" />
    case "In Progress":
      return <Loader2 className="h-4 w-4 text-blue-500" />
    case "Ready":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />
    case "Completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "Cancelled":
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

function getPriorityIcon(priority: string) {
  switch (priority) {
    case "High":
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case "Normal":
      return <Clock className="h-4 w-4 text-blue-500" />
    case "Low":
      return <Clock className="h-4 w-4 text-gray-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}
