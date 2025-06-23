"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import { Search, Calendar, Users, Phone, Mail, MapPin } from "lucide-react"
import { format } from "date-fns"

interface BookingSearchPanelProps {
  bookings: any[]
  guests: any[]
  onBookingSelect: (booking: any) => void
  onGuestSelect: (guest: any) => void
  isLoading: boolean
}

export function BookingSearchPanel({
  bookings,
  guests,
  onBookingSelect,
  onGuestSelect,
  isLoading,
}: BookingSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("bookings")
  const [filters, setFilters] = useState({
    status: "",
    checkInDate: "",
    vip: "",
  })

  // Debug log to see if guests are being passed
  console.log("BookingSearchPanel - guests:", guests)
  console.log("BookingSearchPanel - bookings:", bookings)

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guest?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.confirmation_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guest?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.guest?.phone?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !filters.status || booking.status === filters.status
    const matchesDate = !filters.checkInDate || booking.check_in === filters.checkInDate
    const matchesVip = !filters.vip || (filters.vip === "true" ? booking.guest?.vip : !booking.guest?.vip)

    return matchesSearch && matchesStatus && matchesDate && matchesVip
  })

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesVip = !filters.vip || (filters.vip === "true" ? guest.vip : !guest.vip)

    return matchesSearch && matchesVip
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800" },
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
      checked_in: { label: "Checked In", className: "bg-blue-100 text-blue-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: "" }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "All Statuses" },
        { value: "confirmed", label: "Confirmed" },
        { value: "pending", label: "Pending" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "vip",
      label: "VIP Status",
      options: [
        { value: "", label: "All Guests" },
        { value: "true", label: "VIP Only" },
        { value: "false", label: "Regular Guests" },
      ],
    },
  ]

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Find Guest or Booking</CardTitle>
          <CardDescription>Search for existing bookings or guests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Guest or Booking</CardTitle>
        <CardDescription>Search for existing bookings or guests to begin check-in</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, or confirmation number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.vip}
            onChange={(e) => setFilters((prev) => ({ ...prev, vip: e.target.value }))}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Guests</option>
            <option value="true">VIP Only</option>
            <option value="false">Regular Guests</option>
          </select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bookings">Bookings ({filteredBookings.length})</TabsTrigger>
            <TabsTrigger value="guests">Walk-in Guests ({filteredGuests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredBookings.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No bookings found"
                description="Try adjusting your search criteria or filters"
              />
            ) : (
              filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => onBookingSelect(booking)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={booking.guest?.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {booking.guest?.full_name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{booking.guest?.full_name}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{booking.confirmation_number}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(booking.check_in), "MMM dd")} -{" "}
                            {format(new Date(booking.check_out), "MMM dd")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {booking.number_of_guests} guests
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(booking.status)}
                      {booking.guest?.vip && (
                        <Badge variant="outline" className="text-xs">
                          VIP
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{booking.room_type?.name}</span>
                      <span className="text-sm font-bold">${booking.total_amount}</span>
                    </div>
                    {booking.special_requests && (
                      <p className="text-xs text-muted-foreground mt-1">{booking.special_requests}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="guests" className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredGuests.length === 0 ? (
              <EmptyState icon={Users} title="No guests found" description="Try adjusting your search criteria" />
            ) : (
              filteredGuests.map((guest) => (
                <div
                  key={guest._id} // Use _id instead of id
                  className="p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => onGuestSelect(guest)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>
                          {guest.full_name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{guest.full_name}</h3>
                        <div className="space-y-1 mt-1">
                          {guest.email && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {guest.email}
                            </div>
                          )}
                          {guest.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {guest.phone}
                            </div>
                          )}
                          {guest.address?.city && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {guest.address.city}, {guest.address.country}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {guest.vip && <Badge className="bg-purple-100 text-purple-800">VIP</Badge>}
                      {guest.loyalty_program?.member && (
                        <Badge variant="outline" className="text-xs">
                          {guest.loyalty_program.tier}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {guest.stay_history?.total_stays > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{guest.stay_history.total_stays} previous stays</span>
                        {guest.stay_history.last_stay && (
                          <span>Last visit: {format(new Date(guest.stay_history.last_stay), "MMM yyyy")}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
