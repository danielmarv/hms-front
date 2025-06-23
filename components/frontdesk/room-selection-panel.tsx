"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { FilterBar } from "@/components/ui/filter-bar"
import { Bed, Users, Wifi, Car, Coffee, Tv, Bath, Wind, Search, MapPin, DollarSign } from "lucide-react"
import { format } from "date-fns"

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
  const [searchParams, setSearchParams] = useState({
    check_in: selectedBooking?.check_in || format(new Date(), "yyyy-MM-dd"),
    check_out: selectedBooking?.check_out || format(new Date(Date.now() + 86400000), "yyyy-MM-dd"),
    guests: selectedBooking?.number_of_guests || 1,
    room_type: selectedBooking?.room_type_id || "",
  })
  const [filters, setFilters] = useState({
    floor: "",
    status: "",
    amenities: "",
    priceRange: "",
  })
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    if (selectedBooking || selectedGuest) {
      handleSearchRooms()
    }
  }, [selectedBooking, selectedGuest])

  const handleSearchRooms = async () => {
    setSearchLoading(true)
    try {
      const results = await onSearchRooms(searchParams)
      setAvailableRooms(results)
    } catch (error) {
      console.error("Failed to search rooms:", error)
    } finally {
      setSearchLoading(false)
    }
  }

  const filteredRooms = availableRooms.filter((room) => {
    const matchesFloor = !filters.floor || room.floor.toString() === filters.floor
    const matchesStatus = !filters.status || room.status === filters.status
    const matchesAmenities = !filters.amenities || room.amenities?.includes(filters.amenities)
    const matchesPrice = !filters.priceRange || checkPriceRange(room.roomType?.basePrice, filters.priceRange)

    return matchesFloor && matchesStatus && matchesAmenities && matchesPrice
  })

  const checkPriceRange = (price: number, range: string) => {
    switch (range) {
      case "0-100":
        return price <= 100
      case "100-200":
        return price > 100 && price <= 200
      case "200-300":
        return price > 200 && price <= 300
      case "300+":
        return price > 300
      default:
        return true
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { label: "Available", className: "bg-green-100 text-green-800" },
      occupied: { label: "Occupied", className: "bg-red-100 text-red-800" },
      cleaning: { label: "Cleaning", className: "bg-yellow-100 text-yellow-800" },
      maintenance: { label: "Maintenance", className: "bg-orange-100 text-orange-800" },
      out_of_order: { label: "Out of Order", className: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "" }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getAmenityIcon = (amenity: string) => {
    const icons = {
      wifi: Wifi,
      parking: Car,
      minibar: Coffee,
      tv: Tv,
      bathtub: Bath,
      ac: Wind,
    }
    const Icon = icons[amenity as keyof typeof icons]
    return Icon ? <Icon className="h-4 w-4" /> : null
  }

  const filterOptions = [
    {
      key: "floor",
      label: "Floor",
      options: [
        { value: "", label: "All Floors" },
        { value: "1", label: "1st Floor" },
        { value: "2", label: "2nd Floor" },
        { value: "3", label: "3rd Floor" },
        { value: "4", label: "4th Floor" },
        { value: "5", label: "5th Floor" },
      ],
    },
    {
      key: "priceRange",
      label: "Price Range",
      options: [
        { value: "", label: "All Prices" },
        { value: "0-100", label: "$0 - $100" },
        { value: "100-200", label: "$100 - $200" },
        { value: "200-300", label: "$200 - $300" },
        { value: "300+", label: "$300+" },
      ],
    },
  ]

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Room</CardTitle>
          <CardDescription>Choose an available room for the guest</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton rows={5} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Room</CardTitle>
        <CardDescription>{selectedGuest && `Selecting room for ${selectedGuest.full_name}`}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Parameters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <Label htmlFor="checkIn">Check-in Date</Label>
            <Input
              id="checkIn"
              type="date"
              value={searchParams.check_in}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, check_in: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="checkOut">Check-out Date</Label>
            <Input
              id="checkOut"
              type="date"
              value={searchParams.check_out}
              onChange={(e) => setSearchParams((prev) => ({ ...prev, check_out: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="guests">Number of Guests</Label>
            <Select
              value={searchParams.guests.toString()}
              onValueChange={(value) => setSearchParams((prev) => ({ ...prev, guests: Number.parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} Guest{num > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleSearchRooms} disabled={searchLoading} className="w-full">
              <Search className="mr-2 h-4 w-4" />
              {searchLoading ? "Searching..." : "Search Rooms"}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <FilterBar filters={filters} onFiltersChange={setFilters} filterOptions={filterOptions} />

        {/* Room Results */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredRooms.length === 0 ? (
            <EmptyState
              icon={Bed}
              title="No rooms available"
              description="Try adjusting your search criteria or dates"
            />
          ) : (
            filteredRooms.map((room) => (
              <div
                key={room.id}
                className="p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => onRoomSelect(room)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">Room {room.roomNumber}</h3>
                      {getStatusBadge(room.status)}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Floor {room.floor}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {room.roomType?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Max {room.roomType?.maxOccupancy} guests
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />${room.roomType?.basePrice}/night
                        </span>
                      </div>

                      {room.roomType?.description && (
                        <p className="text-sm text-muted-foreground">{room.roomType.description}</p>
                      )}

                      {room.amenities && room.amenities.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {room.amenities.map((amenity: string) => (
                            <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                              {getAmenityIcon(amenity)}
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">${room.roomType?.basePrice}</div>
                    <div className="text-sm text-muted-foreground">per night</div>
                    {selectedBooking && (
                      <div className="mt-2 text-sm">
                        <div className="font-medium">
                          Total: ${(room.roomType?.basePrice * selectedBooking.duration).toFixed(2)}
                        </div>
                        <div className="text-muted-foreground">{selectedBooking.duration} nights</div>
                      </div>
                    )}
                  </div>
                </div>

                {room.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">{room.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
