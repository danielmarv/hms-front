"use client"

import { useState } from "react"
import { toast } from "sonner"

interface CalendarEvent {
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
  }
}

export function useEventCalendar() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to get calendar events
  const getCalendarEvents = async (
    startDate: Date,
    endDate: Date,
    hotelId?: string,
    venueId?: string,
    eventTypeId?: string,
    status?: string,
  ) => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      params.append("start_date", startDate.toISOString())
      params.append("end_date", endDate.toISOString())

      if (hotelId) params.append("hotel_id", hotelId)
      if (venueId) params.append("venue_id", venueId)
      if (eventTypeId) params.append("event_type_id", eventTypeId)
      if (status) params.append("status", status)

      const response = await fetch(`/api/events/calendar?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Error fetching calendar events: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform dates from strings to Date objects
      const eventsWithDates = data.data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }))

      return eventsWithDates as CalendarEvent[]
    } catch (err) {
      console.error("Failed to fetch calendar events:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch calendar events")
      toast.error("Failed to load calendar events")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to get month events
  const getMonthEvents = async (
    year: number,
    month: number,
    hotelId?: string,
    venueId?: string,
    eventTypeId?: string,
    status?: string,
  ) => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      if (hotelId) params.append("hotel_id", hotelId)
      if (venueId) params.append("venue_id", venueId)
      if (eventTypeId) params.append("event_type_id", eventTypeId)
      if (status) params.append("status", status)

      const response = await fetch(`/api/events/calendar/month/${year}/${month}?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Error fetching month events: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform dates from strings to Date objects
      const eventsWithDates = data.data.events.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }))

      return {
        ...data.data,
        events: eventsWithDates as CalendarEvent[],
        start_date: new Date(data.data.start_date),
        end_date: new Date(data.data.end_date),
      }
    } catch (err) {
      console.error("Failed to fetch month events:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch month events")
      toast.error("Failed to load month events")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to get week events
  const getWeekEvents = async (
    year: number,
    week: number,
    hotelId?: string,
    venueId?: string,
    eventTypeId?: string,
    status?: string,
  ) => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      if (hotelId) params.append("hotel_id", hotelId)
      if (venueId) params.append("venue_id", venueId)
      if (eventTypeId) params.append("event_type_id", eventTypeId)
      if (status) params.append("status", status)

      const response = await fetch(`/api/events/calendar/week/${year}/${week}?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Error fetching week events: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform dates from strings to Date objects
      const eventsWithDates = data.data.events.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }))

      return {
        ...data.data,
        events: eventsWithDates as CalendarEvent[],
        start_date: new Date(data.data.start_date),
        end_date: new Date(data.data.end_date),
      }
    } catch (err) {
      console.error("Failed to fetch week events:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch week events")
      toast.error("Failed to load week events")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to get day events
  const getDayEvents = async (
    year: number,
    month: number,
    day: number,
    hotelId?: string,
    venueId?: string,
    eventTypeId?: string,
    status?: string,
  ) => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      if (hotelId) params.append("hotel_id", hotelId)
      if (venueId) params.append("venue_id", venueId)
      if (eventTypeId) params.append("event_type_id", eventTypeId)
      if (status) params.append("status", status)

      const response = await fetch(`/api/events/calendar/day/${year}/${month}/${day}?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Error fetching day events: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform dates from strings to Date objects
      const eventsWithDates = data.data.events.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }))

      return {
        ...data.data,
        events: eventsWithDates as CalendarEvent[],
        date: new Date(data.data.date),
      }
    } catch (err) {
      console.error("Failed to fetch day events:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch day events")
      toast.error("Failed to load day events")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to check availability
  const checkAvailability = async (venueId: string, startDate: Date, endDate: Date, eventId?: string) => {
    try {
      setLoading(true)

      const response = await fetch("/api/events/calendar/check-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          venue_id: venueId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          event_id: eventId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error checking availability: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data
    } catch (err) {
      console.error("Failed to check availability:", err)
      setError(err instanceof Error ? err.message : "Failed to check availability")
      toast.error("Failed to check availability")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to get venue calendar
  const getVenueCalendar = async (venueId: string, startDate: Date, endDate: Date, status?: string) => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      params.append("start_date", startDate.toISOString())
      params.append("end_date", endDate.toISOString())
      if (status) params.append("status", status)

      const response = await fetch(`/api/events/calendar/venue/${venueId}?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Error fetching venue calendar: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform dates from strings to Date objects
      const eventsWithDates = data.data.events.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }))

      return {
        ...data.data,
        events: eventsWithDates as CalendarEvent[],
        date_range: {
          start: new Date(data.data.date_range.start),
          end: new Date(data.data.date_range.end),
        },
      }
    } catch (err) {
      console.error("Failed to fetch venue calendar:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch venue calendar")
      toast.error("Failed to load venue calendar")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getCalendarEvents,
    getMonthEvents,
    getWeekEvents,
    getDayEvents,
    checkAvailability,
    getVenueCalendar,
  }
}
