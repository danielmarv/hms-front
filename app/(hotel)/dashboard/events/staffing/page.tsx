"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Plus,
  Search,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react"
import Link from "next/link"
import { useEventStaffing } from "@/hooks/use-event-staffing"
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import { format } from "date-fns"

export default function EventStaffingPage() {
  const { hotel } = useCurrentHotel()
  const { staffing, loading, error, fetchStaffing, checkInStaff, checkOutStaff, deleteStaffing, getStaffingConflicts } =
    useEventStaffing(hotel?._id)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [conflicts, setConflicts] = useState([])
  const [activeTab, setActiveTab] = useState("all")

  // Fetch conflicts on component mount
  useEffect(() => {
    const loadConflicts = async () => {
      try {
        const conflictData = await getStaffingConflicts()
        setConflicts(conflictData)
      } catch (error) {
        console.error("Failed to load conflicts:", error)
      }
    }

    if (hotel?._id) {
      loadConflicts()
    }
  }, [hotel?._id, getStaffingConflicts])

  // Filter staffing assignments
  const filteredStaffing = staffing.filter((assignment) => {
    const matchesSearch =
      (typeof assignment.staff === "object" &&
        `${assignment.staff.firstName} ${assignment.staff.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (typeof assignment.event === "object" &&
        assignment.event.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      assignment.role.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter
    const matchesRole = roleFilter === "all" || assignment.role === roleFilter

    let matchesDate = true
    if (dateFilter === "today") {
      const today = new Date()
      matchesDate = format(assignment.date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
    } else if (dateFilter === "week") {
      const weekFromNow = new Date()
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      matchesDate = assignment.date >= new Date() && assignment.date <= weekFromNow
    }

    return matchesSearch && matchesStatus && matchesRole && matchesDate
  })

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: { variant: "outline" as const, className: "bg-blue-50 text-blue-700 border-blue-200" },
      confirmed: { variant: "outline" as const, className: "bg-green-50 text-green-700 border-green-200" },
      "checked-in": { variant: "outline" as const, className: "bg-purple-50 text-purple-700 border-purple-200" },
      completed: { variant: "outline" as const, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      cancelled: { variant: "outline" as const, className: "bg-red-50 text-red-700 border-red-200" },
      "no-show": { variant: "outline" as const, className: "bg-orange-50 text-orange-700 border-orange-200" },
    }

    const config = variants[status as keyof typeof variants] || variants.scheduled
    return <Badge {...config}>{status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}</Badge>
  }

  // Handle check in/out
  const handleCheckIn = async (staffingId: string) => {
    try {
      await checkInStaff(staffingId)
    } catch (error) {
      console.error("Failed to check in staff:", error)
    }
  }

  const handleCheckOut = async (staffingId: string) => {
    try {
      await checkOutStaff(staffingId)
    } catch (error) {
      console.error("Failed to check out staff:", error)
    }
  }

  // Handle delete
  const handleDelete = async (staffingId: string) => {
    if (confirm("Are you sure you want to delete this staffing assignment?")) {
      try {
        await deleteStaffing(staffingId)
      } catch (error) {
        console.error("Failed to delete staffing:", error)
      }
    }
  }

  // Get staff name
  const getStaffName = (staff: any) => {
    if (typeof staff === "object" && staff.firstName && staff.lastName) {
      return `${staff.firstName} ${staff.lastName}`
    }
    return "Unknown Staff"
  }

  // Get event title
  const getEventTitle = (event: any) => {
    if (typeof event === "object" && event.title) {
      return event.title
    }
    return "Unknown Event"
  }

  // Statistics
  const stats = {
    total: staffing.length,
    scheduled: staffing.filter((s) => s.status === "scheduled").length,
    checkedIn: staffing.filter((s) => s.status === "checked-in").length,
    completed: staffing.filter((s) => s.status === "completed").length,
    conflicts: conflicts.length,
  }

  if (loading && staffing.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Event Staffing</h1>
            <p className="text-muted-foreground">Manage event staff assignments and schedules</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Staffing</h1>
          <p className="text-muted-foreground">Manage event staff assignments and schedules</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/events/staffing/conflicts">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Conflicts ({conflicts.length})
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/events/staffing/new">
              <Plus className="mr-2 h-4 w-4" />
              Assign Staff
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.checkedIn}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.conflicts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff, events, or roles..."
                  className="pl-8 w-full md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="checked-in">Checked In</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="server">Server</SelectItem>
                  <SelectItem value="bartender">Bartender</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Staffing Table */}
          <div className="mt-6 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaffing.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No staffing assignments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaffing.map((assignment) => (
                    <TableRow key={assignment._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg?height=32&width=32" />
                            <AvatarFallback>
                              {getStaffName(assignment.staff)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{getStaffName(assignment.staff)}</div>
                            {typeof assignment.staff === "object" && assignment.staff.email && (
                              <div className="text-sm text-muted-foreground">{assignment.staff.email}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{getEventTitle(assignment.event)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{assignment.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{format(assignment.date, "MMM dd, yyyy")}</div>
                          <div className="text-sm text-muted-foreground">
                            {assignment.startTime} - {assignment.endTime}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                      <TableCell>{assignment.hourlyRate ? `$${assignment.hourlyRate}/hr` : "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {assignment.status === "scheduled" || assignment.status === "confirmed" ? (
                            <Button variant="ghost" size="sm" onClick={() => handleCheckIn(assignment._id)}>
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          ) : assignment.status === "checked-in" ? (
                            <Button variant="ghost" size="sm" onClick={() => handleCheckOut(assignment._id)}>
                              <UserX className="h-4 w-4" />
                            </Button>
                          ) : null}
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/events/staffing/${assignment._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/events/staffing/${assignment._id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(assignment._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
