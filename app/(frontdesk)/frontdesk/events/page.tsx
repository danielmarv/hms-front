"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  CalendarIcon,
  ClipboardListIcon,
  FilterIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  UsersIcon,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { useEvents } from "@/hooks/use-events"
import { useVenues } from "@/hooks/use-venues"
import { useEventTypes } from "@/hooks/use-event-types"

export default function EventsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedVenue, setSelectedVenue] = useState<string>("all")
  const [selectedEventType, setSelectedEventType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("upcoming")

  // Fetch data using custom hooks
  const { events, loading: eventsLoading } = useEvents()
  const { venues, loading: venuesLoading } = useVenues()
  const { eventTypes, loading: eventTypesLoading } = useEventTypes()

  // Filter events based on search query and filters
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesVenue =
      selectedVenue === "all" ||
      (typeof event.venue_id === "object" ? event.venue_id._id === selectedVenue : event.venue_id === selectedVenue)
    const matchesEventType =
      selectedEventType === "all" ||
      (typeof event.event_type_id === "object"
        ? event.event_type_id._id === selectedEventType
        : event.event_type_id === selectedEventType)
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus

    // For upcoming tab, show events that are today or in the future
    const isUpcoming = activeTab !== "upcoming" || event.start_date >= new Date()

    return matchesSearch && matchesVenue && matchesEventType && matchesStatus && isUpcoming
  })

  // Format date for display
  const formatEventDate = (startDate: Date, endDate: Date) => {
    const sameDay = startDate.toDateString() === endDate.toDateString()

    if (sameDay) {
      return `${format(startDate, "MMM d, yyyy")} · ${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`
    } else {
      return `${format(startDate, "MMM d, yyyy h:mm a")} - ${format(endDate, "MMM d, yyyy h:mm a")}`
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Calendar events for the selected date
  const calendarEvents = events.filter(
    (event) => selectedDate && event.start_date.toDateString() === selectedDate.toDateString(),
  )

  // Loading state
  const isLoading = eventsLoading || venuesLoading || eventTypesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Manage and schedule hotel events</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Event
          </Link>
        </Button>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>Select a date to view events</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />

              <div className="mt-6">
                <h3 className="font-medium mb-2">
                  Events on {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "selected date"}
                </h3>
                {calendarEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events scheduled for this date.</p>
                ) : (
                  <div className="space-y-2">
                    {calendarEvents.map((event) => {
                      const venueName =
                        typeof event.venue_id === "object"
                          ? event.venue_id.name
                          : venues.find((v) => v._id === event.venue_id)?.name || "Unknown Venue"

                      const eventTypeColor =
                        typeof event.event_type_id === "object"
                          ? event.event_type_id.color
                          : eventTypes.find((t) => t._id === event.event_type_id)?.color || "#cccccc"

                      return (
                        <div
                          key={event._id}
                          className="p-2 rounded-md border flex items-start justify-between hover:bg-muted cursor-pointer"
                          onClick={() => router.push(`/dashboard/events/${event._id}`)}
                        >
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(event.start_date, "h:mm a")} - {format(event.end_date, "h:mm a")}
                            </p>
                            <div className="flex items-center mt-1">
                              <MapPinIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{venueName}</p>
                            </div>
                          </div>
                          <div className="w-3 h-3 rounded-full mt-1" style={{ backgroundColor: eventTypeColor }} />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <CardTitle>Event List</CardTitle>
                <div className="relative w-full md:w-64">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search events..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by venue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Venues</SelectItem>
                    {venues.map((venue) => (
                      <SelectItem key={venue._id} value={venue._id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Event Types</SelectItem>
                    {eventTypes.map((type) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="all">All Events</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4">
                  {filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No upcoming events found.</p>
                      <Button variant="outline" className="mt-4" asChild>
                        <Link href="/dashboard/events/new">
                          <PlusIcon className="mr-2 h-4 w-4" />
                          Create New Event
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead className="hidden md:table-cell">Venue</TableHead>
                            <TableHead className="hidden md:table-cell">Date & Time</TableHead>
                            <TableHead className="hidden md:table-cell">Attendees</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEvents.map((event) => {
                            const venueName =
                              typeof event.venue_id === "object"
                                ? event.venue_id.name
                                : venues.find((v) => v._id === event.venue_id)?.name || "Unknown Venue"

                            const eventTypeColor =
                              typeof event.event_type_id === "object"
                                ? event.event_type_id.color
                                : eventTypes.find((t) => t._id === event.event_type_id)?.color || "#cccccc"

                            return (
                              <TableRow key={event._id}>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: eventTypeColor }} />
                                    <div>
                                      <div className="font-medium">{event.title}</div>
                                      <div className="text-xs text-muted-foreground md:hidden">{venueName}</div>
                                      <div className="text-xs text-muted-foreground md:hidden">
                                        {format(event.start_date, "MMM d, yyyy")}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{venueName}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {formatEventDate(event.start_date, event.end_date)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <div className="flex items-center">
                                    <UsersIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                                    {event.attendees}
                                  </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(event.status)}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontalIcon className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem onClick={() => router.push(`/dashboard/events/${event._id}`)}>
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => router.push(`/dashboard/events/${event._id}/edit`)}
                                      >
                                        Edit Event
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => router.push(`/dashboard/events/${event._id}/bookings`)}
                                      >
                                        Manage Bookings
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => router.push(`/dashboard/events/${event._id}/staffing`)}
                                      >
                                        Assign Staff
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600">Cancel Event</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="all" className="space-y-4">
                  {filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <ClipboardListIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No events found matching your filters.</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setSearchQuery("")
                          setSelectedVenue("all")
                          setSelectedEventType("all")
                          setSelectedStatus("all")
                        }}
                      >
                        <FilterIcon className="mr-2 h-4 w-4" />
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead className="hidden md:table-cell">Venue</TableHead>
                            <TableHead className="hidden md:table-cell">Date & Time</TableHead>
                            <TableHead className="hidden md:table-cell">Attendees</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredEvents.map((event) => {
                            const venueName =
                              typeof event.venue_id === "object"
                                ? event.venue_id.name
                                : venues.find((v) => v._id === event.venue_id)?.name || "Unknown Venue"

                            const eventTypeColor =
                              typeof event.event_type_id === "object"
                                ? event.event_type_id.color
                                : eventTypes.find((t) => t._id === event.event_type_id)?.color || "#cccccc"

                            return (
                              <TableRow key={event._id}>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: eventTypeColor }} />
                                    <div>
                                      <div className="font-medium">{event.title}</div>
                                      <div className="text-xs text-muted-foreground md:hidden">{venueName}</div>
                                      <div className="text-xs text-muted-foreground md:hidden">
                                        {format(event.start_date, "MMM d, yyyy")}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{venueName}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {formatEventDate(event.start_date, event.end_date)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <div className="flex items-center">
                                    <UsersIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                                    {event.attendees}
                                  </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(event.status)}</TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontalIcon className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem onClick={() => router.push(`/dashboard/events/${event._id}`)}>
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => router.push(`/dashboard/events/${event._id}/edit`)}
                                      >
                                        Edit Event
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => router.push(`/dashboard/events/${event._id}/bookings`)}
                                      >
                                        Manage Bookings
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => router.push(`/dashboard/events/${event._id}/staffing`)}
                                      >
                                        Assign Staff
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600">Cancel Event</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
