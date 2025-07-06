"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  RefreshCw,
  Bed,
} from "lucide-react"
import { useHousekeeping } from "@/hooks/use-housekeeping"
import { useRooms } from "@/hooks/use-rooms"
import { useUsers } from "@/hooks/use-users"
import { format } from "date-fns"

export default function FrontDeskHousekeepingPage() {
  const {
    schedules,
    stats,
    pagination,
    isLoading,
    fetchSchedules,
    fetchStats,
    updateSchedule,
    deleteSchedule,
    assignSchedule,
  } = useHousekeeping()

  const { fetchRooms } = useRooms()
  const { getUsers } = useUsers()

  const [filters, setFilters] = useState({
    room: "",
    assigned_to: "",
    status: "",
    date: "",
    search: "",
  })
  const [rooms, setRooms] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    loadData()
    loadRooms()
    loadStaff()
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadSchedules()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [filters, activeTab])

  const loadData = async () => {
    await Promise.all([fetchStats(), loadSchedules()])
  }

  const loadSchedules = async () => {
    const queryFilters = { ...filters }

    // Apply tab-based filtering
    if (activeTab !== "all") {
      queryFilters.status = activeTab
    }

    // Remove empty filters
    Object.keys(queryFilters).forEach((key) => {
      if (!queryFilters[key]) {
        delete queryFilters[key]
      }
    })

    await fetchSchedules(queryFilters)
  }

  const loadRooms = async () => {
    const roomsData = await fetchRooms({ limit: 100 })
    setRooms(Array.isArray(roomsData) ? roomsData : roomsData?.data || [])
  }

  const loadStaff = async () => {
    const staffData = await getUsers({ role: "housekeeping", limit: 100 })
    setStaff(Array.isArray(staffData) ? staffData : staffData?.data || [])
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleStatusUpdate = async (scheduleId: string, newStatus: string) => {
    const result = await updateSchedule(scheduleId, { status: newStatus })
    if (result.data) {
      toast.success("Schedule status updated successfully")
      loadSchedules()
    }
  }

  const handleAssignStaff = async (scheduleId: string, staffId: string) => {
    const result = await assignSchedule(scheduleId, staffId)
    if (result.data) {
      toast.success("Schedule assigned successfully")
      loadSchedules()
    }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    const result = await deleteSchedule(scheduleId)
    if (result.success) {
      toast.success("Schedule deleted successfully")
      loadSchedules()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge className="bg-orange-100 text-orange-800">Medium</Badge>
      case "low":
        return <Badge variant="secondary">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const clearFilters = () => {
    setFilters({
      room: "",
      assigned_to: "",
      status: "",
      date: "",
      search: "",
    })
  }

  if (isLoading && !schedules.length) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Housekeeping Management</h1>
          <p className="text-muted-foreground">Schedule and manage room cleaning tasks</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/frontdesk/housekeeping/new">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Cleaning
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
              <Bed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting assignment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.in_progress}</div>
              <p className="text-xs text-muted-foreground">Currently cleaning</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today?.total || 0}</div>
              <p className="text-xs text-muted-foreground">{stats.today?.completed || 0} completed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schedules..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filters.room} onValueChange={(value) => handleFilterChange("room", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All rooms</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room._id} value={room._id}>
                    Room {room.number} - Floor {room.floor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.assigned_to} onValueChange={(value) => handleFilterChange("assigned_to", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Assigned to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All staff</SelectItem>
                {staff.map((member) => (
                  <SelectItem key={member._id} value={member._id}>
                    {member.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              placeholder="Select date"
            />

            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedules List */}
      <Card>
        <CardHeader>
          <CardTitle>Cleaning Schedules</CardTitle>
          <CardDescription>Manage room cleaning tasks and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({stats?.total || 0})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats?.pending || 0})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({stats?.in_progress || 0})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({stats?.completed || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {schedules.length === 0 ? (
                <div className="text-center py-8">
                  <Bed className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No schedules found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Get started by creating a new cleaning schedule.</p>
                  <div className="mt-6">
                    <Button asChild>
                      <Link href="/frontdesk/housekeeping/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule Cleaning
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div key={schedule._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Bed className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium">Room {schedule.room?.number}</h3>
                              {getStatusBadge(schedule.status)}
                              {getPriorityBadge(schedule.priority)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Floor {schedule.room?.floor} • {schedule.room?.building}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(schedule.schedule_date), "MMM dd, yyyy")}
                              </span>
                              {schedule.assigned_to && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {schedule.assigned_to.name}
                                </span>
                              )}
                            </div>
                            {schedule.notes && <p className="text-sm text-muted-foreground mt-2">{schedule.notes}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {schedule.assigned_to && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={schedule.assigned_to.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {schedule.assigned_to.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {schedule.status === "pending" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(schedule._id, "in_progress")}>
                                    Start Cleaning
                                  </DropdownMenuItem>
                                  {!schedule.assigned_to && (
                                    <DropdownMenuItem asChild>
                                      <Link href={`/frontdesk/housekeeping/${schedule._id}/assign`}>Assign Staff</Link>
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              {schedule.status === "in_progress" && (
                                <DropdownMenuItem onClick={() => handleStatusUpdate(schedule._id, "completed")}>
                                  Mark Complete
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem asChild>
                                <Link href={`/frontdesk/housekeeping/${schedule._id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/frontdesk/housekeeping/${schedule._id}/edit`}>Edit Schedule</Link>
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
                                    Delete Schedule
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this cleaning schedule? This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteSchedule(schedule._id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
