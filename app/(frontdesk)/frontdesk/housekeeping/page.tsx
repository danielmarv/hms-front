"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Play,
  Check,
  Edit,
  Trash2,
} from "lucide-react"
import { useHousekeeping } from "@/hooks/use-housekeeping"
import { useRooms } from "@/hooks/use-rooms"
import { useUsers } from "@/hooks/use-users"
import { format } from "date-fns"

type HousekeepingStatus = "pending" | "in_progress" | "completed" | "cleaning"

export default function HousekeepingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRoom, setSelectedRoom] = useState("all")
  const [selectedStaff, setSelectedStaff] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const { schedules, stats, fetchSchedules, updateSchedule, deleteSchedule, fetchStats, isLoading } = useHousekeeping()
  const { rooms, fetchRooms } = useRooms()
  const { users: staff, fetchUsers } = useUsers()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    await Promise.all([
      fetchSchedules(),
      fetchRooms({ limit: 200 }),
      fetchUsers(),
      fetchStats(),
    ])
  }

  const handleRefresh = () => {
    loadData()
    toast.success("Data refreshed")
  }

  const handleStatusUpdate = async (scheduleId: string, newStatus: string) => {
    const result = await updateSchedule(scheduleId, { status: newStatus as HousekeepingStatus })
    if (result && !result.error) {
      toast.success(result.data?.message || `Schedule ${newStatus}`)
      loadData()
    } else {
      toast.error(result.error || "Failed to update schedule")
    }
  }

  const handleDelete = async (scheduleId: string) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      const result = await deleteSchedule(scheduleId)
      if (result.success) {
        toast.success(result.message || "Schedule deleted")
        loadData()
      } else {
        toast.error(result.message || "Failed to delete schedule")
      }
    }
  }

  const getStatusBadge = (status: string) => {
    if (!status) return null

    const variants = {
      pending: "secondary",
      in_progress: "default",
      completed: "default",
    } as const

    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
    }

    return (
      <Badge
        variant={variants[status as keyof typeof variants] || "secondary"}
        className={colors[status as keyof typeof colors]}
      >
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string | undefined) => {
    if (!priority) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">
          MEDIUM
        </Badge>
      )
    }

    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-orange-100 text-orange-800",
      low: "bg-green-100 text-green-800",
    }

    return (
      <Badge variant="outline" className={colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {priority.toUpperCase()}
      </Badge>
    )
  }

  const normalizeStatus = (status: string) => {
    if (status === "cleaning") return "in_progress"
    return status
  }

  const filteredSchedules = schedules.filter((schedule) => {
    const scheduleStatus = normalizeStatus(schedule.status)
    const matchesSearch =
      schedule.room?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.assigned_to?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.assigned_to?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRoom = selectedRoom === "all" || schedule.room?._id === selectedRoom
    const matchesStaff = selectedStaff === "all" || schedule.assigned_to?._id === selectedStaff
    const matchesStatus = selectedStatus === "all" || scheduleStatus === selectedStatus
    const matchesDate = !selectedDate || format(new Date(schedule.schedule_date), "yyyy-MM-dd") === selectedDate
    const matchesTab = activeTab === "all" || scheduleStatus === activeTab

    return matchesSearch && matchesRoom && matchesStaff && matchesStatus && matchesDate && matchesTab
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Housekeeping</h1>
          <p className="text-muted-foreground">Manage room cleaning schedules and assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/frontdesk/housekeeping/new">
              <Plus className="mr-2 h-4 w-4" />
              New Schedule
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || schedules.length}</div>
            <p className="text-xs text-muted-foreground">All time schedules</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pending || schedules.filter((s) => s.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting cleaning</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.in_progress ||
                schedules.filter((s) => s.status === "in_progress" || s.status === "cleaning").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently cleaning</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.today?.total ||
                schedules.filter((s) => {
                  const today = new Date().toISOString().split("T")[0]
                  const scheduleDate = new Date(s.schedule_date).toISOString().split("T")[0]
                  return scheduleDate === today
                }).length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms or staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger>
                <SelectValue placeholder="All rooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All rooms</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room._id} value={room._id}>
                    Room {room.id || room.name || room.roomNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="All staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All staff</SelectItem>
                {staff.map((member) => (
                  <SelectItem key={member._id} value={member._id}>
                    {member.name || member.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="Filter by date"
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cleaning Schedules</CardTitle>
          <CardDescription>Manage and track room cleaning schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({schedules.length})</TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({schedules.filter((s) => s.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="in_progress">
                In Progress ({schedules.filter((s) => s.status === "in_progress" || s.status === "cleaning").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({schedules.filter((s) => s.status === "completed").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {filteredSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No schedules found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "all"
                      ? "No housekeeping schedules have been created yet."
                      : `No ${activeTab.replace("_", " ")} schedules found.`}
                  </p>
                  <Button asChild>
                    <Link href="/frontdesk/housekeeping/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Schedule
                    </Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchedules.map((schedule) => (
                      <TableRow key={schedule._id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>Room { schedule.room?.roomNumber || "N/A"}</p>
                            <p className="text-xs text-muted-foreground">
                              Floor {schedule.room?.floor || "1"} • {schedule.room?.roomType?.name || "Standard"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(schedule.schedule_date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          {schedule.assigned_to ? (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {schedule.assigned_to.name || schedule.assigned_to.full_name}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>{getPriorityBadge(schedule.priority)}</TableCell>
                        <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                        <TableCell>
                          <div className="max-w-32 truncate" title={schedule.notes || ""}>
                            {schedule.notes || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {schedule.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleStatusUpdate(schedule._id, "in_progress")}>
                                  <Play className="mr-2 h-4 w-4" />
                                  Start Cleaning
                                </DropdownMenuItem>
                              )}
                              {(schedule.status === "in_progress" || schedule.status === "cleaning") && (
                                <DropdownMenuItem onClick={() => handleStatusUpdate(schedule._id, "completed")}>
                                  <Check className="mr-2 h-4 w-4" />
                                  Mark Complete
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem asChild>
                                <Link href={`/frontdesk/housekeeping/${schedule._id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(schedule._id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
