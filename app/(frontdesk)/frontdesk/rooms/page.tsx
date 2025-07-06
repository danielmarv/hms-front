"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Search } from "lucide-react"
import { useRooms, type RoomStatus } from "@/hooks/use-rooms"
import { useRoomTypes } from "@/hooks/use-room-types"

export default function RoomsPage() {
  const { rooms, pagination, isLoading, fetchRooms } = useRooms()
  const { roomTypes, fetchRoomTypes } = useRoomTypes()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchRooms({
      status: statusFilter !== "all" ? (statusFilter as RoomStatus) : undefined,
      roomType: typeFilter !== "all" ? typeFilter : undefined,
      page: currentPage,
      limit: 10,
    })
    fetchRoomTypes()
  }, [statusFilter, typeFilter, currentPage])

  // Function to handle search
  const handleSearch = () => {
    // Reset to first page when searching
    setCurrentPage(1)
    fetchRooms({
      status: statusFilter !== "all" ? (statusFilter as RoomStatus) : undefined,
      roomType: typeFilter !== "all" ? typeFilter : undefined,
      page: 1,
      limit: 10,
    })
  }

  // Function to get badge variant based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Available
          </Badge>
        )
      case "occupied":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Occupied
          </Badge>
        )
      case "maintenance":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Maintenance
          </Badge>
        )
      case "cleaning":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Cleaning
          </Badge>
        )
      case "reserved":
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Reserved
          </Badge>
        )
      case "out_of_order":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Out of Order
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
          <p className="text-muted-foreground">Manage hotel rooms and their availability</p>
        </div>
        <Button asChild>
          <Link href="/frontdesk/rooms/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>All Rooms</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search rooms..."
                className="w-full pl-8 sm:w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="out_of_order">Out of Order</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {roomTypes && roomTypes.length > 0
                  ? roomTypes.map((type) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.name}
                      </SelectItem>
                    ))
                  : null}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Floor</TableHead>
                  <TableHead className="hidden md:table-cell">Building</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price/Night</TableHead>
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
                        <TableCell>
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-6 w-12" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-6 w-16 ml-auto" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-6 w-12 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : rooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No rooms found.
                    </TableCell>
                  </TableRow>
                ) : (
                  rooms.map((room) => (
                    <TableRow key={room._id}>
                      <TableCell className="font-medium">{room.roomNumber}</TableCell>
                      <TableCell>{room.roomType?.name || "N/A"}</TableCell>
                      <TableCell className="hidden md:table-cell">{room.floor}</TableCell>
                      <TableCell className="hidden md:table-cell">{room.building}</TableCell>
                      <TableCell>{getStatusBadge(room.status)}</TableCell>
                      <TableCell className="text-right">
                        ${room.roomType?.basePice || room.roomType?.basePrice || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/frontdesk/rooms/${room._id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
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

                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  // Show pages around current page
                  let pageNum = i + 1
                  if (pagination.totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 3 + i
                    }
                    if (pageNum > pagination.totalPages - 4 && currentPage > pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    }
                  }

                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={pageNum === currentPage}
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(pageNum)
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

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
        </CardContent>
      </Card>
    </div>
  )
}
