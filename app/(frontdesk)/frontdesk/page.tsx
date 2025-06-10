"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Calendar, CreditCard, Key, UserCheck, UserX, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { workflowCoordinator } from "@/lib/workflow-coordinator"
import { useRooms } from "@/hooks/use-rooms"
import { useGuests } from "@/hooks/use-guests"
import { useMaintenanceRequests } from "@/hooks/use-maintenance"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface ActivityItem {
  id: number
  type: string
  guest?: string
  room?: string
  time: string
  status: string
  description?: string
}

interface TaskItem {
  id: string
  title: string
  priority: string
  time: string
}

interface ArrivalItem {
  id: string
  guest: string
  room: string
  time: string
  status: string
  vip: boolean
}

export default function FrontDeskDashboard() {
  const { fetchRooms, fetchRoomStats, roomStats, isLoading: roomsLoading } = useRooms()
  const { getGuests, getGuestStatistics, guestStats, isLoading: guestsLoading } = useGuests()
  const { getMaintenanceRequests, isLoading: maintenanceLoading } = useMaintenanceRequests()

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [pendingTasks, setPendingTasks] = useState<TaskItem[]>([])
  const [upcomingArrivals, setUpcomingArrivals] = useState<ArrivalItem[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load room statistics
      await fetchRoomStats()

      // Load guest statistics
      await getGuestStatistics()

      // Load recent guests for upcoming arrivals
      const guestsResponse = await getGuests({ limit: 10, sort: "-createdAt" })
      if (guestsResponse.data && Array.isArray(guestsResponse.data)) {
        setUpcomingArrivals(
          guestsResponse.data.slice(0, 5).map((guest: any) => ({
            id: guest._id,
            guest: guest.full_name,
            room: "TBD", // Would come from booking data
            time: new Date().toLocaleTimeString(),
            status: "confirmed",
            vip: guest.vip || false,
          })),
        )
      }

      // Load maintenance requests
      const maintenanceResponse = await getMaintenanceRequests({ status: "pending", limit: 5 })
      if ("data" in maintenanceResponse && Array.isArray(maintenanceResponse.data)) {
        setMaintenanceRequests(maintenanceResponse.data)
        setPendingTasks(
          maintenanceResponse.data.map((req: any) => ({
            id: req._id,
            title: `${req.type} - Room ${req.room?.number || "N/A"}`,
            priority: req.priority,
            time: new Date(req.createdAt).toLocaleString(),
          })),
        )
      }

      // Simulate recent activity (in real app, this would come from activity logs)
      setRecentActivity([
        {
          id: 1,
          type: "checkin",
          guest: "Recent Check-in",
          room: "301",
          time: new Date().toLocaleTimeString(),
          status: "completed",
        },
        {
          id: 2,
          type: "maintenance",
          description: "Maintenance Request",
          room: "412",
          time: new Date().toLocaleTimeString(),
          status: "pending",
        },
      ])
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast.error("Failed to load dashboard data")
    }
  }

  useEffect(() => {
    // Listen for workflow events
    const handleWorkflowEvent = (event: any) => {
      console.log("Front desk received workflow event:", event)
      // Refresh data when workflows complete
      loadDashboardData()
    }

    workflowCoordinator.addEventListener("*", handleWorkflowEvent)

    return () => {
      workflowCoordinator.removeEventListener("*", handleWorkflowEvent)
    }
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "checkin":
        return <UserCheck className="h-4 w-4 text-green-600" />
      case "checkout":
        return <UserX className="h-4 w-4 text-blue-600" />
      case "maintenance":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "payment":
        return <CreditCard className="h-4 w-4 text-purple-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50"
      case "low":
        return "border-l-green-500 bg-green-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const isLoading = roomsLoading || guestsLoading || maintenanceLoading

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[500px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="h-3 w-[120px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const occupancyRate = roomStats ? Math.round(((roomStats.total - roomStats.available) / roomStats.total) * 100) : 0
  const availableRooms = roomStats?.available || 0
  const totalRooms = roomStats?.total || 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Front Desk Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening at your hotel today.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/frontdesk/checkin">
              <UserCheck className="mr-2 h-4 w-4" />
              Quick Check-in
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/frontdesk/checkout">
              <UserX className="mr-2 h-4 w-4" />
              Quick Check-out
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">{availableRooms} rooms available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guestStats?.totalGuests || 0}</div>
            <p className="text-xs text-muted-foreground">{guestStats?.vipGuests || 0} VIP guests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Room Status</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomStats?.occupied || 0}</div>
            <p className="text-xs text-muted-foreground">
              {roomStats?.cleaning || 0} cleaning, {roomStats?.maintenance || 0} maintenance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceRequests.length}</div>
            <p className="text-xs text-muted-foreground">Maintenance requests pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest check-ins, check-outs, and other activities</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between space-x-4">
                      <div className="flex items-center space-x-3">
                        {getActivityIcon(activity.type)}
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {activity.type === "checkin" && `Check-in: ${activity.guest}`}
                            {activity.type === "checkout" && `Check-out: ${activity.guest}`}
                            {activity.type === "maintenance" && activity.description}
                            {activity.type === "payment" && `Payment: ${activity.guest}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.room && `Room ${activity.room} • `}
                            {activity.time}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(activity.status)}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks</CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {pendingTasks.length > 0 ? (
                  pendingTasks.map((task) => (
                    <div key={task.id} className={`p-3 rounded-lg border-l-4 ${getPriorityColor(task.priority)}`}>
                      <p className="text-sm font-medium">{task.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">{task.time}</p>
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No pending tasks</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Upcoming Arrivals */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Guests</CardTitle>
            <CardDescription>Recently registered guests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingArrivals.length > 0 ? (
                upcomingArrivals.map((arrival) => (
                  <div key={arrival.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {arrival.guest
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{arrival.guest}</p>
                          {arrival.vip && <Badge className="bg-purple-100 text-purple-800">VIP</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {arrival.room} • {arrival.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(arrival.status)}
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/frontdesk/guests/${arrival.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent guests</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/frontdesk/reservations/new">
                <Calendar className="h-6 w-6" />
                New Reservation
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/frontdesk/guests/new">
                <Users className="h-6 w-6" />
                Register Guest
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/frontdesk/payments/new">
                <CreditCard className="h-6 w-6" />
                Process Payment
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link href="/frontdesk/rooms">
                <Key className="h-6 w-6" />
                Room Status
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
