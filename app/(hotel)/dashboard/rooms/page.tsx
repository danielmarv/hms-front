"use client"

import { useState } from "react"
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
import { Plus, Search } from "lucide-react"

// Mock data for rooms
const rooms = [
  {
    id: "R101",
    number: "101",
    type: "Standard Double",
    floor: "1",
    capacity: 2,
    pricePerNight: 120,
    status: "available",
    amenities: ["Wi-Fi", "TV", "Air Conditioning", "Mini Bar"],
  },
  {
    id: "R102",
    number: "102",
    type: "Standard Twin",
    floor: "1",
    capacity: 2,
    pricePerNight: 120,
    status: "occupied",
    amenities: ["Wi-Fi", "TV", "Air Conditioning"],
  },
  {
    id: "R201",
    number: "201",
    type: "Deluxe King",
    floor: "2",
    capacity: 2,
    pricePerNight: 180,
    status: "maintenance",
    amenities: ["Wi-Fi", "TV", "Air Conditioning", "Mini Bar", "Safe", "Bathtub"],
  },
  {
    id: "R202",
    number: "202",
    type: "Deluxe Twin",
    floor: "2",
    capacity: 2,
    pricePerNight: 180,
    status: "available",
    amenities: ["Wi-Fi", "TV", "Air Conditioning", "Mini Bar", "Safe"],
  },
  {
    id: "R301",
    number: "301",
    type: "Suite",
    floor: "3",
    capacity: 4,
    pricePerNight: 300,
    status: "occupied",
    amenities: ["Wi-Fi", "TV", "Air Conditioning", "Mini Bar", "Safe", "Bathtub", "Separate Living Area"],
  },
]

export default function RoomsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Filter rooms based on search query, status filter, and type filter
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.number.includes(searchQuery) || room.type.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || room.status === statusFilter
    const matchesType = typeFilter === "all" || room.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Get unique room types for filter
  const roomTypes = Array.from(new Set(rooms.map((room) => room.type)))

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
      case "reserved":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Reserved
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
          <Link href="/dashboard/rooms/new">
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
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
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
                  <TableHead className="hidden md:table-cell">Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price/Night</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No rooms found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.number}</TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell className="hidden md:table-cell">{room.floor}</TableCell>
                      <TableCell className="hidden md:table-cell">{room.capacity} persons</TableCell>
                      <TableCell>{getStatusBadge(room.status)}</TableCell>
                      <TableCell className="text-right">${room.pricePerNight}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/rooms/${room.id}`}>View</Link>
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
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
