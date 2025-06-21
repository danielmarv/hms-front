"use client"

import { useState, useCallback, useEffect } from "react"
import { useApi } from "./use-api"

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: {
    status: string
    venue?: string
    eventType?: string
    staffCount?: number
  }
}

export interface CalendarSettings {
  default_view: string
  start_time: string
  end_time: string
  time_format: string
  first_day_of_week: number
  show_weekends: boolean
  event_colors: {
    confirmed: string
    pending: string
    cancelled: string
    completed: string
  }
  notifications: {
    email_reminders: boolean
    reminder_time: number
  }
}

export interface VenueCalendarData {
  venue: {
    id: string
    name: string
    capacity: number
    status: string
  }
  date_range: {
    start: Date
    end: Date
  }
  availability: {
    days_of_week: number[]
    start_time: string
    end_time: string
    exceptions: any[]
  }
  events: CalendarEvent[]
}

export interface ConflictData {
  venue: {
    _id: string
    name: string
    capacity: number
  }
  conflicts: any[]
}

export function useEventCalendar(hotelId?: string) {
  const { request, isLoading } = useApi()
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [settings, setSettings] = useState<CalendarSettings | null>(null)

  // Clear error helper
  const clearError = useCallback(() => setError(null), [])

  // Transform API response to CalendarEvent format
  const transformEvents = useCallback((apiEvents: any[]): CalendarEvent[] => {
    return apiEvents.map((event: any) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }))
  }, [])

  // Get calendar events with filters
  const getCalendarEvents = useCallback(
    async (
      startDate: Date,
      endDate: Date,
      filters?: {
        venueId?: string
        eventTypeId?: string
        status?: string
      },
    ) => {
      clearError()

      const params = new URLSearchParams()
      params.append("start_date", startDate.toISOString())
      params.append("end_date", endDate.toISOString())

      if (hotelId) params.append("hotel_id", hotelId)
      if (filters?.venueId) params.append("venue_id", filters.venueId)
      if (filters?.eventTypeId) params.append("event_type_id", filters.eventTypeId)
      if (filters?.status) params.append("status", filters.status)

      const response = await request(`/event-calendar?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return []
      }

      if (response.data) {
        const transformedEvents = transformEvents(response.data)
        setEvents(transformedEvents)
        return transformedEvents
      }

      return []
    },
    [request, hotelId, clearError, transformEvents],
  )

  // Get monthly events
  const getMonthlyEvents = useCallback(
    async (
      year: number,
      month: number,
      filters?: {
        venueId?: string
        eventTypeId?: string
        status?: string
      },
    ) => {
      clearError()

      const params = new URLSearchParams()
      if (hotelId) params.append("hotel_id", hotelId)
      if (filters?.venueId) params.append("venue_id", filters.venueId)
      if (filters?.eventTypeId) params.append("event_type_id", filters.eventTypeId)
      if (filters?.status) params.append("status", filters.status)

      const response = await request(`/event-calendar/month/${year}/${month}?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        return {
          ...response.data,
          events: transformEvents(response.data.events),
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }
      }

      return null
    },
    [request, hotelId, clearError, transformEvents],
  )

  // Get weekly events
  const getWeeklyEvents = useCallback(
    async (
      year: number,
      week: number,
      filters?: {
        venueId?: string
        eventTypeId?: string
        status?: string
      },
    ) => {
      clearError()

      const params = new URLSearchParams()
      if (hotelId) params.append("hotel_id", hotelId)
      if (filters?.venueId) params.append("venue_id", filters.venueId)
      if (filters?.eventTypeId) params.append("event_type_id", filters.eventTypeId)
      if (filters?.status) params.append("status", filters.status)

      const response = await request(`/event-calendar/week/${year}/${week}?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        return {
          ...response.data,
          events: transformEvents(response.data.events),
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }
      }

      return null
    },
    [request, hotelId, clearError, transformEvents],
  )

  // Get daily events
  const getDailyEvents = useCallback(
    async (
      date: Date,
      filters?: {
        venueId?: string
        eventTypeId?: string
        status?: string
      },
    ) => {
      clearError()

      const params = new URLSearchParams()
      if (hotelId) params.append("hotel_id", hotelId)
      if (filters?.venueId) params.append("venue_id", filters.venueId)
      if (filters?.eventTypeId) params.append("event_type_id", filters.eventTypeId)
      if (filters?.status) params.append("status", filters.status)

      const response = await request(
        `/event-calendar/day/${date.toISOString().split("T")[0]}?${params.toString()}`,
        "GET",
      )

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        return {
          ...response.data,
          events: transformEvents(response.data.events),
          date: new Date(response.data.date),
        }
      }

      return null
    },
    [request, hotelId, clearError, transformEvents],
  )

  // Check availability
  const checkAvailability = useCallback(
    async (venueId: string, startDate: Date, endDate: Date, eventId?: string) => {
      clearError()

      const response = await request("/event-calendar/availability", "GET", undefined, false)

      if (response.error) {
        setError(response.error)
        return { available: false, reason: response.error }
      }

      return response.data || { available: false }
    },
    [request, clearError],
  )

  // Get conflicts
  const getConflicts = useCallback(
    async (startDate: Date, endDate: Date, venueId?: string): Promise<ConflictData[]> => {
      clearError()

      const params = new URLSearchParams()
      params.append("start_date", startDate.toISOString())
      params.append("end_date", endDate.toISOString())

      if (hotelId) params.append("hotel_id", hotelId)
      if (venueId) params.append("venue_id", venueId)

      const response = await request(`/event-calendar/conflicts?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return []
      }

      return response.data || []
    },
    [request, hotelId, clearError],
  )

  // Get venue calendar
  const getVenueCalendar = useCallback(
    async (venueId: string, startDate: Date, endDate: Date, status?: string): Promise<VenueCalendarData | null> => {
      clearError()

      const params = new URLSearchParams()
      params.append("start_date", startDate.toISOString())
      params.append("end_date", endDate.toISOString())
      if (status) params.append("status", status)

      const response = await request(`/event-calendar/venues?venue_id=${venueId}&${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        return {
          ...response.data,
          events: transformEvents(response.data.events),
          date_range: {
            start: new Date(response.data.date_range.start),
            end: new Date(response.data.date_range.end),
          },
        }
      }

      return null
    },
    [request, clearError, transformEvents],
  )

  // Get staff calendar
  const getStaffCalendar = useCallback(
    async (startDate: Date, endDate: Date, staffId?: string) => {
      clearError()

      const params = new URLSearchParams()
      params.append("start_date", startDate.toISOString())
      params.append("end_date", endDate.toISOString())

      if (hotelId) params.append("hotel_id", hotelId)
      if (staffId) params.append("staff_id", staffId)

      const response = await request(`/event-calendar/staff?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return []
      }

      if (response.data) {
        return transformEvents(response.data)
      }

      return []
    },
    [request, hotelId, clearError, transformEvents],
  )

  // Export to iCalendar
  const exportToICalendar = useCallback(
    async (filters?: {
      startDate?: Date
      endDate?: Date
      venueId?: string
      eventTypeId?: string
    }) => {
      clearError()

      const params = new URLSearchParams()
      if (hotelId) params.append("hotel_id", hotelId)
      if (filters?.startDate) params.append("start_date", filters.startDate.toISOString())
      if (filters?.endDate) params.append("end_date", filters.endDate.toISOString())
      if (filters?.venueId) params.append("venue_id", filters.venueId)
      if (filters?.eventTypeId) params.append("event_type_id", filters.eventTypeId)

      // For file downloads, we need to handle this differently
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      const url = `${API_URL}/event-calendar/export/ical?${params.toString()}`

      try {
        const link = document.createElement("a")
        link.href = url
        link.download = "events.ics"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return true
      } catch (error) {
        setError("Failed to export calendar")
        return false
      }
    },
    [hotelId, clearError],
  )

  // Export to Google Calendar
  const exportToGoogleCalendar = useCallback(
    async (eventId: string) => {
      clearError()

      const params = new URLSearchParams()
      params.append("event_id", eventId)

      const response = await request(`/event-calendar/export/google?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data?.url) {
        // Open Google Calendar in new tab
        window.open(response.data.url, "_blank")
        return response.data.url
      }

      return null
    },
    [request, clearError],
  )

  // Get calendar settings
  const getCalendarSettings = useCallback(async () => {
    clearError()

    const params = new URLSearchParams()
    if (hotelId) params.append("hotel_id", hotelId)

    const response = await request(`/event-calendar/settings?${params.toString()}`, "GET")

    if (response.error) {
      setError(response.error)
      return null
    }

    if (response.data) {
      setSettings(response.data)
      return response.data
    }

    return null
  }, [request, hotelId, clearError])

  // Update calendar settings
  const updateCalendarSettings = useCallback(
    async (newSettings: Partial<CalendarSettings>) => {
      clearError()

      const response = await request("/event-calendar/settings", "PUT", newSettings)

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        setSettings(response.data)
        return response.data
      }

      return null
    },
    [request, clearError],
  )

  // Load initial settings if hotelId is provided
  useEffect(() => {
    if (hotelId && !settings) {
      getCalendarSettings()
    }
  }, [hotelId, settings, getCalendarSettings])

  return {
    // State
    events,
    settings,
    loading: isLoading,
    error,

    // Actions
    clearError,

    // Calendar Events
    getCalendarEvents,
    getMonthlyEvents,
    getWeeklyEvents,
    getDailyEvents,

    // Availability & Conflicts
    checkAvailability,
    getConflicts,

    // Specialized Views
    getVenueCalendar,
    getStaffCalendar,

    // Export Functions
    exportToICalendar,
    exportToGoogleCalendar,

    // Settings
    getCalendarSettings,
    updateCalendarSettings,
  }
}
