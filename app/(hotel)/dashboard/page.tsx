"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { BedDouble, Calendar, CreditCard, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface StatsCardProps {
  title: string
  value?: number
  prefix?: string
  suffix?: string
  description?: string | React.ReactNode
  icon?: React.ReactNode
  href?: string
  isLoading?: boolean
}

function StatsCard({ title, value, prefix, suffix, description, icon, href, isLoading }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <>
              {prefix}
              {value}
              {suffix}
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{isLoading ? <Skeleton className="h-4 w-32" /> : description}</p>
      </CardContent>
      {href ? (
        <CardFooter>
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href={href}>View Details</Link>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}

export default function HotelDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const response = await fetch('/api/hotel/stats')
        // const data = await response.json()

        // For now, we'll use mock data
        setStats({
          occupancy: 78,
          availableRooms: 22,
          totalRooms: 100,
          checkInsToday: 15,
          checkOutsToday: 12,
          pendingReservations: 8,
          revenue: {
            today: 5280,
            yesterday: 4950,
            change: 6.7,
          },
          guests: {
            current: 156,
            yesterday: 145,
            change: 7.6,
          },
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
          <h1 className="text-3xl font-bold tracking-tight">Hotel Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.full_name || "User"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/bookings/new">
              <Calendar className="mr-2 h-4 w-4" />
              New Booking
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Occupancy Rate"
          value={stats?.occupancy}
          suffix="%"
          description={`${stats?.availableRooms || 0} rooms available out of ${stats?.totalRooms || 0}`}
          icon={<BedDouble className="h-5 w-5" />}
          href="/dashboard/rooms"
          isLoading={isLoading}
        />
        <StatsCard
          title="Today's Revenue"
          value={stats?.revenue?.today}
          prefix="$"
          description={
            stats?.revenue?.change > 0 ? (
              <span className="flex items-center text-green-600">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                {stats.revenue.change}% from yesterday
              </span>
            ) : (
              <span className="flex items-center text-red-600">
                <ArrowDownRight className="mr-1 h-3 w-3" />
                {Math.abs(stats?.revenue?.change || 0)}% from yesterday
              </span>
            )
          }
          icon={<CreditCard className="h-5 w-5" />}
          href="/dashboard/payments"
          isLoading={isLoading}
        />
        <StatsCard
          title="Current Guests"
          value={stats?.guests?.current}
          description={
            stats?.guests?.change > 0 ? (
              <span className="flex items-center text-green-600">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                {stats.guests.change}% from yesterday
              </span>
            ) : (
              <span className="flex items-center text-red-600">
                <ArrowDownRight className="mr-1 h-3 w-3" />
                {Math.abs(stats?.guests?.change || 0)}% from yesterday
              </span>
            )
          }
          icon={<Users className="h-5 w-5" />}
          href="/dashboard/guests"
          isLoading={isLoading}
        />
        <StatsCard
          title="Check-ins Today"
          value={stats?.checkInsToday}
          description={`${stats?.checkOutsToday || 0} check-outs scheduled`}
          icon={<Calendar className="h-5 w-5" />}
          href="/dashboard/bookings?filter=today"
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
              <Link href="/dashboard/bookings/new">
                <Calendar className="mr-2 h-4 w-4" />
                New Booking
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/dashboard/guests/new">
                <Users className="mr-2 h-4 w-4" />
                Register Guest
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/dashboard/bookings?filter=checkin">
                <BedDouble className="mr-2 h-4 w-4" />
                Check-in Guest
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/dashboard/bookings?filter=checkout">
                <CreditCard className="mr-2 h-4 w-4" />
                Check-out Guest
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Reservations</CardTitle>
            <CardDescription>Upcoming check-ins requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">John Smith</p>
                    <p className="text-xs text-muted-foreground">Deluxe Room - 3 nights</p>
                  </div>
                  <Badge variant="outline">Arriving Today</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-xs text-muted-foreground">Suite - 2 nights</p>
                  </div>
                  <Badge variant="outline">Arriving Today</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Michael Brown</p>
                    <p className="text-xs text-muted-foreground">Standard Room - 1 night</p>
                  </div>
                  <Badge variant="outline">Tomorrow</Badge>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/dashboard/bookings?filter=pending">View all pending</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Last 7 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <TrendingUp className="h-16 w-16 text-primary/20" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
