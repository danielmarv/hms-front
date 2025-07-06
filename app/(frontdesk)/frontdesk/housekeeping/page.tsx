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
import { toast } from "sonner"
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  RefreshCw,
  Bed,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useHousekeeping } from "@/hooks/use-housekeeping"
import { useRooms } from "@/hooks/use-rooms"
import { useUsers } from "@/hooks/use-users"
import { format } from "date-fns"

export default function HousekeepingPage() {
  const { schedules, getSchedules, getStats, updateSchedule, deleteSchedule, isLoading } = useHousekeeping()
  const { fetchRooms } = useRooms()
  const { fetchUsers } = useUsers()

  const [stats, setStats] = useState<any>({})
  const [rooms, setRooms] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [filters, setFilters] = useState({
    search: "",
    room: "",
    assigned_to: "",
    status: "",
    date: "",
  })
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    loadData()
    loadRooms()
    loadStaff()
  }, [])

  useEffect(() => {
    loadSchedules()
  }, [filters, activeTab])

  const loadData = async () => {
    const statsData = await getStats()
    if (statsData.data) {
      setStats(statsData.data)
    }
  }

  const loadSchedules = async () => {
    const queryFilters = { ...filters }
    if (activeTab !== "all") {
      queryFilters.status = activeTab.replace("_", " ")
    }
    await getSchedules(queryFilters)
  }

  const loadRooms = async () => {
    const roomsData = await fetchRooms({ limit: 200 })
    const roomsList = Array.isArray(roomsData) ? roomsData : roomsData?.data || []
    setRooms(roomsList)
  }

  const loadStaff = async () => {
    const staffData = await fetchUsers({ department: "housekeeping", limit: 100 })
    const staffList = Array.isArray(staffData) ? staffData : staffData?.data || []
    setStaff(staffList)
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleStatusUpdate = async (scheduleId: string, newStatus: string) => {
    const result = await updateSchedule(scheduleId, { status: newStatus })
    if (result.data) {
      toast.success("Schedule status updated")
      loadSchedules()
      loadData()
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  const handleDelete = async (scheduleId: string) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      const result = await deleteSchedule(scheduleId)
      if (result.data) {
        toast.success("Schedule deleted successfully")
        loadSchedules()
        loadData()
      } else if (result.error) {
        toast.error(result.error)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "in_progress":
        return <Badge variant="default">In Progress</Badge>
      case "completed":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge variant="default">Medium</Badge>
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const getRoomName = (roomId: string) => {
    const room = rooms.find((r) => r._id === roomId)
    return room ? `Room ${room.number}` : "Unknown Room"
  }

  const getStaffName = (staffId: string) => {
    const member = staff.find((s) => s._id === staffId)
    return member ? member.full_name : "Unassigned"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Housekeeping</h1>
          <p className="text-muted-foreground">Manage room cleaning schedules and assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSchedules} disabled={isLoading}>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
            <p className="text-xs text-muted-foreground">All time schedules</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_progress || 0}</div>
            <p className="text-xs text-muted-foreground">Currently cleaning</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today?.total || 0}</div>
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
                placeholder="Search schedules..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filters.room} onValueChange={(value) => handleFilterChange("room", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Rooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room._id} value={room._id}>
                    Room {room.number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.assigned_to} onValueChange={(value) => handleFilterChange("assigned_to", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {staff.map((member) => (
                  <SelectItem key={member._id} value={member._id}>
                    {member.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              placeholder="Filter by date"
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cleaning Schedules</CardTitle>
          <CardDescription>Manage and track all housekeeping schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({stats.total || 0})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending || 0})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({stats.in_progress || 0})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({stats.completed || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {schedules.length === 0 ? (
                <div className="text-center py-12">
                  <Bed className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">No schedules found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No housekeeping schedules match your current filters.
                  </p>
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
                    {schedules.map((schedule) => (
                      <TableRow key={schedule._id}>
                        <TableCell className="font-medium">
                          {schedule.room?.number ? `Room ${schedule.room.number}` : getRoomName(schedule.room)}
                        </TableCell>
                        <TableCell>{format(new Date(schedule.schedule_date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          {schedule.assigned_to?.full_name || getStaffName(schedule.assigned_to) || "Unassigned"}
                        </TableCell>
                        <TableCell>{getPriorityBadge(schedule.priority)}</TableCell>
                        <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                        <TableCell className="max-w-xs truncate">{schedule.notes || "-"}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {schedule.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleStatusUpdate(schedule._id, "in_progress")}>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Start Cleaning
                                </DropdownMenuItem>
                              )}
                              {schedule.status === "in_progress" && (
                                <DropdownMenuItem onClick={() => handleStatusUpdate(schedule._id, "completed")}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
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
