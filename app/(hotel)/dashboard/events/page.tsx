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
import { CalendarIcon, ClipboardListIcon, FilterIcon, MapPinIcon, MoreHorizontalIcon, PlusIcon, SearchIcon, UsersIcon, Loader2 } from 'lucide-react'
import { format } from "date-fns"
import { useEvents } from "@/hooks/use-events"
import { useVenues } from "@/hooks/use-venues"
import { useEventTypes } from "@/hooks/use-event-types"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export default function EventsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedVenue, setSelectedVenue] = useState<string>("all")
  const [selectedEventType, setSelectedEventType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("upcoming")
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)

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
    // For all tab, show all events regardless of date
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Set to start of today
    const eventDate = new Date(event.start_date)
    eventDate.setHours(0, 0, 0, 0) // Set to start of event date
    
    const isUpcoming = activeTab === "all" || eventDate >= now

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
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">
            Confirmed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200">
            Pending
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200">
            Cancelled
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200">
            Completed
          </Badge>
        )
      default:
        return <Badge className="dark:bg-slate-700 dark:text-slate-200">{status}</Badge>
    }
  }

  // Calendar events for the selected date
  const calendarEvents = events.filter(
    (event) => selectedDate && event.start_date.toDateString() === selectedDate.toDateString(),
  )

  // Get dates that have events for calendar highlighting
  const eventDates = events.map((event) => event.start_date)

  // Function to check if a date has events
  const hasEvents = (date: Date) => {
    return events.some(
      (event) =>
        event.start_date.toDateString() === date.toDateString() ||
        (event.end_date.toDateString() !== event.start_date.toDateString() &&
          date >= event.start_date &&
          date <= event.end_date),
    )
  }

  // Custom day content for calendar highlighting
  const dayContent = (date: Date) => {
    const hasEvent = hasEvents(date)
    const dayEvents = events.filter((event) => event.start_date.toDateString() === date.toDateString())

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span className={`${hasEvent ? "font-bold" : ""}`}>{date.getDate()}</span>
        {hasEvent && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-0.5">
              {dayEvents.slice(0, 3).map((event, index) => {
                const eventTypeColor =
                  typeof event.event_type_id === "object"
                    ? event.event_type_id.color
                    : eventTypes.find((t) => t._id === event.event_type_id)?.color || "#3b82f6"

                return (
                  <div key={index} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: eventTypeColor }} />
                )
              })}
              {dayEvents.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Loading state
  const isLoading = eventsLoading || venuesLoading || eventTypesLoading

  // Bulk action functions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEvents(filteredEvents.map(event => event._id))
    } else {
      setSelectedEvents([])
    }
  }

  const handleSelectEvent = (eventId: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents(prev => [...prev, eventId])
    } else {
      setSelectedEvents(prev => prev.filter(id => id !== eventId))
    }
  }

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      // This would call your bulk update API
      toast.success(`Updated ${selectedEvents.length} events to ${status}`)
      setSelectedEvents([])
      setShowBulkActions(false)
    } catch (error) {
      toast.error("Failed to update events")
    }
  }

  const handleBulkDelete = async () => {
    try {
      // This would call your bulk delete API
      toast.success(`Deleted ${selectedEvents.length} events`)
      setSelectedEvents([])
      setShowBulkActions(false)
    } catch (error) {
      toast.error("Failed to delete events")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Events Management
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">Manage and schedule hotel events</p>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 dark:from-emerald-600 dark:to-teal-700 dark:hover:from-emerald-700 dark:hover:to-teal-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            <Link href="/dashboard/events/new">
              <PlusIcon className="mr-2 h-5 w-5" />
              New Event
            </Link>
          </Button>
        </div>

        {/* Event Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Events</p>
                  <p className="text-3xl font-bold">{events.length}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Upcoming Events</p>
                  <p className="text-3xl font-bold">
                    {events.filter(event => {
                      const now = new Date()
                      now.setHours(0, 0, 0, 0)
                      const eventDate = new Date(event.start_date)
                      eventDate.setHours(0, 0, 0, 0)
                      return eventDate >= now
                    }).length}
                  </p>
                </div>
                <ClipboardListIcon className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">This Month</p>
                  <p className="text-3xl font-bold">
                    {events.filter(event => {
                      const now = new Date()
                      const eventDate = new Date(event.start_date)
                      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
                <UsersIcon className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Confirmed</p>
                  <p className="text-3xl font-bold">
                    {events.filter(event => event.status === 'confirmed').length}
                  </p>
                </div>
                <MapPinIcon className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-6 lg:space-y-0">
          {/* Calendar Section */}
          <div className="lg:w-1/3">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 text-white rounded-t-lg">
                <CardTitle className="text-xl">Event Calendar</CardTitle>
                <CardDescription className="text-purple-100 dark:text-purple-200">
                  Select a date to view events
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-lg border-2 border-slate-200 dark:border-slate-600"
                  components={{
                    DayContent: ({ date }) => dayContent(date),
                  }}
                  modifiers={{
                    hasEvents: (date) => hasEvents(date),
                  }}
                  modifiersStyles={{
                    hasEvents: {
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      borderRadius: "6px",
                    },
                  }}
                />

                <div className="mt-6">
                  <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-200">
                    Events on {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "selected date"}
                  </h3>
                  {calendarEvents.length === 0 ? (
                    <div className="text-center py-6">
                      <CalendarIcon className="h-8 w-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">No events scheduled for this date.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {calendarEvents.map((event) => {
                        const venueName =
                          typeof event.venue_id === "object"
                            ? event.venue_id.name
                            : venues.find((v) => v._id === event.venue_id)?.name || "Unknown Venue"

                        const eventTypeColor =
                          typeof event.event_type_id === "object"
                            ? event.event_type_id.color
                            : eventTypes.find((t) => t._id === event.event_type_id)?.color || "#3b82f6"

                        return (
                          <div
                            key={event._id}
                            className="p-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]"
                            onClick={() => router.push(`/dashboard/events/${event._id}`)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{event.title}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  {format(event.start_date, "h:mm a")} - {format(event.end_date, "h:mm a")}
                                </p>
                                <div className="flex items-center mt-2">
                                  <MapPinIcon className="h-3 w-3 mr-1 text-slate-500 dark:text-slate-400" />
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{venueName}</p>
                                </div>
                                <div className="flex items-center mt-1">
                                  <UsersIcon className="h-3 w-3 mr-1 text-slate-500 dark:text-slate-400" />
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {event.attendees} attendees
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <div
                                  className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                                  style={{ backgroundColor: eventTypeColor }}
                                />
                                {getStatusBadge(event.status)}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events List Section */}
          <div className="lg:w-2/3">
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white rounded-t-lg">
                <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                  <CardTitle className="text-xl">Event List</CardTitle>
                  <div className="relative w-full md:w-64">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      type="search"
                      placeholder="Search events..."
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-300 focus:bg-white/20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                    <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-white/20 text-white">
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
                    <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-white/20 text-white">
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
                    <SelectTrigger className="w-full md:w-[180px] bg-white/10 border-white/20 text-white">
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
              <CardContent className="p-0">
                {selectedEvents.length > 0 && (
                  <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {selectedEvents.length} event{selectedEvents.length > 1 ? 's' : ''} selected
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEvents([])}
                          className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-800"
                        >
                          Clear Selection
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select onValueChange={handleBulkStatusUpdate}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmed">Mark as Confirmed</SelectItem>
                            <SelectItem value="pending">Mark as Pending</SelectItem>
                            <SelectItem value="cancelled">Mark as Cancelled</SelectItem>
                            <SelectItem value="completed">Mark as Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Delete Selected
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Events</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {selectedEvents.length} selected event{selectedEvents.length > 1 ? 's' : ''}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                )}
                <Tabs defaultValue="upcoming" onValueChange={setActiveTab} className="w-full">
                  <div className="px-6 pt-6">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-700">
                      <TabsTrigger
                        value="upcoming"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600"
                      >
                        Upcoming Events
                      </TabsTrigger>
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600"
                      >
                        All Events
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="upcoming" className="mt-6">
                    {filteredEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full p-6 mb-4">
                          <CalendarIcon className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                          No upcoming events found.
                        </p>
                        <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                          Create your first event to get started
                        </p>
                        <Button
                          variant="outline"
                          className="mt-6 border-2 hover:bg-blue-50 dark:hover:bg-blue-900"
                          asChild
                        >
                          <Link href="/dashboard/events/new">
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Create New Event
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600">
                              <TableHead className="w-12">
                                <Checkbox
                                  checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                                  onCheckedChange={handleSelectAll}
                                />
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Event</TableHead>
                              <TableHead className="hidden md:table-cell font-semibold text-slate-700 dark:text-slate-200">
                                Venue
                              </TableHead>
                              <TableHead className="hidden md:table-cell font-semibold text-slate-700 dark:text-slate-200">
                                Date & Time
                              </TableHead>
                              <TableHead className="hidden md:table-cell font-semibold text-slate-700 dark:text-slate-200">
                                Attendees
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Status</TableHead>
                              <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredEvents.map((event, index) => {
                              const venueName =
                                typeof event.venue_id === "object"
                                  ? event.venue_id.name
                                  : venues.find((v) => v._id === event.venue_id)?.name || "Unknown Venue"

                              const eventTypeColor =
                                typeof event.event_type_id === "object"
                                  ? event.event_type_id.color
                                  : eventTypes.find((t) => t._id === event.event_type_id)?.color || "#3b82f6"

                              return (
                                <TableRow
                                  key={event._id}
                                  className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                                    index % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-25 dark:bg-slate-750"
                                  }`}
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedEvents.includes(event._id)}
                                      onCheckedChange={(checked) => handleSelectEvent(event._id, checked as boolean)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-3">
                                      <div
                                        className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0"
                                        style={{ backgroundColor: eventTypeColor }}
                                      />
                                      <div>
                                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                                          {event.title}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 md:hidden">
                                          {venueName}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 md:hidden">
                                          {format(event.start_date, "MMM d, yyyy")}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell text-slate-700 dark:text-slate-300">
                                    {venueName}
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell text-slate-700 dark:text-slate-300">
                                    {formatEventDate(event.start_date, event.end_date)}
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <div className="flex items-center text-slate-700 dark:text-slate-300">
                                      <UsersIcon className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                                      {event.attendees}
                                    </div>
                                  </TableCell>
                                  <TableCell>{getStatusBadge(event.status)}</TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="hover:bg-slate-100 dark:hover:bg-slate-600"
                                        >
                                          <MoreHorizontalIcon className="h-4 w-4" />
                                          <span className="sr-only">Actions</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
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
                                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                          Cancel Event
                                        </DropdownMenuItem>
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

                  <TabsContent value="all" className="mt-6">
                    {filteredEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full p-6 mb-4">
                          <ClipboardListIcon className="h-12 w-12 text-slate-600 dark:text-slate-400" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
                          No events found matching your filters.
                        </p>
                        <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                          Try adjusting your search criteria
                        </p>
                        <Button
                          variant="outline"
                          className="mt-6 border-2 hover:bg-slate-50 dark:hover:bg-slate-700"
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
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600">
                              <TableHead className="w-12">
                                <Checkbox
                                  checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                                  onCheckedChange={handleSelectAll}
                                />
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Event</TableHead>
                              <TableHead className="hidden md:table-cell font-semibold text-slate-700 dark:text-slate-200">
                                Venue
                              </TableHead>
                              <TableHead className="hidden md:table-cell font-semibold text-slate-700 dark:text-slate-200">
                                Date & Time
                              </TableHead>
                              <TableHead className="hidden md:table-cell font-semibold text-slate-700 dark:text-slate-200">
                                Attendees
                              </TableHead>
                              <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Status</TableHead>
                              <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredEvents.map((event, index) => {
                              const venueName =
                                typeof event.venue_id === "object"
                                  ? event.venue_id.name
                                  : venues.find((v) => v._id === event.venue_id)?.name || "Unknown Venue"

                              const eventTypeColor =
                                typeof event.event_type_id === "object"
                                  ? event.event_type_id.color
                                  : eventTypes.find((t) => t._id === event.event_type_id)?.color || "#3b82f6"

                              return (
                                <TableRow
                                  key={event._id}
                                  className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                                    index % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-25 dark:bg-slate-750"
                                  }`}
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedEvents.includes(event._id)}
                                      onCheckedChange={(checked) => handleSelectEvent(event._id, checked as boolean)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-3">
                                      <div
                                        className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-700 shadow-sm flex-shrink-0"
                                        style={{ backgroundColor: eventTypeColor }}
                                      />
                                      <div>
                                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                                          {event.title}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 md:hidden">
                                          {venueName}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 md:hidden">
                                          {format(event.start_date, "MMM d, yyyy")}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell text-slate-700 dark:text-slate-300">
                                    {venueName}
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell text-slate-700 dark:text-slate-300">
                                    {formatEventDate(event.start_date, event.end_date)}
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <div className="flex items-center text-slate-700 dark:text-slate-300">
                                      <UsersIcon className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                                      {event.attendees}
                                    </div>
                                  </TableCell>
                                  <TableCell>{getStatusBadge(event.status)}</TableCell>
                                  <TableCell className="text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="hover:bg-slate-100 dark:hover:bg-slate-600"
                                        >
                                          <MoreHorizontalIcon className="h-4 w-4" />
                                          <span className="sr-only">Actions</span>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
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
                                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                          Cancel Event
                                        </DropdownMenuItem>
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
    </div>
  )
}
