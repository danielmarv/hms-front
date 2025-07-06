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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Calendar,
  Bed,
  Users,
  Wifi,
  Car,
  Coffee,
  Tv,
  Bath,
  Wind,
  Phone,
  MapPin,
  Eye,
  Edit,
  Settings,
  MoreVertical,
  Home,
  Building,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Wrench,
  Sparkles,
} from "lucide-react"
import { useRooms, type RoomStatus } from "@/hooks/use-rooms"
import { useRoomTypes } from "@/hooks/use-room-types"
import { useCurrency } from "@/hooks/use-currency"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function RoomsPage() {
  const { rooms, roomStats, pagination, isLoading, fetchRooms, fetchRoomStats } = useRooms()
  const { roomTypes, fetchRoomTypes } = useRoomTypes()
  const { getDisplayAmounts } = useCurrency()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [floorFilter, setFloorFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  useEffect(() => {
    fetchRooms({
      status: statusFilter !== "all" ? (statusFilter as RoomStatus) : undefined,
      room_type: typeFilter !== "all" ? typeFilter : undefined,
      floor: floorFilter !== "all" ? floorFilter : undefined,
      page: currentPage,
      limit: 12,
    })
    fetchRoomTypes()
    fetchRoomStats()
  }, [statusFilter, typeFilter, floorFilter, currentPage])

  // Function to handle search
  const handleSearch = () => {
    setCurrentPage(1)
    fetchRooms({
      status: statusFilter !== "all" ? (statusFilter as RoomStatus) : undefined,
      room_type: typeFilter !== "all" ? typeFilter : undefined,
      floor: floorFilter !== "all" ? floorFilter : undefined,
      page: 1,
      limit: 12,
    })
  }

  // Get unique floors from rooms
  const floors = Array.from(new Set(rooms.map((room) => room.floor?.toString())))
    .filter(Boolean)
    .sort()

  // Function to get status badge with enhanced styling
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: {
        icon: CheckCircle,
        className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
        label: "Available",
      },
      occupied: {
        icon: Users,
        className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
        label: "Occupied",
      },
      maintenance: {
        icon: Wrench,
        className: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
        label: "Maintenance",
      },
      cleaning: {
        icon: Sparkles,
        className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
        label: "Cleaning",
      },
      reserved: {
        icon: Clock,
        className: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
        label: "Reserved",
      },
      out_of_order: {
        icon: XCircle,
        className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        label: "Out of Order",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      icon: AlertCircle,
      className: "bg-gray-50 text-gray-700 border-gray-200",
      label: status,
    }

    const Icon = config.icon

    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  // Function to get amenity icons
  const getAmenityIcon = (amenity: string) => {
    const amenityIcons: { [key: string]: any } = {
      "Wi-Fi": Wifi,
      WiFi: Wifi,
      TV: Tv,
      Television: Tv,
      "Air Conditioning": Wind,
      AC: Wind,
      Bathroom: Bath,
      Coffee: Coffee,
      Parking: Car,
      Phone: Phone,
    }

    const Icon = amenityIcons[amenity] || Home
    return <Icon className="h-3 w-3" />
  }

  // Render dual currency
  const renderDualCurrency = (amount: number) => {
    const { usd, ugx } = getDisplayAmounts(amount)
    return (
      <div className="text-right">
        <div className="font-semibold">{usd}</div>
        <div className="text-xs text-muted-foreground">{ugx}</div>
      </div>
    )
  }

  // Room Grid Component
  const RoomGrid = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {isLoading ? (
        Array(8)
          .fill(0)
          .map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-video bg-muted">
                <Skeleton className="h-full w-full" />
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
      ) : rooms.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters or add a new room.</p>
          <Button asChild>
            <Link href="/frontdesk/rooms/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Link>
          </Button>
        </div>
      ) : (
        rooms.map((room) => (
          <Card key={room._id} className="overflow-hidden hover:shadow-lg transition-shadow group">
            {/* Room Image */}
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Bed className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-blue-800">Room {room.roomNumber}</p>
                </div>
              </div>
              <div className="absolute top-3 right-3">{getStatusBadge(room.status)}</div>
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="text-xs">
                  Floor {room.floor}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Room Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Room {room.roomNumber}</h3>
                    <p className="text-sm text-muted-foreground">{room.roomType?.name || "Standard"}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/frontdesk/rooms/${room._id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/frontdesk/rooms/${room._id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Room
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Room Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Room Details */}
                <div className="space-y-2">
                  {room.building && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {room.building}
                    </div>
                  )}

                  {room.roomType?.bedConfiguration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Bed className="h-3 w-3" />
                      {room.roomType.bedConfiguration}
                    </div>
                  )}
                </div>

                {/* Amenities */}
                {room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 4).map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                        {getAmenityIcon(amenity)}
                        {amenity}
                      </Badge>
                    ))}
                    {room.amenities.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{room.amenities.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}

                <Separator />

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  {renderDualCurrency(room.roomType?.basePrice || 0)}
                  <Button size="sm" asChild>
                    <Link href={`/frontdesk/rooms/${room._id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )

  // Room Table Component
  const RoomTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="hidden md:table-cell">Floor</TableHead>
            <TableHead className="hidden lg:table-cell">Building</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Amenities</TableHead>
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
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-6 w-32" />
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
              <TableCell colSpan={8} className="h-24 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Building className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No rooms found</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rooms.map((room) => (
              <TableRow key={room._id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-700">{room.roomNumber}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">Room {room.roomNumber}</div>
                      <div className="text-xs text-muted-foreground">Floor {room.floor}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{room.roomType?.name || "N/A"}</div>
                    {room.roomType?.bedConfiguration && (
                      <div className="text-xs text-muted-foreground">{room.roomType.bedConfiguration}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline">{room.floor}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{room.building || "-"}</TableCell>
                <TableCell>{getStatusBadge(room.status)}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {room.amenities && room.amenities.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 2).map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                          {getAmenityIcon(amenity)}
                          {amenity}
                        </Badge>
                      ))}
                      {room.amenities.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{room.amenities.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </TableCell>
                <TableCell className="text-right">{renderDualCurrency(room.roomType?.basePrice || 0)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/frontdesk/rooms/${room._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/frontdesk/rooms/${room._id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Room Management</h1>
          <p className="text-muted-foreground">Manage hotel rooms, availability, and room assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/frontdesk/rooms/calendar">
              <Calendar className="mr-2 h-4 w-4" />
              Calendar View
            </Link>
          </Button>
          <Button asChild>
            <Link href="/frontdesk/rooms/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Link>
          </Button>
        </div>
      </div>

      {/* Room Statistics */}
      {roomStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roomStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{roomStats.available}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupied</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{roomStats.occupied}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reserved</CardTitle>
              <Clock className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{roomStats.reserved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cleaning</CardTitle>
              <Sparkles className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{roomStats.cleaning}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{roomStats.maintenance}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Order</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{roomStats.out_of_order}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and View Toggle */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search rooms..."
                  className="w-full pl-8 md:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="All Statuses" />
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
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {roomTypes?.map((type) => (
                    <SelectItem key={type._id} value={type._id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={floorFilter} onValueChange={setFloorFilter}>
                <SelectTrigger className="w-full md:w-[120px]">
                  <SelectValue placeholder="All Floors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  {floors.map((floor) => (
                    <SelectItem key={floor} value={floor}>
                      Floor {floor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>{viewMode === "grid" ? <RoomGrid /> : <RoomTable />}</CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
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
      )}
    </div>
  )
}
