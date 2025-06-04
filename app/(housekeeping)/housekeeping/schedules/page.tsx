"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { CalendarIcon, Search, CheckCircle, Clock, AlertCircle, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHousekeeping } from "@/hooks/use-housekeeping"
import { toast } from "sonner"

export default function HousekeepingSchedulesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [date, setDate] = useState<Date | undefined>()
  const [currentPage, setCurrentPage] = useState(1)
  const { schedules, pagination, isLoading, fetchSchedules, updateSchedule } = useHousekeeping()

  useEffect(() => {
    fetchSchedules({
      status: statusFilter === "all" ? undefined : statusFilter,
      date: date ? format(date, "yyyy-MM-dd") : undefined,
      page: currentPage,
      limit: 10,
    })
  }, [statusFilter, date, currentPage, fetchSchedules])

  const handleStatusUpdate = async (scheduleId: string, newStatus: string) => {
    try {
      const { data, error } = await updateSchedule(scheduleId, { status: newStatus })
      if (error) {
        toast.error("Failed to update schedule status")
      } else {
        toast.success("Schedule status updated successfully")
        // Refresh the list
        fetchSchedules({
          status: statusFilter === "all" ? undefined : statusFilter,
          date: date ? format(date, "yyyy-MM-dd") : undefined,
          page: currentPage,
          limit: 10,
        })
      }
    } catch (error) {
      toast.error("Failed to update schedule status")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

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
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            High
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.room.number.includes(searchQuery) ||
      (schedule.assigned_to?.name && schedule.assigned_to.name.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Schedules</h1>
          <p className="text-muted-foreground">View and manage all housekeeping schedules</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Housekeeping Schedules</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search rooms..."
                className="w-full pl-8 sm:w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal sm:w-[200px]",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                  <TableHead className="hidden lg:table-cell">Notes</TableHead>
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
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Skeleton className="h-6 w-32" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-6 w-12 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : filteredSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No schedules found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <TableRow key={schedule._id}>
                      <TableCell className="font-medium">
                        {schedule.room.number} ({schedule.room.floor}/{schedule.room.building})
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(schedule.schedule_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">{getPriorityBadge(schedule.priority)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="truncate max-w-32 block">{schedule.notes || "No notes"}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {schedule.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(schedule._id, "in_progress")}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                          )}
                          {schedule.status === "in_progress" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(schedule._id, "completed")}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/housekeeping/schedules/${schedule._id}`}>View</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {pagination.totalPages > 1 && (
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
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(page)
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < pagination.totalPages) {
                          setCurrentPage(currentPage + 1)
                        }
                      }}
                      className={currentPage >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
