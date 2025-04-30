"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { Building, Hotel, Settings, Users, FolderSyncIcon as Sync, AlertTriangle } from "lucide-react"

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const response = await fetch('/api/admin/stats')
        // const data = await response.json()

        // For now, we'll use mock data
        setStats({
          totalHotelChains: 5,
          totalHotels: 42,
          activeHotels: 38,
          totalUsers: 156,
          pendingSetup: 4,
          syncIssues: 2,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.full_name || "Admin"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/chains/new">
              <Building className="mr-2 h-4 w-4" />
              New Hotel Chain
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Hotel Chains"
          value={stats?.totalHotelChains}
          description="Total hotel chains"
          icon={<Building className="h-5 w-5" />}
          href="/admin/chains"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Hotels"
          value={stats?.totalHotels}
          description="Hotels across all chains"
          icon={<Hotel className="h-5 w-5" />}
          href="/admin/hotels"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Hotels"
          value={stats?.activeHotels}
          description="Currently active hotels"
          icon={<Hotel className="h-5 w-5" />}
          href="/admin/hotels?active=true"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers}
          description="Users with system access"
          icon={<Users className="h-5 w-5" />}
          href="/admin/users"
          isLoading={isLoading}
        />
        <StatsCard
          title="Pending Setup"
          value={stats?.pendingSetup}
          description="Hotels with incomplete setup"
          icon={<Settings className="h-5 w-5" />}
          href="/admin/hotels?setup=pending"
          isLoading={isLoading}
        />
        <StatsCard
          title="Sync Issues"
          value={stats?.syncIssues}
          description="Configuration sync issues"
          icon={<AlertTriangle className="h-5 w-5" />}
          href="/admin/sync?status=error"
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" asChild className="justify-start">
              <Link href="/admin/chains/new">
                <Building className="mr-2 h-4 w-4" />
                Create New Hotel Chain
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/admin/hotels/new">
                <Hotel className="mr-2 h-4 w-4" />
                Add New Hotel
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/admin/users/new">
                <Users className="mr-2 h-4 w-4" />
                Add New User
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/admin/sync/new">
                <Sync className="mr-2 h-4 w-4" />
                Run Configuration Sync
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Sync className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Configuration synced</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Hotel className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New hotel added</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/admin/activity">View all activity</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value?: number
  description: string
  icon: React.ReactNode
  href: string
  isLoading: boolean
}

function StatsCard({ title, value, description, icon, href, isLoading }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{value || 0}</div>}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="px-0" asChild>
          <Link href={href}>View details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
