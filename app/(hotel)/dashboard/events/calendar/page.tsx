"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useEventCalendar } from "@/hooks/use-event-calendar"
import { useVenues } from "@/hooks/use-venues"
import { useEventTypes } from "@/hooks/use-event-types"
import { useCurrentHotel } from "@/hooks/use-current-hotel"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Download,
  CalendarIcon,
  Filter,
  X,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
} from "lucide-react"
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  getWeek,
  getYear,
} from "date-fns"

export default function EventCalendarPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { currentHotel } = useCurrentHotel()

  // Calendar hook
  const {
    events,
    settings,
    loading,
    error,
    getCalendarEvents,
    getMonthlyEvents,
    getWeeklyEvents,
    getDailyEvents,
    getConflicts,
    getVenueCalendar,
    exportToICalendar,
    exportToGoogleCalendar,
    getCalendarSettings,
    updateCalendarSettings,
    clearError,
  } = useEventCalendar(currentHotel?.id)

  // Other hooks
  const { venues, fetchVenues } = useVenues(currentHotel?.id)
  const { eventTypes, fetchEventTypes } = useEventTypes(currentHotel?.id)

  // State
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState("month")
  const [selectedVenue, setSelectedVenue] = useState("all")
  const [selectedEventType, setSelectedEventType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showConflicts, setShowConflicts] = useState(false)
  const [conflicts, setConflicts] = useState<any[]>([])
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])

  // Load initial data
  useEffect(() => {
    if (currentHotel?.id) {
      fetchVenues()
      fetchEventTypes()
      loadCalendarEvents()
    }
  }, [currentHotel?.id, currentDate, view, selectedVenue, selectedEventType, selectedStatus])

  // Load calendar events based on current view
  const loadCalendarEvents = async () => {
    if (!currentHotel?.id) return

    try {
      const filters = {
        venueId: selectedVenue !== "all" ? selectedVenue : undefined,
        eventTypeId: selectedEventType !== "all" ? selectedEventType : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      }

      let eventsData
      if (view === "month") {
        eventsData = await getMonthlyEvents(getYear(currentDate), currentDate.getMonth() + 1, filters)
        setCalendarEvents(eventsData?.events || [])
      } else if (view === "week") {
        eventsData = await getWeeklyEvents(getYear(currentDate), getWeek(currentDate), filters)
        setCalendarEvents(eventsData?.events || [])
      } else if (view === "day") {
        eventsData = await getDailyEvents(currentDate, filters)
        setCalendarEvents(eventsData?.events || [])
      }
    } catch (error) {
      console.error("Error loading calendar events:", error)
      toast({
        title: "Error",
        description: "Failed to load calendar events",
        variant: "destructive",
      })
    }
  }

  // Check for conflicts
  const checkConflicts = async () => {
    if (!currentHotel?.id) return

    try {
      const startDate = view === "month" ? startOfMonth(currentDate) : startOfWeek(currentDate)
      const endDate = view === "month" ? endOfMonth(currentDate) : endOfWeek(currentDate)

      const conflictData = await getConflicts(startDate, endDate, selectedVenue !== "all" ? selectedVenue : undefined)
      setConflicts(conflictData)
      setShowConflicts(true)
    } catch (error) {
      console.error("Error checking conflicts:", error)
      toast({
        title: "Error",
        description: "Failed to check conflicts",
        variant: "destructive",
      })
    }
  }

  // Export functions
  const handleExportICalendar = async () => {
    try {
      const startDate = view === "month" ? startOfMonth(currentDate) : startOfWeek(currentDate)
      const endDate = view === "month" ? endOfMonth(currentDate) : endOfWeek(currentDate)

      const success = await exportToICalendar({
        startDate,
        endDate,
        venueId: selectedVenue !== "all" ? selectedVenue : undefined,
        eventTypeId: selectedEventType !== "all" ? selectedEventType : undefined,
      })

      if (success) {
        toast({
          title: "Success",
          description: "Calendar exported successfully",
        })
      }
    } catch (error) {
      console.error("Error exporting calendar:", error)
      toast({
        title: "Error",
        description: "Failed to export calendar",
        variant: "destructive",
      })
    }
  }

  // Generate calendar days for month view
  const generateMonthDays = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const days = []
    let day = startDate

    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }

  // Generate week days
  const generateWeekDays = () => {
    const weekStart = startOfWeek(currentDate)
    const weekEnd = endOfWeek(currentDate)

    const days = []
    let day = weekStart

    while (day <= weekEnd) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }

  // Generate hours for day view
  const generateDayHours = () => {
    const startHour = settings?.start_time ? Number.parseInt(settings.start_time.split(":")[0]) : 7
    const endHour = settings?.end_time ? Number.parseInt(settings.end_time.split(":")[0]) : 22

    const hours = []
    for (let i = startHour; i <= endHour; i++) {
      hours.push(i)
    }
    return hours
  }

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return calendarEvents.filter((event) => isSameDay(new Date(event.start), day))
  }

  // Get events for a specific hour
  const getEventsForHour = (day: Date, hour: number) => {
    return calendarEvents.filter((event) => {
      const eventStart = new Date(event.start)
      const eventEnd = new Date(event.end)
      return isSameDay(eventStart, day) && eventStart.getHours() <= hour && eventEnd.getHours() > hour
    })
  }

  // Navigation functions
  const navigatePrevious = () => {
    if (view === "month") {
      setCurrentDate(subMonths(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1))
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, -1))
    }
  }

  const navigateNext = () => {
    if (view === "month") {
      setCurrentDate(addMonths(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1))
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, 1))
    }
  }

  const navigateToday = () => {
    setCurrentDate(new Date())
  }

  // Get event color based on status
  const getEventColor = (status: string) => {
    if (settings?.event_colors) {
      return settings.event_colors[status as keyof typeof settings.event_colors] || "#3498db"
    }

    const defaultColors = {
      confirmed: "#22c55e",
      pending: "#f59e0b",
      cancelled: "#ef4444",
      completed: "#8b5cf6",
    }

    return defaultColors[status as keyof typeof defaultColors] || "#3498db"
  }

  // Format time based on settings
  const formatTime = (date: Date) => {
    const format24 = settings?.time_format === "24h"
    return format24 ? format(date, "HH:mm") : format(date, "h:mm a")
  }

  if (loading && !calendarEvents.length) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Event Calendar</h1>
            <p className="text-muted-foreground">Loading calendar...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="h-24 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Calendar</h1>
          <p className="text-muted-foreground">
            {currentHotel ? `${currentHotel.name} - Event Schedule` : "View and manage scheduled events"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" onClick={checkConflicts}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Check Conflicts
          </Button>
          <Button variant="outline" onClick={handleExportICalendar}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button onClick={() => router.push("/dashboard/events/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="venue-filter">Venue</Label>
                <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Venues" />
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
              </div>
              <div>
                <Label htmlFor="event-type-filter">Event Type</Label>
                <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {eventTypes.map((type) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={navigatePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={navigateToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={navigateNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <CardTitle>
                {view === "month" && format(currentDate, "MMMM yyyy")}
                {view === "week" &&
                  `Week of ${format(startOfWeek(currentDate), "MMM d")} - ${format(endOfWeek(currentDate), "MMM d, yyyy")}`}
                {view === "day" && format(currentDate, "EEEE, MMMM d, yyyy")}
              </CardTitle>
            </div>
            <Tabs value={view} onValueChange={setView} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {/* Month View */}
          {view === "month" && (
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center font-medium text-sm">
                  {day}
                </div>
              ))}
              {generateMonthDays().map((day, i) => {
                const dayEvents = getEventsForDay(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isToday = isSameDay(day, new Date())

                return (
                  <div
                    key={i}
                    className={`min-h-[100px] border p-1 cursor-pointer hover:bg-muted/50 transition-colors ${
                      isCurrentMonth ? "" : "bg-muted/20 text-muted-foreground"
                    } ${isToday ? "bg-blue-50 border-blue-200" : ""}`}
                    onClick={() => {
                      setCurrentDate(day)
                      setView("day")
                    }}
                  >
                    <div className="text-right text-sm font-medium p-1">{format(day, "d")}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                          style={{
                            backgroundColor: `${getEventColor(event.extendedProps.status)}20`,
                            borderLeft: `3px solid ${getEventColor(event.extendedProps.status)}`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/events/${event.id}`)
                          }}
                        >
                          <div className="font-medium">{event.title}</div>
                          <div className="text-muted-foreground">{formatTime(new Date(event.start))}</div>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-center text-muted-foreground py-1">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Week View */}
          {view === "week" && (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-8 min-w-[800px]">
                <div className="border-b p-2"></div>
                {generateWeekDays().map((day, i) => {
                  const isToday = isSameDay(day, new Date())
                  return (
                    <div key={i} className={`border-b p-2 text-center ${isToday ? "bg-blue-50" : ""}`}>
                      <div className="font-medium">{format(day, "EEE")}</div>
                      <div className="text-sm text-muted-foreground">{format(day, "MMM d")}</div>
                    </div>
                  )
                })}

                {generateDayHours().map((hour) => (
                  <React.Fragment key={hour}>
                    <div className="border-r border-b p-2 text-right text-sm text-muted-foreground">
                      {formatTime(new Date().setHours(hour, 0, 0, 0))}
                    </div>
                    {generateWeekDays().map((day, dayIndex) => {
                      const hourEvents = getEventsForHour(day, hour)
                      const isToday = isSameDay(day, new Date())

                      return (
                        <div
                          key={dayIndex}
                          className={`border-r border-b p-1 relative min-h-[60px] ${isToday ? "bg-blue-50" : ""}`}
                        >
                          {hourEvents.map((event) => (
                            <div
                              key={event.id}
                              className="text-xs p-1 mb-1 rounded truncate cursor-pointer hover:opacity-80"
                              style={{
                                backgroundColor: `${getEventColor(event.extendedProps.status)}20`,
                                borderLeft: `3px solid ${getEventColor(event.extendedProps.status)}`,
                              }}
                              onClick={() => router.push(`/dashboard/events/${event.id}`)}
                            >
                              <div className="font-medium">{event.title}</div>
                              <div className="text-muted-foreground">{formatTime(new Date(event.start))}</div>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Day View */}
          {view === "day" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-lg">{format(currentDate, "EEEE, MMMM d, yyyy")}</h3>
                <Badge variant="outline">{getEventsForDay(currentDate).length} events</Badge>
              </div>

              <ScrollArea className="h-[600px]">
                {generateDayHours().map((hour) => {
                  const hourEvents = getEventsForHour(currentDate, hour)

                  return (
                    <div key={hour} className="grid grid-cols-12 gap-2 border-b py-2">
                      <div className="col-span-1 text-right text-sm text-muted-foreground pt-1">
                        {formatTime(new Date().setHours(hour, 0, 0, 0))}
                      </div>
                      <div className="col-span-11">
                        {hourEvents.length === 0 ? (
                          <div className="h-12 border border-dashed rounded-md"></div>
                        ) : (
                          <div className="space-y-2">
                            {hourEvents.map((event) => (
                              <div
                                key={event.id}
                                className="p-3 rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                                style={{
                                  backgroundColor: `${getEventColor(event.extendedProps.status)}20`,
                                  borderLeft: `4px solid ${getEventColor(event.extendedProps.status)}`,
                                }}
                                onClick={() => router.push(`/dashboard/events/${event.id}`)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{event.title}</div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                                      </div>
                                      {event.extendedProps.venue && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          {event.extendedProps.venue}
                                        </div>
                                      )}
                                      {event.extendedProps.staffCount && (
                                        <div className="flex items-center gap-1">
                                          <Users className="h-3 w-3" />
                                          {event.extendedProps.staffCount} staff
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="ml-2"
                                    style={{
                                      borderColor: getEventColor(event.extendedProps.status),
                                      color: getEventColor(event.extendedProps.status),
                                    }}
                                  >
                                    {event.extendedProps.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Calendar Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="default-view">Default View</Label>
              <Select
                value={settings?.default_view || "month"}
                onValueChange={(value) => updateCalendarSettings({ ...settings, default_view: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="time-format">Time Format</Label>
              <Select
                value={settings?.time_format || "12h"}
                onValueChange={(value) => updateCalendarSettings({ ...settings, time_format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour</SelectItem>
                  <SelectItem value="24h">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  type="time"
                  value={settings?.start_time || "07:00"}
                  onChange={(e) => updateCalendarSettings({ ...settings, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  type="time"
                  value={settings?.end_time || "22:00"}
                  onChange={(e) => updateCalendarSettings({ ...settings, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-weekends">Show Weekends</Label>
              <Switch
                checked={settings?.show_weekends ?? true}
                onCheckedChange={(checked) => updateCalendarSettings({ ...settings, show_weekends: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-reminders">Email Reminders</Label>
              <Switch
                checked={settings?.notifications?.email_reminders ?? false}
                onCheckedChange={(checked) =>
                  updateCalendarSettings({
                    ...settings,
                    notifications: { ...settings?.notifications, email_reminders: checked },
                  })
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Conflicts Dialog */}
      <Dialog open={showConflicts} onOpenChange={setShowConflicts}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Conflicts</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            {conflicts.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No conflicts found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {conflicts.map((conflict, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{conflict.venue.name}</h4>
                          <p className="text-sm text-muted-foreground">Capacity: {conflict.venue.capacity}</p>
                        </div>
                        <Badge variant="destructive">{conflict.conflicts.length} conflicts</Badge>
                      </div>
                      <Separator className="my-2" />
                      <div className="space-y-2">
                        {conflict.conflicts.map((item: any, i: number) => (
                          <div key={i} className="text-sm">
                            <div className="font-medium">{item.title}</div>
                            <div className="text-muted-foreground">
                              {format(new Date(item.start), "MMM d, h:mm a")} - {format(new Date(item.end), "h:mm a")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
