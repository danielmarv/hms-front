"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { Bed, Users, DollarSign, MapPin, Wifi, Car, Coffee, Tv } from "lucide-react"

interface RoomSelectionPanelProps {
  rooms: any[]
  selectedGuest: any
  selectedBooking: any
  onRoomSelect: (room: any) => void
  onSearchRooms: (params: any) => Promise<any[]>
  isLoading: boolean
}

export function RoomSelectionPanel({
  rooms,
  selectedGuest,
  selectedBooking,
  onRoomSelect,
  onSearchRooms,
  isLoading,
}: RoomSelectionPanelProps) {
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [filters, setFilters] = useState({
    floor: "all",
    priceRange: "all",
    amenities: "",
    view: "all",
  })
  const [searchParams, setSearchParams] = useState({
    checkIn: selectedBooking?.check_in || new Date().toISOString().split("T")[0],
    checkOut: selectedBooking?.check_out || new Date(Date.now() + 86400000).toISOString().split("T")[0],
    guests: selectedBooking?.number_of_guests || 1,
  })

  useEffect(() => {
    if (selectedGuest || selectedBooking) {
      searchForRooms()
    }
  }, [selectedGuest, selectedBooking])

  const searchForRooms = async () => {
    try {
      const searchResults = await onSearchRooms({
        check_in: searchParams.checkIn,
        check_out: searchParams.checkOut,
        guests: searchParams.guests,
        room_type: selectedBooking?.room_type_id,
      })
      setAvailableRooms(searchResults || [])
    } catch (error) {
      console.error("Failed to search rooms:", error)
      setAvailableRooms([])
    }
  }
  console.log("Available Rooms:", availableRooms)

  const filteredRooms = availableRooms.filter((room) => {
    const matchesFloor = filters.floor === "all" || room.floor.toString() === filters.floor
    const matchesPrice =
      filters.priceRange === "all" || checkPriceRange(room.roomType?.basePrice || 0, filters.priceRange)
    const matchesView = filters.view === "all" || room.view === filters.view

    return matchesFloor && matchesPrice && matchesView
  })
  console.log("Filtered Rooms:", filteredRooms)

  const checkPriceRange = (price: number, range: string) => {
    switch (range) {
      case "budget":
        return price < 100
      case "mid":
        return price >= 100 && price < 200
      case "luxury":
        return price >= 200
      default:
        return true
    }
  }

  const getRoomStatusBadge = (status: string) => {
    const statusConfig = {
      available: { label: "Available", className: "bg-green-100 text-green-800" },
      cleaning: { label: "Being Cleaned", className: "bg-yellow-100 text-yellow-800" },
      maintenance: { label: "Maintenance", className: "bg-red-100 text-red-800" },
      occupied: { label: "Occupied", className: "bg-blue-100 text-blue-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "" }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getAmenityIcon = (amenity: string) => {
    const icons: { [key: string]: any } = {
      wifi: Wifi,
      parking: Car,
      minibar: Coffee,
      tv: Tv,
    }
    const Icon = icons[amenity.toLowerCase()] || Coffee
    return <Icon className="h-4 w-4" />
  }

  if (!selectedGuest && !selectedBooking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Room</CardTitle>
          <CardDescription>Please select a guest or booking first</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Bed}
            title="No guest selected"
            description="Select a guest or booking to view available rooms"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Room</CardTitle>
        <CardDescription>
          Choose an available room for {selectedGuest?.full_name || selectedBooking?.guest?.full_name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <label className="text-sm font-medium">Check-in Date</label>
            <Input
              type="date"
              value={searchParams.checkIn}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, checkIn: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Check-out Date</label>
            <Input
              type="date"
              value={searchParams.checkOut}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, checkOut: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Number of Guests</label>
            <Input
              type="number"
              min="1"
              value={searchParams.guests}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, guests: Number.parseInt(e.target.value) || 1 }))}
            />
          </div>
        </div>

        <Button onClick={searchForRooms} className="w-full">
          Search Available Rooms
        </Button>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={filters.floor} onValueChange={(value) => setFilters((prev) => ({ ...prev, floor: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Floor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Floors</SelectItem>
              <SelectItem value="1">Floor 1</SelectItem>
              <SelectItem value="2">Floor 2</SelectItem>
              <SelectItem value="3">Floor 3</SelectItem>
              <SelectItem value="4">Floor 4</SelectItem>
              <SelectItem value="5">Floor 5</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priceRange}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, priceRange: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="budget">Budget (&lt; $100)</SelectItem>
              <SelectItem value="mid">Mid-range ($100-200)</SelectItem>
              <SelectItem value="luxury">Luxury ($200+)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.view} onValueChange={(value) => setFilters((prev) => ({ ...prev, view: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Views</SelectItem>
              <SelectItem value="city">City View</SelectItem>
              <SelectItem value="ocean">Ocean View</SelectItem>
              <SelectItem value="garden">Garden View</SelectItem>
              <SelectItem value="pool">Pool View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />)
          ) : filteredRooms.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={Bed}
                title="No rooms available"
                description="Try adjusting your search criteria or dates"
              />
            </div>
          ) : (
            filteredRooms.map((room) => (
              <Card
                key={room._id}
                className="cursor-pointer transition-all hover:shadow-md hover:scale-105"
                onClick={() => onRoomSelect(room)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
                      <CardDescription>{room.roomType?.name}</CardDescription>
                    </div>
                    {getRoomStatusBadge(room.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Floor {room.floor}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Max {room.roomType?.maxOccupancy || 2}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">{room.roomType.basePrice}/night</span>
                    </div>
                    {room.view && (
                      <Badge variant="outline" className="text-xs">
                        {room.view} view
                      </Badge>
                    )}
                  </div>

                  {room.amenities && room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 4).map((amenity: string, index: number) => (
                        <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </div>
                      ))}
                      {room.amenities.length > 4 && (
                        <span className="text-xs text-muted-foreground">+{room.amenities.length - 4} more</span>
                      )}
                    </div>
                  )}

                  <Button className="w-full" size="sm">
                    Select Room
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
