"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
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
} from "date-fns"

// Mock data for events
const events = [
  {
    id: "evt001",
    title: "Corporate Conference",
    eventType: { id: "et001", name: "Conference", color: "#3498db" },
    venue: { id: "v001", name: "Grand Ballroom" },
    startDate: new Date("2025-05-15T09:00:00"),
    endDate: new Date("2025-05-15T17:00:00"),
    status: "confirmed",
    attendees: 120,
  },
  {
    id: "evt002",
    title: "Wedding Reception",
    eventType: { id: "et002", name: "Wedding", color: "#e74c3c" },
    venue: { id: "v002", name: "Garden Terrace" },
    startDate: new Date("2025-05-18T16:00:00"),
    endDate: new Date("2025-05-18T23:00:00"),
    status: "confirmed",
    attendees: 80,
  },
  {
    id: "evt003",
    title: "Product Launch",
    eventType: { id: "et003", name: "Corporate", color: "#2ecc71" },
    venue: { id: "v001", name: "Grand Ballroom" },
    startDate: new Date("2025-05-20T14:00:00"),
    endDate: new Date("2025-05-20T18:00:00"),
    status: "pending",
    attendees: 150,
  },
  {
    id: "evt004",
    title: "Charity Gala",
    eventType: { id: "et004", name: "Gala", color: "#9b59b6" },
    venue: { id: "v003", name: "Crystal Hall" },
    startDate: new Date("2025-05-22T19:00:00"),
    endDate: new Date("2025-05-22T23:30:00"),
    status: "confirmed",
    attendees: 200,
  },
  {
    id: "evt005",
    title: "Birthday Celebration",
    eventType: { id: "et005", name: "Birthday", color: "#f39c12" },
    venue: { id: "v004", name: "Skyview Lounge" },
    startDate: new Date("2025-05-25T18:00:00"),
    endDate: new Date("2025-05-25T22:00:00"),
    status: "confirmed",
    attendees: 40,
  },
]

// Mock data for venues
const venues = [
  { id: "all", name: "All Venues" },
  { id: "v001", name: "Grand Ballroom", capacity: 300 },
  { id: "v002", name: "Garden Terrace", capacity: 150 },
  { id: "v003", name: "Crystal Hall", capacity: 250 },
  { id: "v004", name: "Skyview Lounge", capacity: 80 },
  { id: "v005", name: "Executive Boardroom", capacity: 20 },
]

export default function EventCalendarPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedVenue, setSelectedVenue] = useState("all")
  const [view, setView] = useState("month")

  // Filter events based on selected venue
  const filteredEvents = events.filter((event) => selectedVenue === "all" || event.venue.id === selectedVenue)

  // Generate days for month view
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

  // Generate days for week view
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
    const hours = []
    for (let i = 7; i < 22; i++) {
      hours.push(i)
    }
    return hours
  }

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((event) => isSameDay(event.startDate, day))
  }

  // Get events for a specific hour
  const getEventsForHour = (day: Date, hour: number) => {
    return filteredEvents.filter(
      (event) =>
        isSameDay(event.startDate, day) && event.startDate.getHours() <= hour && event.endDate.getHours() > hour,
    )
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Calendar</h1>
          <p className="text-muted-foreground">View and manage scheduled events</p>
        </div>
        <Button asChild>
          <a href="/dashboard/events/new">
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </a>
        </Button>
      </div>

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
            <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
              <Tabs value={view} onValueChange={setView} className="w-full md:w-auto">
                <TabsList>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="day">Day</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={selectedVenue} onValueChange={setSelectedVenue}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Month View */}
          {view === "month" && (
            <div className="grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center font-medium">
                  {day}
                </div>
              ))}
              {generateMonthDays().map((day, i) => {
                const dayEvents = getEventsForDay(day)
                const isCurrentMonth = isSameMonth(day, currentDate)

                return (
                  <div
                    key={i}
                    className={`min-h-[100px] border p-1 ${isCurrentMonth ? "" : "bg-muted/20 text-muted-foreground"} ${isSameDay(day, new Date()) ? "bg-blue-50" : ""}`}
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
                          className="text-xs p-1 rounded truncate cursor-pointer"
                          style={{
                            backgroundColor: `${event.eventType.color}20`,
                            borderLeft: `3px solid ${event.eventType.color}`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/events/${event.id}`)
                          }}
                        >
                          {format(event.startDate, "h:mm a")} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-center text-muted-foreground">+{dayEvents.length - 3} more</div>
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
                {generateWeekDays().map((day, i) => (
                  <div key={i} className={`border-b p-2 text-center ${isSameDay(day, new Date()) ? "bg-blue-50" : ""}`}>
                    <div className="font-medium">{format(day, "EEE")}</div>
                    <div className="text-sm">{format(day, "MMM d")}</div>
                  </div>
                ))}

                {generateDayHours().map((hour) => (
                  <React.Fragment key={hour}>
                    <div className="border-r border-b p-2 text-right text-sm text-muted-foreground">
                      {hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                    </div>
                    {generateWeekDays().map((day, dayIndex) => {
                      const hourEvents = getEventsForHour(day, hour)

                      return (
                        <div
                          key={dayIndex}
                          className={`border-r border-b p-1 relative min-h-[60px] ${isSameDay(day, new Date()) ? "bg-blue-50" : ""}`}
                        >
                          {hourEvents.map((event) => (
                            <div
                              key={event.id}
                              className="text-xs p-1 mb-1 rounded truncate cursor-pointer"
                              style={{
                                backgroundColor: `${event.eventType.color}20`,
                                borderLeft: `3px solid ${event.eventType.color}`,
                              }}
                              onClick={() => router.push(`/dashboard/events/${event.id}`)}
                            >
                              {format(event.startDate, "h:mm a")} {event.title}
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
              <h3 className="font-medium text-lg mb-4">{format(currentDate, "EEEE, MMMM d, yyyy")}</h3>

              {generateDayHours().map((hour) => {
                const hourEvents = getEventsForHour(currentDate, hour)

                return (
                  <div key={hour} className="grid grid-cols-12 gap-2 border-b py-2">
                    <div className="col-span-1 text-right text-sm text-muted-foreground pt-1">
                      {hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                    </div>
                    <div className="col-span-11">
                      {hourEvents.length === 0 ? (
                        <div className="h-12 border border-dashed rounded-md"></div>
                      ) : (
                        <div className="space-y-2">
                          {hourEvents.map((event) => (
                            <div
                              key={event.id}
                              className="p-2 rounded-md cursor-pointer"
                              style={{
                                backgroundColor: `${event.eventType.color}20`,
                                borderLeft: `3px solid ${event.eventType.color}`,
                              }}
                              onClick={() => router.push(`/dashboard/events/${event.id}`)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">{event.title}</div>
                                  <div className="text-sm">
                                    {format(event.startDate, "h:mm a")} - {format(event.endDate, "h:mm a")}
                                  </div>
                                  <div className="text-sm text-muted-foreground">{event.venue.name}</div>
                                </div>
                                <Badge className="ml-2">{event.status}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
