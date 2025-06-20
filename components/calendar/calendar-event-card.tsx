"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, MapPin, Users, CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface CalendarEventCardProps {
  event: {
    id: string
    title: string
    start: Date
    end: Date
    extendedProps: {
      status: string
      venue?: string
      eventType?: string
      staffCount?: number
      attendees?: number
    }
  }
  onClick?: () => void
  compact?: boolean
}

export function CalendarEventCard({ event, onClick, compact = false }: CalendarEventCardProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getEventTypeColor = (eventType?: string) => {
    const colors = {
      business: "#3498db",
      social: "#e74c3c",
      celebration: "#f39c12",
      educational: "#2ecc71",
      other: "#9b59b6",
    }
    return colors[eventType as keyof typeof colors] || "#6b7280"
  }

  if (compact) {
    return (
      <div
        className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
        style={{
          backgroundColor: `${getEventTypeColor(event.extendedProps.eventType)}20`,
          borderLeft: `3px solid ${getEventTypeColor(event.extendedProps.eventType)}`,
        }}
        onClick={onClick}
      >
        <div className="font-medium">{event.title}</div>
        <div className="text-muted-foreground">{format(event.start, "h:mm a")}</div>
      </div>
    )
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-sm">{event.title}</h3>
          <Badge className={getStatusColor(event.extendedProps.status)}>{event.extendedProps.status}</Badge>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
          </div>

          {event.extendedProps.venue && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.extendedProps.venue}
            </div>
          )}

          {event.extendedProps.attendees && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {event.extendedProps.attendees} attendees
            </div>
          )}

          {event.extendedProps.staffCount && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {event.extendedProps.staffCount} staff assigned
            </div>
          )}

          {event.extendedProps.eventType && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {event.extendedProps.eventType}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
