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
  }
}

export function useEventCalendar(hotelId?: string) {
  const { request, isLoading } = useApi()
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([])

  // Function to get calendar events
  const getCalendarEvents = useCallback(
    async (startDate: Date, endDate: Date, venueId?: string, eventTypeId?: string, status?: string) => {
      // Build query parameters
      const params = new URLSearchParams()
      params.append("start_date", startDate.toISOString())
      params.append("end_date", endDate.toISOString())

      if (hotelId) params.append("hotel_id", hotelId)
      if (venueId) params.append("venue_id", venueId)
      if (eventTypeId) params.append("event_type_id", eventTypeId)
      if (status) params.append("status", status)

      const response = await request<CalendarEvent[]>(`/events/event-calendar?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return []
      }

      if (response.data) {
        // Transform dates from strings to Date objects
        const eventsWithDates = response.data.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }))

        setEvents(eventsWithDates)
        return eventsWithDates
      }

      return []
    },
    [request, hotelId],
  )

  // Function to get month events
  const getMonthEvents = useCallback(
    async (year: number, month: number, venueId?: string, eventTypeId?: string, status?: string) => {
      // Build query parameters
      const params = new URLSearchParams()
      if (hotelId) params.append("hotel_id", hotelId)
      if (venueId) params.append("venue_id", venueId)
      if (eventTypeId) params.append("event_type_id", eventTypeId)
      if (status) params.append("status", status)

      const response = await request<{
        events: any[]
        start_date: string
        end_date: string
      }>(`/events/event-calendar/month/${year}/${month}?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Transform dates from strings to Date objects
        const eventsWithDates = response.data.events.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }))

        return {
          ...response.data,
          events: eventsWithDates,
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }
      }

      return null
    },
    [request, hotelId],
  )

  // Function to get week events
  const getWeekEvents = useCallback(
    async (year: number, week: number, venueId?: string, eventTypeId?: string, status?: string) => {
      // Build query parameters
      const params = new URLSearchParams()
      if (hotelId) params.append("hotel_id", hotelId)
      if (venueId) params.append("venue_id", venueId)
      if (eventTypeId) params.append("event_type_id", eventTypeId)
      if (status) params.append("status", status)

      const response = await request<{
        events: any[]
        start_date: string
        end_date: string
      }>(`/events/event-calendar/week/${year}/${week}?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Transform dates from strings to Date objects
        const eventsWithDates = response.data.events.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }))

        return {
          ...response.data,
          events: eventsWithDates,
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }
      }

      return null
    },
    [request, hotelId],
  )

  // Function to get day events
  const getDayEvents = useCallback(
    async (year: number, month: number, day: number, venueId?: string, eventTypeId?: string, status?: string) => {
      // Build query parameters
      const params = new URLSearchParams()
      if (hotelId) params.append("hotel_id", hotelId)
      if (venueId) params.append("venue_id", venueId)
      if (eventTypeId) params.append("event_type_id", eventTypeId)
      if (status) params.append("status", status)

      const response = await request<{
        events: any[]
        date: string
      }>(`/events/event-calendar/day/${year}/${month}/${day}?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Transform dates from strings to Date objects
        const eventsWithDates = response.data.events.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }))

        return {
          ...response.data,
          events: eventsWithDates,
          date: new Date(response.data.date),
        }
      }

      return null
    },
    [request, hotelId],
  )

  // Function to check availability
  const checkAvailability = useCallback(
    async (venueId: string, startDate: Date, endDate: Date, eventId?: string) => {
      const response = await request<{
        available: boolean
        conflicting_events?: any[]
      }>("/events/event-calendar/check-availability", "POST", {
        venue_id: venueId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        event_id: eventId,
      })

      if (response.error) {
        setError(response.error)
        return { available: false }
      }

      return response.data || { available: false }
    },
    [request],
  )

  // Function to get venue calendar
  const getVenueCalendar = useCallback(
    async (venueId: string, startDate: Date, endDate: Date, status?: string) => {
      // Build query parameters
      const params = new URLSearchParams()
      params.append("start_date", startDate.toISOString())
      params.append("end_date", endDate.toISOString())
      if (status) params.append("status", status)

      const response = await request<{
        events: any[]
        date_range: {
          start: string
          end: string
        }
      }>(`/events/event-calendar/venue/${venueId}?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Transform dates from strings to Date objects
        const eventsWithDates = response.data.events.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }))

        return {
          ...response.data,
          events: eventsWithDates,
          date_range: {
            start: new Date(response.data.date_range.start),
            end: new Date(response.data.date_range.end),
          },
        }
      }

      return null
    },
    [request],
  )

  // Load initial events if hotelId is provided
  useEffect(() => {
    if (hotelId) {
      const now = new Date()
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      getCalendarEvents(startDate, endDate)
    }
  }, [hotelId, getCalendarEvents])

  return {
    events,
    loading: isLoading,
    error,
    getCalendarEvents,
    getMonthEvents,
    getWeekEvents,
    getDayEvents,
    checkAvailability,
    getVenueCalendar,
  }
}
