"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react"
import { useMaintenanceRequests } from "@/hooks/use-maintenance"
import { useRooms } from "@/hooks/use-rooms"
import { useUsers } from "@/hooks/use-users"
import { format } from "date-fns"

export default function MaintenancePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [roomFilter, setRoomFilter] = useState("all")
  const [assignedToFilter, setAssignedToFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageLimit] = useState(10)

  const {
    maintenanceRequests,
    stats,
    getMaintenanceRequests,
    getMaintenanceStats,
    updateMaintenanceStatus,
    assignMaintenanceRequest,
    deleteMaintenanceRequest,
    isLoading,
  } = useMaintenanceRequests()

  const { rooms, fetchRooms } = useRooms()
  const { users, fetchUsers } = useUsers()

  useEffect(() => {
    loadData()
  }, [currentPage, statusFilter, priorityFilter, categoryFilter, roomFilter, assignedToFilter, searchQuery])

  const loadData = async () => {
    const filters = {
      page: currentPage,
      limit: pageLimit,
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(priorityFilter !== "all" && { priority: priorityFilter }),
      ...(categoryFilter !== "all" && { category: categoryFilter }),
      ...(roomFilter !== "all" && { roomId: roomFilter }),
      ...(assignedToFilter !== "all" && { assignedTo: assignedToFilter }),
      ...(searchQuery && { search: searchQuery }),
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    }

    await Promise.all([
      getMaintenanceRequests(filters),
      getMaintenanceStats(),
      fetchRooms({ limit: 200 }),
      fetchUsers({ role: "maintenance" }),
    ])
  }

  const handleRefresh = () => {
    loadData()
    toast.success("Data refreshed")
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    const result = await updateMaintenanceStatus(id, status)
    if (result) {
      loadData()
    }
  }

  const handleAssign = async (id: string, assignedTo: string) => {
    const result = await assignMaintenanceRequest(id, assignedTo)
    if (result) {
      loadData()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this maintenance request?")) {
      const result = await deleteMaintenanceRequest(id)
      if (result) {
        loadData()
      }
    }
  }

  // Function to get badge variant based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "assigned":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <User className="w-3 h-3 mr-1" />
            Assigned
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <RefreshCw className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Function to get badge variant based on priority
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Low
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Medium
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            High
          </Badge>
        )
      case "critical":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Critical
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const categories = ["electrical", "plumbing", "hvac", "cleaning", "furniture", "appliances", "other"]
  const maintenanceStaff = users.filter((user) => user.role === "maintenance" || user.role === "technician")

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground">Manage maintenance requests and repairs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/dashboard/maintenance/new">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">All time requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.byStatus?.pending?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats?.byStatus?.assigned?.count || 0) + (stats?.byStatus?.in_progress?.count || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.costs?.total?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roomFilter} onValueChange={setRoomFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Rooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {rooms.map((room) => (
                  <SelectItem key={room._id} value={room._id}>
                    Room {room.roomNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {maintenanceStaff.map((staff) => (
                  <SelectItem key={staff._id} value={staff._id}>
                    {staff.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
                setPriorityFilter("all")
                setCategoryFilter("all")
                setRoomFilter("all")
                setAssignedToFilter("all")
                setCurrentPage(1)
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Requests</CardTitle>
          <CardDescription>Manage and track maintenance requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                  <TableHead className="hidden xl:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-6 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-6 w-12 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : maintenanceRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                        <p>No maintenance requests found.</p>
                        <Button asChild size="sm">
                          <Link href="/dashboard/maintenance/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Create First Request
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  maintenanceRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-48">{request.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.room ? (
                          <div>
                            <p className="font-medium">Room {request.room.roomNumber}</p>
                            <p className="text-xs text-muted-foreground">Floor {request.room.floor}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No room</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="capitalize">
                          {request.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {request.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="text-sm">{request.assignedTo.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{format(new Date(request.createdAt), "MMM dd, yyyy")}</span>
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
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/maintenance/${request._id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>

                            {request.status === "pending" && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(request._id, "assigned")}>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Assign
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate(request._id, "in_progress")}>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Start Work
                                </DropdownMenuItem>
                              </>
                            )}

                            {request.status === "assigned" && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(request._id, "in_progress")}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Start Work
                              </DropdownMenuItem>
                            )}

                            {request.status === "in_progress" && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(request._id, "completed")}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/maintenance/${request._id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleDelete(request._id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1)
                      }
                    }}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    {currentPage}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(currentPage + 1)
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
