"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: string
  title: string
  type: "booking" | "maintenance" | "event" | "meeting"
  startTime: Date
  endTime: Date
  location?: string
  attendees?: number
  status: "confirmed" | "pending" | "cancelled"
}

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [view, setView] = useState<"month" | "week" | "day">("month")

  useEffect(() => {
    // Mock events data
    const mockEvents: CalendarEvent[] = [
      {
        id: "1",
        title: "VIP Guest Arrival",
        type: "booking",
        startTime: new Date(2024, 11, 15, 14, 0),
        endTime: new Date(2024, 11, 15, 15, 0),
        location: "Presidential Suite",
        status: "confirmed",
      },
      {
        id: "2",
        title: "AC Maintenance",
        type: "maintenance",
        startTime: new Date(2024, 11, 16, 9, 0),
        endTime: new Date(2024, 11, 16, 11, 0),
        location: "Room 205",
        status: "confirmed",
      },
      {
        id: "3",
        title: "Wedding Reception",
        type: "event",
        startTime: new Date(2024, 11, 18, 18, 0),
        endTime: new Date(2024, 11, 18, 23, 0),
        location: "Grand Ballroom",
        attendees: 150,
        status: "confirmed",
      },
      {
        id: "4",
        title: "Staff Meeting",
        type: "meeting",
        startTime: new Date(2024, 11, 20, 10, 0),
        endTime: new Date(2024, 11, 20, 11, 0),
        location: "Conference Room",
        attendees: 12,
        status: "confirmed",
      },
      {
        id: "5",
        title: "Corporate Booking",
        type: "booking",
        startTime: new Date(2024, 11, 22, 16, 0),
        endTime: new Date(2024, 11, 22, 17, 0),
        location: "Executive Floor",
        status: "pending",
      },
    ]

    setEvents(mockEvents)
  }, [])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startTime)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "booking":
        return "bg-blue-100 text-blue-800"
      case "maintenance":
        return "bg-orange-100 text-orange-800"
      case "event":
        return "bg-purple-100 text-purple-800"
      case "meeting":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const days = getDaysInMonth(currentDate)
  const todayEvents = getEventsForDate(selectedDate)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar
            </CardTitle>
            <CardDescription>Upcoming events and schedules</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month Header */}
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleDateString([], { month: "long", year: "numeric" })}
          </h3>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="p-2" />
            }

            const dayEvents = getEventsForDate(day)
            const isToday = day.toDateString() === new Date().toDateString()
            const isSelected = day.toDateString() === selectedDate.toDateString()

            return (
              <div
                key={index}
                className={cn(
                  "p-2 cursor-pointer rounded-lg transition-colors hover:bg-muted",
                  isToday && "bg-primary text-primary-foreground",
                  isSelected && !isToday && "bg-muted",
                )}
                onClick={() => setSelectedDate(day)}
              >
                <div className="text-sm font-medium">{day.getDate()}</div>
                {dayEvents.length > 0 && (
                  <div className="flex justify-center mt-1">
                    <div className="h-1 w-1 rounded-full bg-current" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Today's Events */}
        <div>
          <h4 className="text-sm font-medium mb-2">
            Events for {selectedDate.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
          </h4>
          <ScrollArea className="h-[200px]">
            {todayEvents.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events scheduled</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayEvents.map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-sm font-medium">{event.title}</h5>
                      <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                      {event.attendees && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.attendees} attendees
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
