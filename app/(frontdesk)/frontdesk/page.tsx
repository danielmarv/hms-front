"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Calendar,
  CreditCard,
  Key,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  Phone,
  MessageSquare,
  ClipboardList,
  TrendingUp,
  DollarSign,
  Bed,
  Utensils,
  Wifi,
  RefreshCw,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import { workflowCoordinator } from "@/lib/workflow-coordinator"
import { useRooms } from "@/hooks/use-rooms"
import { useGuests } from "@/hooks/use-guests"
import { useMaintenanceRequests } from "@/hooks/use-maintenance"
import { useCheckInApi } from "@/hooks/use-checkin-api"
import { usePayments } from "@/hooks/use-payments"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { format } from "date-fns"
import { useDashboardData } from "@/hooks/use-dashboard-data"

export default function FrontDeskDashboard() {
  const { fetchRooms, fetchRoomStats, roomStats, isLoading: roomsLoading } = useRooms()
  const { getGuests, getGuestStatistics, guestStats, isLoading: guestsLoading } = useGuests()
  const { getMaintenanceRequests, isLoading: maintenanceLoading } = useMaintenanceRequests()
  const { getCheckIns, getCurrentOccupancy } = useCheckInApi()
  const { getPaymentStats } = usePayments()
  const { dashboardData, isLoading: dashboardLoading, fetchAllDashboardData } = useDashboardData()

  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([])
  const [occupancyData, setOccupancyData] = useState<any>(null)
  const [paymentStats, setPaymentStats] = useState<any>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Extract data from dashboardData
  const { recentActivity, pendingTasks, todayArrivals, todayDepartures, upcomingReservations, serviceRequests } =
    dashboardData

  useEffect(() => {
    loadDashboardData()
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLastRefresh(new Date())

      // Load room statistics
      await fetchRoomStats()

      // Load guest statistics
      await getGuestStatistics()

      // Load occupancy data
      const occupancy = await getCurrentOccupancy()
      setOccupancyData(occupancy)

      // Load payment statistics
      const payments = await getPaymentStats()
      setPaymentStats(payments)

      // Load maintenance requests
      const maintenanceResponse = await getMaintenanceRequests({ status: "pending", limit: 10 })
      if ("data" in maintenanceResponse && Array.isArray(maintenanceResponse.data)) {
        setMaintenanceRequests(maintenanceResponse.data)
      }

      // Load all dashboard data from backend
      await fetchAllDashboardData()
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast.error("Failed to load dashboard data")
    }
  }

  useEffect(() => {
    // Listen for workflow events
    const handleWorkflowEvent = (event: any) => {
      console.log("Front desk received workflow event:", event)
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
      case "reservation":
        return <Calendar className="h-4 w-4 text-indigo-600" />
      case "service":
        return <Utensils className="h-4 w-4 text-teal-600" />
      case "complaint":
        return <MessageSquare className="h-4 w-4 text-red-600" />
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
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case "checked_in":
        return <Badge className="bg-blue-100 text-blue-800">Checked In</Badge>
      case "checked_out":
        return <Badge className="bg-gray-100 text-gray-800">Checked Out</Badge>
      case "late_checkout":
        return <Badge className="bg-orange-100 text-orange-800">Late Checkout</Badge>
      case "extended":
        return <Badge className="bg-purple-100 text-purple-800">Extended</Badge>
      case "no_show":
        return <Badge className="bg-red-100 text-red-800">No Show</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-600 bg-red-50"
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "maintenance":
        return <AlertTriangle className="h-4 w-4" />
      case "housekeeping":
        return <Bed className="h-4 w-4" />
      case "guest_service":
        return <Users className="h-4 w-4" />
      case "admin":
        return <ClipboardList className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "room_service":
        return <Utensils className="h-4 w-4 text-orange-600" />
      case "housekeeping":
        return <Bed className="h-4 w-4 text-blue-600" />
      case "maintenance":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "concierge":
        return <MapPin className="h-4 w-4 text-purple-600" />
      case "laundry":
        return <Wifi className="h-4 w-4 text-teal-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const isLoading = roomsLoading || guestsLoading || maintenanceLoading || dashboardLoading

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
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening at your hotel today.
            <span className="ml-2 text-xs">Last updated: {format(lastRefresh, "HH:mm:ss")}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
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
            <Progress value={occupancyRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {totalRooms - availableRooms} occupied • {availableRooms} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from yesterday
            </div>
            <p className="text-xs text-muted-foreground mt-1">Room: $8,900 • Services: $3,550</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guestStats?.totalGuests || 156}</div>
            <p className="text-xs text-muted-foreground">
              {guestStats?.vipGuests || 12} VIP • {guestStats?.loyaltyMembers || 89} Loyalty
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingTasks.filter((t) => t.priority === "high" || t.priority === "urgent").length} high priority
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="arrivals">Arrivals</TabsTrigger>
          <TabsTrigger value="departures">Departures</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest check-ins, check-outs, and other activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start justify-between space-x-4 p-3 rounded-lg border"
                      >
                        <div className="flex items-start space-x-3">
                          {getActivityIcon(activity.type)}
                          <div className="space-y-1 flex-1">
                            <p className="text-sm font-medium leading-none">
                              {activity.type === "checkin" && `Check-in: ${activity.guest}`}
                              {activity.type === "checkout" && `Check-out: ${activity.guest}`}
                              {activity.type === "maintenance" && activity.description}
                              {activity.type === "payment" && `Payment: ${activity.guest} - $${activity.amount}`}
                              {activity.type === "service" && `Service: ${activity.description}`}
                              {activity.type === "complaint" && `Complaint: ${activity.description}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.room && `Room ${activity.room} • `}
                              {activity.time}
                              {activity.priority && ` • ${activity.priority} priority`}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(activity.status)}
                          {activity.guestId && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/frontdesk/guests/${activity.guestId}`}>View</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Upcoming Reservations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Reservations
                </CardTitle>
                <CardDescription>Next 3 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {upcomingReservations.map((reservation) => (
                      <div key={reservation.id} className="p-3 rounded-lg border space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{reservation.guest}</p>
                          {getStatusBadge(reservation.status)}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>{reservation.roomType}</p>
                          <p>
                            {format(new Date(reservation.checkIn), "MMM dd")} -{" "}
                            {format(new Date(reservation.checkOut), "MMM dd")}
                          </p>
                          <p className="font-medium">${reservation.totalAmount}</p>
                          <Badge variant="outline" className="text-xs">
                            {reservation.source}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="arrivals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Today's Arrivals ({todayArrivals.length})
              </CardTitle>
              <CardDescription>Expected check-ins for {format(new Date(), "MMMM dd, yyyy")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayArrivals.map((arrival) => (
                  <div key={arrival.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {arrival.guest
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{arrival.guest}</p>
                          {arrival.vip && <Badge className="bg-purple-100 text-purple-800">VIP</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Room {arrival.room} • {arrival.roomType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expected: {arrival.time}
                          {arrival.estimatedArrival && ` • ETA: ${arrival.estimatedArrival}`}
                        </p>
                        {arrival.specialRequests && arrival.specialRequests.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {arrival.specialRequests.map((request, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {request}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(arrival.status)}
                      {arrival.contactNumber && (
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/frontdesk/checkin?guest=${arrival.guestId}`}>
                          {arrival.status === "confirmed" ? "Check In" : "View"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Today's Departures ({todayDepartures.length})
              </CardTitle>
              <CardDescription>Expected check-outs for {format(new Date(), "MMMM dd, yyyy")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayDepartures.map((departure) => (
                  <div key={departure.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {departure.guest
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{departure.guest}</p>
                          {departure.vip && <Badge className="bg-purple-100 text-purple-800">VIP</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Room {departure.room} • Check-out: {departure.checkOutTime}
                        </p>
                        {departure.balanceDue > 0 && (
                          <p className="text-sm font-medium text-red-600">
                            Balance Due: ${departure.balanceDue.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(departure.status)}
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/frontdesk/checkout?guest=${departure.guestId}`}>
                          {departure.status === "scheduled" ? "Check Out" : "View"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Service Requests ({serviceRequests.length})
              </CardTitle>
              <CardDescription>Active guest service requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceRequests.map((service) => (
                  <div key={service.id} className="flex items-start justify-between p-4 rounded-lg border">
                    <div className="flex items-start space-x-3">
                      {getServiceIcon(service.type)}
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          {service.guest} - Room {service.room}
                        </p>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Requested at {service.requestedAt} • {service.priority} priority
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(service.status)}
                      <Button size="sm" variant="outline">
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Pending Tasks ({pendingTasks.length})
              </CardTitle>
              <CardDescription>Items requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div key={task.id} className={`p-4 rounded-lg border-l-4 ${getPriorityColor(task.priority)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getCategoryIcon(task.category)}
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Created: {task.time}</span>
                            {task.assignedTo && <span>• Assigned to: {task.assignedTo}</span>}
                            {task.dueDate && <span>• Due: {format(new Date(task.dueDate), "MMM dd")}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            task.priority === "urgent" || task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {task.priority}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Assign
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
              <Link href="/frontdesk/checkin">
                <UserCheck className="h-6 w-6" />
                Check In
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
              <Link href="/frontdesk/checkout">
                <UserX className="h-6 w-6" />
                Check Out
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
              <Link href="/frontdesk/reservations/new">
                <Calendar className="h-6 w-6" />
                New Reservation
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
              <Link href="/frontdesk/guests/new">
                <Users className="h-6 w-6" />
                Register Guest
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
              <Link href="/frontdesk/payments/new">
                <CreditCard className="h-6 w-6" />
                Process Payment
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" asChild>
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
