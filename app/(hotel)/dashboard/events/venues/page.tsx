"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import {
  CalendarIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  UsersIcon,
  Loader2Icon,
  BuildingIcon,
  StarIcon,
  CheckCircleIcon,
  RefreshCwIcon,
} from "lucide-react"
import { format } from "date-fns"
import { useVenues } from "@/hooks/use-venues"
import { useHotels } from "@/hooks/use-hotels"
import { useEvents } from "@/hooks/use-events"
import { toast } from "sonner"
import type { Venue } from "@/hooks/use-events"
import type { Hotel } from "@/hooks/use-hotels"

// Venue types for filtering
const venueTypes = [
  { id: "ballroom", name: "Ballroom" },
  { id: "outdoor", name: "Outdoor" },
  { id: "lounge", name: "Lounge" },
  { id: "meeting", name: "Meeting Room" },
  { id: "conference", name: "Conference Room" },
  { id: "banquet", name: "Banquet Hall" },
  { id: "garden", name: "Garden" },
  { id: "rooftop", name: "Rooftop" },
]

export default function VenuesPage() {
  const router = useRouter()
  const { getAllHotels } = useHotels()

  const [selectedHotelId, setSelectedHotelId] = useState<string>("")
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [hotelsLoading, setHotelsLoading] = useState(true)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)

  const { venues, loading: venuesLoading, error, deleteVenue, refreshVenues } = useVenues(selectedHotelId || undefined)
  const { events, loading: eventsLoading } = useEvents(selectedHotelId)

  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [capacityFilter, setCapacityFilter] = useState("all")
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  // Fetch hotels on component mount
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setHotelsLoading(true)
        const response = await getAllHotels({ active: true })
        console.log("Hotels response:", response) // Debug log

        // Handle different response structures
        let hotelsData = []
        if (response?.data) {
          hotelsData = Array.isArray(response.data) ? response.data : response.data.data || []
        } else if (Array.isArray(response)) {
          hotelsData = response
        }

        setHotels(hotelsData)

        // Auto-select first hotel if available
        if (hotelsData.length > 0) {
          const firstHotel = hotelsData[0]
          setSelectedHotelId(firstHotel._id)
          setSelectedHotel(firstHotel)
        }
      } catch (error) {
        console.error("Failed to fetch hotels:", error)
        toast.error("Failed to load hotels")
        setHotels([]) // Set empty array on error
      } finally {
        setHotelsLoading(false)
      }
    }

    fetchHotels()
  }, [getAllHotels])

  // Handle hotel selection
  const handleHotelChange = (hotelId: string) => {
    setSelectedHotelId(hotelId)
    const hotel = hotels.find((h) => h._id === hotelId)
    setSelectedHotel(hotel || null)
  }

  // Filter venues based on search query and filters
  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || venue.type?.toLowerCase() === typeFilter.toLowerCase()
    const matchesStatus = statusFilter === "all" || venue.status === statusFilter

    let matchesCapacity = true
    if (capacityFilter === "small") {
      matchesCapacity = venue.capacity <= 50
    } else if (capacityFilter === "medium") {
      matchesCapacity = venue.capacity > 50 && venue.capacity <= 150
    } else if (capacityFilter === "large") {
      matchesCapacity = venue.capacity > 150
    }

    return matchesSearch && matchesType && matchesStatus && matchesCapacity
  })

  // Get events for a specific venue and date
  const getVenueEvents = (venueId: string, date: Date) => {
    return events.filter(
      (event) => event.venue_id === venueId && new Date(event.start_date).toDateString() === date.toDateString(),
    )
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Maintenance</Badge>
      case "inactive":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Handle venue deletion
  const handleDeleteVenue = async (venueId: string) => {
    if (!confirm("Are you sure you want to delete this venue? This action cannot be undone.")) {
      return
    }

    try {
      setDeleteLoading(venueId)
      await deleteVenue(venueId)
      toast.success("Venue deleted successfully")
    } catch (error) {
      toast.error("Failed to delete venue")
    } finally {
      setDeleteLoading(null)
    }
  }

  // Handle status change
  const handleStatusChange = async (venue: Venue, newStatus: string) => {
    // This would typically call an update function
    toast.info(`Status change to ${newStatus} - Feature coming soon`)
  }

  const loading = venuesLoading // Remove hotelsLoading from here

  return (
    <div className="space-y-6">
      {/* Hotel Selection Section */}
      <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <BuildingIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Select Hotel</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {hotelsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2Icon className="h-6 w-6 animate-spin mr-2" />
              <span>Loading hotels...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Choose Hotel</label>
                <Select value={selectedHotelId} onValueChange={handleHotelChange} disabled={hotelsLoading}>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={hotels.length === 0 ? "No hotels available" : "Select a hotel to manage venues"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.length === 0 ? (
                      <SelectItem value="no-hotels" disabled>
                        No hotels found
                      </SelectItem>
                    ) : (
                      hotels.map((hotel) => (
                        <SelectItem key={hotel._id} value={hotel._id}>
                          <div className="flex items-center space-x-2">
                            <BuildingIcon className="h-4 w-4" />
                            <span>{hotel.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {hotel.code}
                            </Badge>
                            {hotel.isHeadquarters && (
                              <Badge className="text-xs bg-primary/10 text-primary">
                                <StarIcon className="h-3 w-3 mr-1" />
                                HQ
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {hotels.length === 0 && !hotelsLoading && (
                  <p className="text-sm text-muted-foreground">
                    No active hotels found. Please contact your administrator.
                  </p>
                )}
              </div>

              {selectedHotel && (
                <div className="bg-white/50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm">Selected Hotel</h3>
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold">{selectedHotel.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{selectedHotel.code}</Badge>
                      <span>•</span>
                      <span className="capitalize">{selectedHotel.type}</span>
                      {selectedHotel.starRating && (
                        <>
                          <span>•</span>
                          <div className="flex items-center">
                            {Array.from({ length: selectedHotel.starRating }).map((_, i) => (
                              <StarIcon key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {selectedHotel.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{selectedHotel.description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
          <p className="text-muted-foreground">
            {selectedHotel
              ? `Manage event spaces and venues for ${selectedHotel.name}`
              : "Select a hotel to manage venues"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refreshVenues} disabled={!selectedHotelId || venuesLoading}>
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${venuesLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild disabled={!selectedHotelId}>
            <Link href="/dashboard/events/venues/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Venue
            </Link>
          </Button>
        </div>
      </div>

      {!selectedHotelId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <BuildingIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Hotel Selected</h3>
            <p className="text-muted-foreground text-center mb-4">
              Please select a hotel from the dropdown above to view and manage venues.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <CardTitle>All Venues ({filteredVenues.length})</CardTitle>
              <div className="relative w-full md:w-64">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search venues..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {venueTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by capacity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Capacities</SelectItem>
                  <SelectItem value="small">Small (up to 50)</SelectItem>
                  <SelectItem value="medium">Medium (51-150)</SelectItem>
                  <SelectItem value="large">Large (150+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {venuesLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2Icon className="h-6 w-6 animate-spin mr-2" />
                <span>Loading venues...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-32">
                <p className="text-red-600 mb-4">Error loading venues: {error}</p>
                <Button onClick={refreshVenues} variant="outline">
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="hidden md:table-cell">Capacity</TableHead>
                      <TableHead className="hidden md:table-cell">Base Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVenues.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          {venues.length === 0 ? (
                            <div className="flex flex-col items-center">
                              <p className="text-muted-foreground mb-2">No venues found for this hotel.</p>
                              <Button asChild variant="outline">
                                <Link href="/dashboard/events/venues/new">
                                  <PlusIcon className="mr-2 h-4 w-4" />
                                  Create First Venue
                                </Link>
                              </Button>
                            </div>
                          ) : (
                            "No venues match your search criteria."
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVenues.map((venue) => (
                        <TableRow key={venue._id}>
                          <TableCell className="font-medium">{venue.name}</TableCell>
                          <TableCell className="capitalize">{venue.type || "N/A"}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center">
                              <UsersIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                              {venue.capacity || 0}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">${venue.pricing?.base_price || 0}</TableCell>
                          <TableCell>{getStatusBadge(venue.status || "active")}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" disabled={deleteLoading === venue._id}>
                                  {deleteLoading === venue._id ? (
                                    <Loader2Icon className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <MoreHorizontalIcon className="h-4 w-4" />
                                  )}
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setSelectedVenue(venue)}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/dashboard/events/venues/${venue._id}/edit`)}
                                >
                                  Edit Venue
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => router.push(`/dashboard/events/venues/${venue._id}/availability`)}
                                >
                                  Check Availability
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => router.push(`/dashboard/events/venues/${venue._id}/bookings`)}
                                >
                                  View Bookings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {venue.status === "active" ? (
                                  <DropdownMenuItem
                                    className="text-yellow-600"
                                    onClick={() => handleStatusChange(venue, "maintenance")}
                                  >
                                    Set to Maintenance
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    className="text-green-600"
                                    onClick={() => handleStatusChange(venue, "active")}
                                  >
                                    Set to Active
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteVenue(venue._id)}>
                                  Delete Venue
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
            )}
          </CardContent>
        </Card>
      )}

      {/* Venue Details Dialog */}
      {selectedVenue && (
        <Dialog open={!!selectedVenue} onOpenChange={(open) => !open && setSelectedVenue(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedVenue.name}</DialogTitle>
              <DialogDescription>
                {selectedVenue.type} • Capacity: {selectedVenue.capacity} people
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedVenue.description || "No description available"}
                    </p>

                    <h3 className="font-medium mt-4 mb-2">Specifications</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Area:</span>
                        <span>{selectedVenue.area || "N/A"} sq ft</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Base Price:</span>
                        <span>${selectedVenue.pricing?.base_price || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Price Per Hour:</span>
                        <span>${selectedVenue.pricing?.hourly_rate || 0}/hour</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <span>{getStatusBadge(selectedVenue.status || "active")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <img
                      src={selectedVenue.images?.[0] || "/placeholder.svg?height=200&width=400"}
                      alt={selectedVenue.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span>
                          {selectedVenue.location?.floor && `${selectedVenue.location.floor}, `}
                          {selectedVenue.location?.wing || "Location not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="amenities">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedVenue.amenities && selectedVenue.amenities.length > 0 ? (
                    selectedVenue.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center p-2 border rounded-md">
                        <div className="h-2 w-2 rounded-full bg-primary mr-2" />
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-muted-foreground py-8">
                      No amenities listed for this venue
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="availability">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Check Availability</h3>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">
                      Events on {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "selected date"}
                    </h3>
                    {eventsLoading ? (
                      <div className="flex items-center justify-center h-48 border rounded-md">
                        <Loader2Icon className="h-6 w-6 animate-spin" />
                      </div>
                    ) : selectedDate && getVenueEvents(selectedVenue._id, selectedDate).length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 border rounded-md">
                        <CalendarIcon className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No events scheduled for this date.</p>
                        <Button variant="outline" className="mt-4" asChild>
                          <Link href="/dashboard/events/new">
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Create New Event
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedDate &&
                          getVenueEvents(selectedVenue._id, selectedDate).map((event) => (
                            <div key={event._id} className="p-2 border rounded-md">
                              <p className="font-medium">{event.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(event.start_date), "h:mm a")} -{" "}
                                {format(new Date(event.end_date), "h:mm a")}
                              </p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedVenue(null)}>
                Close
              </Button>
              <Button asChild>
                <Link href={`/dashboard/events/venues/${selectedVenue._id}/edit`}>Edit Venue</Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
