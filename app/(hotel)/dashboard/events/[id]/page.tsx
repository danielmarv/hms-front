"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, MoreHorizontalIcon, EditIcon, TrashIcon, ShareIcon, PrinterIcon, DownloadIcon, Loader2, ArrowLeftIcon, PhoneIcon, MailIcon, DollarSignIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon, ClipboardListIcon } from 'lucide-react'
import { format } from "date-fns"
import { useEvents, type Event } from "@/hooks/use-events"
import { useVenues, type Venue } from "@/hooks/use-venues"
import { useEventTypes, type EventType } from "@/hooks/use-event-types"
import { toast } from "sonner"

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const { getEvent, deleteEvent } = useEvents()
  const { venues } = useVenues()
  const { eventTypes } = useEventTypes()

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        const eventData = await getEvent(eventId)
        setEvent(eventData)
      } catch (error) {
        console.error("Failed to fetch event:", error)
        toast.error("Failed to load event details")
        router.push("/dashboard/events")
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId, getEvent, router])

  const handleDeleteEvent = async () => {
    try {
      setDeleting(true)
      await deleteEvent(eventId)
      toast.success("Event deleted successfully")
      router.push("/dashboard/events")
    } catch (error) {
      console.error("Failed to delete event:", error)
      toast.error("Failed to delete event")
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      // This would call your update event API
      toast.success(`Event status updated to ${newStatus}`)
      if (event) {
        setEvent({ ...event, status: newStatus })
      }
    } catch (error) {
      toast.error("Failed to update event status")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Event not found</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">The event you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Get venue and event type details
  const venue = typeof event.venue_id === "object" 
    ? event.venue_id 
    : venues.find(v => v._id === event.venue_id)

  const eventType = typeof event.event_type_id === "object" 
    ? event.event_type_id 
    : eventTypes.find(t => t._id === event.event_type_id)

  // Format date and time
  const formatEventDateTime = (startDate: Date, endDate: Date) => {
    const sameDay = startDate.toDateString() === endDate.toDateString()
    
    if (sameDay) {
      return {
        date: format(startDate, "EEEE, MMMM d, yyyy"),
        time: `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`
      }
    } else {
      return {
        date: `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`,
        time: `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`
      }
    }
  }

  const { date, time } = formatEventDateTime(event.start_date, event.end_date)

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200">
            <AlertCircleIcon className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      default:
        return <Badge className="dark:bg-slate-700 dark:text-slate-200">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{event.title}</h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">Event Details & Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {getStatusBadge(event.status)}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/events/${eventId}/edit`)}>
                  <EditIcon className="mr-2 h-4 w-4" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ShareIcon className="mr-2 h-4 w-4" />
                  Share Event
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <PrinterIcon className="mr-2 h-4 w-4" />
                  Print Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Export PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleStatusUpdate("confirmed")}>
                  Mark as Confirmed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate("pending")}>
                  Mark as Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate("completed")}>
                  Mark as Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusUpdate("cancelled")}>
                  Mark as Cancelled
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 dark:text-red-400">
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Delete Event
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Event</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this event? This action cannot be undone and will remove all associated bookings and data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteEvent}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete Event"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Overview */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white rounded-t-lg">
                <CardTitle className="text-xl">Event Overview</CardTitle>
                <CardDescription className="text-blue-100 dark:text-blue-200">
                  Complete event information and details
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</p>
                        <p className="text-slate-900 dark:text-slate-100">{date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <ClockIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Time</p>
                        <p className="text-slate-900 dark:text-slate-100">{time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Venue</p>
                        <p className="text-slate-900 dark:text-slate-100">{venue?.name || "Unknown Venue"}</p>
                        {venue?.location && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">{venue.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <UsersIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Expected Attendees</p>
                        <p className="text-slate-900 dark:text-slate-100">{event.attendees} people</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                        style={{ backgroundColor: eventType?.color || "#3b82f6" }}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Event Type</p>
                        <p className="text-slate-900 dark:text-slate-100">{eventType?.name || "Unknown Type"}</p>
                        {eventType?.category && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">{eventType.category}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <ClipboardListIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Visibility</p>
                        <p className="text-slate-900 dark:text-slate-100 capitalize">{event.visibility}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {event.description && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Description</h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{event.description}</p>
                    </div>
                  </>
                )}

                {/* Organizer Info */}
                {event.organizer && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Event Organizer</h3>
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                            {event.organizer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{event.organizer.name}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1">
                              <MailIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                              <span className="text-sm text-slate-600 dark:text-slate-400">{event.organizer.email}</span>
                            </div>
                            {event.organizer.phone && (
                              <div className="flex items-center space-x-1">
                                <PhoneIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">{event.organizer.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Notes */}
                {event.notes && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">Additional Notes</h3>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                        <p className="text-slate-700 dark:text-slate-300">{event.notes}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Tabs for additional information */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <Tabs defaultValue="services" className="w-full">
                <CardHeader className="pb-4">
                  <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-700">
                    <TabsTrigger value="services" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600">
                      Services
                    </TabsTrigger>
                    <TabsTrigger value="staffing" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600">
                      Staffing
                    </TabsTrigger>
                    <TabsTrigger value="bookings" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600">
                      Bookings
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600">
                      Timeline
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent>
                  <TabsContent value="services" className="space-y-4">
                    <div className="text-center py-8">
                      <DollarSignIcon className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">No services configured for this event.</p>
                      <Button variant="outline" className="mt-4">
                        Add Services
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="staffing" className="space-y-4">
                    <div className="text-center py-8">
                      <UsersIcon className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">No staff assigned to this event.</p>
                      <Button variant="outline" className="mt-4">
                        Assign Staff
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="bookings" className="space-y-4">
                    <div className="text-center py-8">
                      <ClipboardListIcon className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">No bookings associated with this event.</p>
                      <Button variant="outline" className="mt-4">
                        View Bookings
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-4">
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-400">Event timeline will be displayed here.</p>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 text-white rounded-t-lg">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href={`/dashboard/events/${eventId}/edit`}>
                    <EditIcon className="mr-2 h-4 w-4" />
                    Edit Event
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href={`/dashboard/events/${eventId}/bookings`}>
                    <ClipboardListIcon className="mr-2 h-4 w-4" />
                    Manage Bookings
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href={`/dashboard/events/${eventId}/staffing`}>
                    <UsersIcon className="mr-2 h-4 w-4" />
                    Assign Staff
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link href={`/dashboard/events/${eventId}/feedback`}>
                    <ClipboardListIcon className="mr-2 h-4 w-4" />
                    View Feedback
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Venue Details */}
            {venue && (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-600 dark:to-indigo-700 text-white rounded-t-lg">
                  <CardTitle className="text-lg">Venue Information</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">{venue.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">{venue.type}</p>
                  </div>
                  
                  {venue.description && (
                    <p className="text-sm text-slate-700 dark:text-slate-300">{venue.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Capacity:</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{venue.capacity} people</span>
                    </div>
                    
                    {venue.area && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Area:</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{venue.area} sq ft</span>
                      </div>
                    )}
                    
                    {venue.pricing && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Base Price:</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {venue.pricing.currency} {venue.pricing.base_price}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {venue.amenities && venue.amenities.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Amenities</h5>
                      <div className="flex flex-wrap gap-1">
                        {venue.amenities.slice(0, 3).map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {venue.amenities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{venue.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/dashboard/events/venues/${venue._id}`}>
                      View Venue Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Event Type Details */}
            {eventType && (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 dark:from-orange-600 dark:to-red-700 text-white rounded-t-lg">
                  <CardTitle className="text-lg">Event Type</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                      style={{ backgroundColor: eventType.color }}
                    />
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{eventType.name}</h4>
                      {eventType.category && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">{eventType.category}</p>
                      )}
                    </div>
                  </div>
                  
                  {eventType.description && (
                    <p className="text-sm text-slate-700 dark:text-slate-300">{eventType.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    {eventType.default_duration && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Default Duration:</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {eventType.default_duration} hours
                        </span>
                      </div>
                    )}
                    
                    {eventType.default_capacity && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Default Capacity:</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {eventType.default_capacity} people
                        </span>
                      </div>
                    )}
                    
                    {eventType.base_price && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Base Price:</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          ${eventType.base_price}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {eventType.features && eventType.features.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Features</h5>
                      <div className="flex flex-wrap gap-1">
                        {eventType.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {eventType.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{eventType.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
