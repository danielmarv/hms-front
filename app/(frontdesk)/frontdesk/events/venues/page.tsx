"use client"

import { useState } from "react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, MapPinIcon, MoreHorizontalIcon, PlusIcon, SearchIcon, UsersIcon } from "lucide-react"
import { format } from "date-fns"

// Mock data for venues
const venues = [
  {
    id: "v001",
    name: "Grand Ballroom",
    type: "Ballroom",
    capacity: 300,
    area: 5000,
    basePrice: 2000,
    pricePerHour: 250,
    status: "active",
    amenities: ["Stage", "Dance Floor", "Projector", "Sound System", "Lighting"],
    description: "Our largest and most elegant venue, perfect for weddings, galas, and large corporate events.",
  },
  {
    id: "v002",
    name: "Garden Terrace",
    type: "Outdoor",
    capacity: 150,
    area: 3000,
    basePrice: 1500,
    pricePerHour: 200,
    status: "active",
    amenities: ["Garden View", "Tent Option", "Outdoor Lighting", "Heaters"],
    description: "Beautiful outdoor space with lush gardens and stunning views, ideal for ceremonies and receptions.",
  },
  {
    id: "v003",
    name: "Crystal Hall",
    type: "Ballroom",
    capacity: 250,
    area: 4000,
    basePrice: 1800,
    pricePerHour: 225,
    status: "active",
    amenities: ["Chandeliers", "Stage", "Dance Floor", "Sound System"],
    description: "Elegant hall with crystal chandeliers and sophisticated decor for upscale events.",
  },
  {
    id: "v004",
    name: "Skyview Lounge",
    type: "Lounge",
    capacity: 80,
    area: 1500,
    basePrice: 1000,
    pricePerHour: 150,
    status: "maintenance",
    amenities: ["Panoramic Views", "Bar", "Lounge Seating", "Sound System"],
    description: "Intimate lounge with panoramic city views, perfect for cocktail parties and small gatherings.",
  },
  {
    id: "v005",
    name: "Executive Boardroom",
    type: "Meeting Room",
    capacity: 20,
    area: 600,
    basePrice: 500,
    pricePerHour: 100,
    status: "active",
    amenities: ["Conference Table", "Projector", "Video Conferencing", "Whiteboard"],
    description: "Professional meeting space equipped with the latest technology for business meetings.",
  },
]

// Mock data for venue types
const venueTypes = [
  { id: "ballroom", name: "Ballroom" },
  { id: "outdoor", name: "Outdoor" },
  { id: "lounge", name: "Lounge" },
  { id: "meeting", name: "Meeting Room" },
  { id: "conference", name: "Conference Room" },
]

// Mock data for events (for availability calendar)
const events = [
  {
    id: "evt001",
    title: "Corporate Conference",
    venue: "v001",
    startDate: new Date("2025-05-15T09:00:00"),
    endDate: new Date("2025-05-15T17:00:00"),
  },
  {
    id: "evt002",
    title: "Wedding Reception",
    venue: "v002",
    startDate: new Date("2025-05-18T16:00:00"),
    endDate: new Date("2025-05-18T23:00:00"),
  },
  {
    id: "evt003",
    title: "Product Launch",
    venue: "v001",
    startDate: new Date("2025-05-20T14:00:00"),
    endDate: new Date("2025-05-20T18:00:00"),
  },
]

export default function VenuesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [capacityFilter, setCapacityFilter] = useState("all")
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Filter venues based on search query and filters
  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || venue.type.toLowerCase() === typeFilter.toLowerCase()
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

  // Get venue details by ID
  const getVenueById = (id: string) => {
    return venues.find((venue) => venue.id === id)
  }

  // Get events for a specific venue and date
  const getVenueEvents = (venueId: string, date: Date) => {
    return events.filter((event) => event.venue === venueId && event.startDate.toDateString() === date.toDateString())
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
          <p className="text-muted-foreground">Manage event spaces and venues</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/venues/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Venue
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>All Venues</CardTitle>
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
                      No venues found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVenues.map((venue) => (
                    <TableRow key={venue.id}>
                      <TableCell className="font-medium">{venue.name}</TableCell>
                      <TableCell>{venue.type}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <UsersIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                          {venue.capacity}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">${venue.basePrice}</TableCell>
                      <TableCell>{getStatusBadge(venue.status)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontalIcon className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onClick={() => setSelectedVenue(venue.id)}>
                                  View Details
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/events/venues/${venue.id}/edit`)}
                              >
                                Edit Venue
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/events/venues/${venue.id}/availability`)}
                              >
                                Check Availability
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/events/venues/${venue.id}/bookings`)}
                              >
                                View Bookings
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {venue.status === "active" ? (
                                <DropdownMenuItem className="text-yellow-600">Set to Maintenance</DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem className="text-green-600">Set to Active</DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-600">Delete Venue</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Venue Details Dialog */}
      {selectedVenue && (
        <Dialog open={!!selectedVenue} onOpenChange={(open) => !open && setSelectedVenue(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{getVenueById(selectedVenue)?.name}</DialogTitle>
              <DialogDescription>
                {getVenueById(selectedVenue)?.type} • Capacity: {getVenueById(selectedVenue)?.capacity} people
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
                    <p className="text-sm text-muted-foreground">{getVenueById(selectedVenue)?.description}</p>

                    <h3 className="font-medium mt-4 mb-2">Specifications</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Area:</span>
                        <span>{getVenueById(selectedVenue)?.area} sq ft</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Base Price:</span>
                        <span>${getVenueById(selectedVenue)?.basePrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Price Per Hour:</span>
                        <span>${getVenueById(selectedVenue)?.pricePerHour}/hour</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <span>{getStatusBadge(getVenueById(selectedVenue)?.status || "")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <img
                      src="/placeholder.svg?height=200&width=400"
                      alt={getVenueById(selectedVenue)?.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span>Floor 2, East Wing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="amenities">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {getVenueById(selectedVenue)?.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center p-2 border rounded-md">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
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
                    {selectedDate && getVenueEvents(selectedVenue, selectedDate).length === 0 ? (
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
                          getVenueEvents(selectedVenue, selectedDate).map((event) => (
                            <div key={event.id} className="p-2 border rounded-md">
                              <p className="font-medium">{event.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(event.startDate, "h:mm a")} - {format(event.endDate, "h:mm a")}
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
                <Link href={`/dashboard/events/venues/${selectedVenue}/edit`}>Edit Venue</Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
