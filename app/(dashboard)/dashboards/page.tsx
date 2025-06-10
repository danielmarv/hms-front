"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { useHotels, type DashboardStats } from "@/hooks/use-hotels"
import { Building, Hotel, Settings, Users } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const { getDashboardStats, isLoading } = useHotels()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const { data } = await getDashboardStats()
      if (data) {
        setStats(data)
      }
    }

    fetchDashboardStats()
  }, [getDashboardStats])

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.full_name || "User"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/hotels/new">
              <Hotel className="mr-2 h-4 w-4" />
              Add Hotel
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Hotels"
          value={stats?.totalHotels}
          description="Total hotels in the system"
          icon={<Building className="h-5 w-5" />}
          href="/hotels"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Hotels"
          value={stats?.activeHotels}
          description="Hotels currently active"
          icon={<Hotel className="h-5 w-5" />}
          href="/hotels?active=true"
          isLoading={isLoading}
        />
        <StatsCard
          title="Pending Setup"
          value={stats?.pendingSetup}
          description="Hotels with incomplete setup"
          icon={<Settings className="h-5 w-5" />}
          href="/hotels?setup=pending"
          isLoading={isLoading}
        />
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers}
          description="Users with system access"
          icon={<Users className="h-5 w-5" />}
          href="/users"
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and actions</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" asChild className="justify-start">
              <Link href="/hotels/new">
                <Hotel className="mr-2 h-4 w-4" />
                Add New Hotel
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/users/new">
                <Users className="mr-2 h-4 w-4" />
                Add New User
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/roles/new">
                <Settings className="mr-2 h-4 w-4" />
                Create New Role
              </Link>
            </Button>
          </CardContent>
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
          <Link href={href}>View all</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
