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

export default function FrontDeskDashboard() {
  const [stats, setStats] = useState({
    occupancy: 85,
    availableRooms: 15,
    totalRooms: 100,
    checkInsToday: 12,
    checkOutsToday: 8,
    pendingCheckIns: 5,
    pendingCheckOuts: 3,
    maintenanceRequests: 2,
    guestComplaints: 1,
  })

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: "checkin",
      guest: "John Smith",
      room: "301",
      time: "10:30 AM",
      status: "completed",
    },
    {
      id: 2,
      type: "checkout",
      guest: "Sarah Johnson",
      room: "205",
      time: "11:15 AM",
      status: "pending",
    },
    {
      id: 3,
      type: "maintenance",
      description: "AC not working",
      room: "412",
      time: "09:45 AM",
      status: "in-progress",
    },
    {
      id: 4,
      type: "payment",
      guest: "Michael Brown",
      amount: "$450.00",
      time: "10:00 AM",
      status: "completed",
    },
  ])

  const [pendingTasks, setPendingTasks] = useState([
    {
      id: 1,
      title: "Process late checkout - Room 308",
      priority: "high",
      time: "30 min ago",
    },
    {
      id: 2,
      title: "Verify payment for reservation #12345",
      priority: "medium",
      time: "1 hour ago",
    },
    {
      id: 3,
      title: "Update guest preferences for VIP arrival",
      priority: "low",
      time: "2 hours ago",
    },
  ])

  const [upcomingArrivals, setUpcomingArrivals] = useState([
    {
      id: 1,
      guest: "Emily Davis",
      room: "Suite 501",
      time: "2:00 PM",
      status: "confirmed",
      vip: true,
    },
    {
      id: 2,
      guest: "Robert Wilson",
      room: "310",
      time: "3:30 PM",
      status: "confirmed",
      vip: false,
    },
    {
      id: 3,
      guest: "Lisa Anderson",
      room: "205",
      time: "4:15 PM",
      status: "pending",
      vip: false,
    },
  ])

  useEffect(() => {
    // Listen for workflow events
    const handleWorkflowEvent = (event: any) => {
      console.log("Front desk received workflow event:", event)
      // Update dashboard based on workflow events
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
            <div className="text-2xl font-bold">{stats.occupancy}%</div>
            <p className="text-xs text-muted-foreground">{stats.availableRooms} rooms available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-ins Today</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkInsToday}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingCheckIns} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-outs Today</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkOutsToday}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingCheckOuts} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenanceRequests + stats.guestComplaints}</div>
            <p className="text-xs text-muted-foreground">
              {stats.maintenanceRequests} maintenance, {stats.guestComplaints} complaints
            </p>
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
                {recentActivity.map((activity) => (
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
                          {activity.amount && `${activity.amount} • `}
                          {activity.time}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(activity.status)}
                  </div>
                ))}
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
                {pendingTasks.map((task) => (
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
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Upcoming Arrivals */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Arrivals</CardTitle>
            <CardDescription>Guests expected to arrive today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingArrivals.map((arrival) => (
                <div key={arrival.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {arrival.guest
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{arrival.guest}</p>
                        {arrival.vip && <Badge className="bg-purple-100 text-purple-800">VIP</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {arrival.room} • Expected: {arrival.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(arrival.status)}
                    <Button size="sm" variant="outline">
                      Prepare
                    </Button>
                  </div>
                </div>
              ))}
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
