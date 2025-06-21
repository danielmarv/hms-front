"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { useApi } from "@/hooks/use-api"

// Types and Interfaces
export interface EventType {
  _id: string
  name: string
  description?: string
  category?: string
  color: string
  default_duration?: number
  default_capacity?: number
  base_price?: number
  price_per_person?: number
  features?: string[]
  status: string
  hotel_id?: string
}

export interface Venue {
  _id: string
  name: string
  description?: string
  type: string
  capacity: number
  area?: number
  location?: string
  amenities?: string[]
  features?: string[]
  pricing: {
    base_price: number
    price_per_hour: number
    currency: string
  }
  availability?: {
    days_of_week: number[]
    start_time: string
    end_time: string
    exceptions?: Array<{
      date: Date
      available: boolean
      reason?: string
    }>
  }
  setup_time?: number
  teardown_time?: number
  minimum_hours?: number
  cancellation_policy?: string
  images?: string[]
  floor_plan?: string
  status: string
  maintenance?: {
    start_date: Date
    end_date: Date
    reason: string
    scheduled_by: string
  }
  hotel_id?: string
}

export interface EventService {
  _id: string
  name: string
  description?: string
  category: string
  price: number
  hotel_id?: string
  status: string
}

export interface EventAttendee {
  _id: string
  name: string
  email: string
  phone?: string
  type: "guest" | "vip" | "staff" | "vendor"
  status: "pending" | "confirmed" | "declined" | "no_show"
  added_date: Date
  added_by: string
  status_updated_date?: Date
  status_updated_by?: string
}

export interface EventTimelineEntry {
  status: string
  date: Date
  user_id: string
  notes: string
}

export interface Event {
  _id: string
  title: string
  description?: string
  event_type_id: EventType | string
  venue_id: Venue | string
  hotel_id?: string
  start_date: Date
  end_date: Date
  all_day: boolean
  recurring?: {
    is_recurring: boolean
    pattern?: string
    interval?: number
    days_of_week?: number[]
    day_of_month?: number
    month_of_year?: number
    end_after?: number
    end_date?: Date
  }
  organizer?: {
    name: string
    email: string
    phone?: string
    organization?: string
  }
  attendees: {
    expected: number
    actual: number
    confirmed: number
    list?: EventAttendee[]
  }
  color?: string
  status: "draft" | "confirmed" | "in_progress" | "completed" | "cancelled"
  visibility: "public" | "private" | "staff_only"
  services?: Array<{
    service_id: string
    quantity: number
    unit_price: number
    total_price: number
    status: string
    notes?: string
  }>
  staffing?: string[]
  pricing?: {
    venue_cost: number
    services_cost: number
    staffing_cost: number
    additional_costs: Array<{
      name: string
      amount: number
      description?: string
    }>
    subtotal: number
    tax_rate: number
    tax_amount: number
    total: number
    currency: string
  }
  setup?: {
    start_time: Date
    end_time: Date
    instructions: string
    completed: boolean
    completed_by?: string
    completed_at?: Date
  }
  teardown?: {
    start_time: Date
    end_time: Date
    instructions: string
    completed: boolean
    completed_by?: string
    completed_at?: Date
  }
  timeline?: EventTimelineEntry[]
  notes?: string
  attachments?: Array<{
    name: string
    url: string
    type: string
    size: number
    uploaded_at: Date
  }>
  createdBy?: string
  updatedBy?: string
  createdAt?: Date
  updatedAt?: Date
}

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
    attendees?: number
  }
}

export interface EventFilters {
  hotel_id?: string
  venue_id?: string
  event_type_id?: string
  status?: string
  start_date?: string
  end_date?: string
  search?: string
  page?: number
  limit?: number
  sort?: string
}

export interface PaginationInfo {
  total: number
  page: number
  pages: number
  limit: number
}

export interface EventsResponse {
  events: Event[]
  pagination: PaginationInfo
}

export interface AvailabilityCheck {
  available: boolean
  conflicting_events: Event[]
  venue: {
    id: string
    name: string
    capacity: number
  }
  requested_time: {
    start: Date
    end: Date
  }
}

// Hook for managing events
export function useEvents(hotelId?: string) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { request } = useApi()

  // Fetch all events
  const fetchEvents = useCallback(
    async (filters: EventFilters = {}) => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams()
        if (hotelId) queryParams.append("hotel_id", hotelId)

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString())
          }
        })

        const endpoint = `/events?${queryParams.toString()}`
        const response = await request(endpoint, "GET")

        if (response.error) {
          throw new Error(response.error)
        }

        if (response.data) {
          const eventsWithDates = response.data.events.map((event: any) => ({
            ...event,
            start_date: new Date(event.start_date),
            end_date: new Date(event.end_date),
          }))

          setEvents(eventsWithDates)
          return response.data
        }

        return { events: [], pagination: { total: 0, page: 1, pages: 0, limit: 20 } }
      } catch (err) {
        console.error("Failed to fetch events:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch events"
        setError(errorMessage)
        toast.error(errorMessage)
        return { events: [], pagination: { total: 0, page: 1, pages: 0, limit: 20 } }
      } finally {
        setLoading(false)
      }
    },
    [hotelId, request],
  )

  // Get event by ID
  const getEventById = async (id: string) => {
    try {
      setLoading(true)
      const response = await request(`/events/${id}`, "GET")

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data?.event) {
        const eventWithDates = {
          ...response.data.event,
          start_date: new Date(response.data.event.start_date),
          end_date: new Date(response.data.event.end_date),
        }

        return { ...response.data, event: eventWithDates }
      }

      throw new Error("Event not found")
    } catch (err) {
      console.error(`Failed to fetch event ${id}:`, err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch event"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Create new event
  const createEvent = async (eventData: Partial<Event>) => {
    try {
      setLoading(true)
      const response = await request("/events", "POST", eventData)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const newEvent = {
          ...response.data,
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }

        setEvents((prevEvents) => [newEvent, ...prevEvents])
        toast.success("Event created successfully")
        return newEvent
      }

      throw new Error("Failed to create event")
    } catch (err) {
      console.error("Failed to create event:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create event"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update event
  const updateEvent = async (id: string, eventData: Partial<Event>) => {
    try {
      setLoading(true)
      const response = await request(`/events/${id}`, "PUT", eventData)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const updatedEvent = {
          ...response.data,
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }

        setEvents((prevEvents) => prevEvents.map((event) => (event._id === id ? updatedEvent : event)))

        toast.success("Event updated successfully")
        return updatedEvent
      }

      throw new Error("Failed to update event")
    } catch (err) {
      console.error("Failed to update event:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update event"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete event
  const deleteEvent = async (id: string) => {
    try {
      setLoading(true)
      const response = await request(`/events/${id}`, "DELETE")

      if (response.error) {
        throw new Error(response.error)
      }

      setEvents((prevEvents) => prevEvents.filter((event) => event._id !== id))
      toast.success("Event deleted successfully")
    } catch (err) {
      console.error("Failed to delete event:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to delete event"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update event status
  const updateEventStatus = async (id: string, status: string, notes?: string) => {
    try {
      setLoading(true)
      const response = await request(`/events/${id}/status`, "PATCH", { status, notes })

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const updatedEvent = {
          ...response.data,
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }

        setEvents((prevEvents) => prevEvents.map((event) => (event._id === id ? updatedEvent : event)))

        toast.success("Event status updated successfully")
        return updatedEvent
      }

      throw new Error("Failed to update event status")
    } catch (err) {
      console.error("Failed to update event status:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update event status"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Add service to event
  const addServiceToEvent = async (eventId: string, serviceId: string, quantity = 1, notes?: string) => {
    try {
      setLoading(true)
      const response = await request(`/events/${eventId}/services`, "POST", {
        service_id: serviceId,
        quantity,
        notes,
      })

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const updatedEvent = {
          ...response.data,
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }

        setEvents((prevEvents) => prevEvents.map((event) => (event._id === eventId ? updatedEvent : event)))

        toast.success("Service added to event successfully")
        return updatedEvent
      }

      throw new Error("Failed to add service to event")
    } catch (err) {
      console.error("Failed to add service to event:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to add service to event"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Remove service from event
  const removeServiceFromEvent = async (eventId: string, serviceId: string) => {
    try {
      setLoading(true)
      const response = await request(`/events/${eventId}/services/${serviceId}`, "DELETE")

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const updatedEvent = {
          ...response.data,
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }

        setEvents((prevEvents) => prevEvents.map((event) => (event._id === eventId ? updatedEvent : event)))

        toast.success("Service removed from event successfully")
        return updatedEvent
      }

      throw new Error("Failed to remove service from event")
    } catch (err) {
      console.error("Failed to remove service from event:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to remove service from event"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Complete event setup
  const completeEventSetup = async (eventId: string, notes?: string) => {
    try {
      setLoading(true)
      const response = await request(`/events/${eventId}/setup/complete`, "POST", { notes })

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const updatedEvent = {
          ...response.data,
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }

        setEvents((prevEvents) => prevEvents.map((event) => (event._id === eventId ? updatedEvent : event)))

        toast.success("Event setup completed successfully")
        return updatedEvent
      }

      throw new Error("Failed to complete event setup")
    } catch (err) {
      console.error("Failed to complete event setup:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to complete event setup"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Complete event teardown
  const completeEventTeardown = async (eventId: string, notes?: string) => {
    try {
      setLoading(true)
      const response = await request(`/events/${eventId}/teardown/complete`, "POST", { notes })

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const updatedEvent = {
          ...response.data,
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }

        setEvents((prevEvents) => prevEvents.map((event) => (event._id === eventId ? updatedEvent : event)))

        toast.success("Event teardown completed successfully")
        return updatedEvent
      }

      throw new Error("Failed to complete event teardown")
    } catch (err) {
      console.error("Failed to complete event teardown:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to complete event teardown"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get calendar view
  const getCalendarView = async (filters: {
    hotel_id?: string
    start_date: string
    end_date: string
    venue_id?: string
    event_type_id?: string
  }) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString())
        }
      })

      const response = await request(`/events/calendar/view?${queryParams.toString()}`, "GET")

      if (response.error) {
        throw new Error(response.error)
      }

      return response.data || []
    } catch (err) {
      console.error("Failed to fetch calendar view:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch calendar view"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Check availability
  const checkAvailability = async (venueId: string, startDate: string, endDate: string, excludeEventId?: string) => {
    try {
      const queryParams = new URLSearchParams({
        venue_id: venueId,
        start_date: startDate,
        end_date: endDate,
      })

      if (excludeEventId) {
        queryParams.append("exclude_event_id", excludeEventId)
      }

      const response = await request(
        `/events/calendar/availability?${queryParams.toString()}`,
        "GET",
      )

      if (response.error) {
        throw new Error(response.error)
      }

      return response.data
    } catch (err) {
      console.error("Failed to check availability:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to check availability"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }

  // Add attendee
  const addAttendee = async (
    eventId: string,
    attendeeData: {
      name: string
      email: string
      phone?: string
      type?: string
      status?: string
    },
  ) => {
    try {
      setLoading(true)
      const response = await request(`/events/${eventId}/attendees`, "POST", attendeeData)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const updatedEvent = {
          ...response.data,
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }

        setEvents((prevEvents) => prevEvents.map((event) => (event._id === eventId ? updatedEvent : event)))

        toast.success("Attendee added successfully")
        return updatedEvent
      }

      throw new Error("Failed to add attendee")
    } catch (err) {
      console.error("Failed to add attendee:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to add attendee"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Remove attendee
  const removeAttendee = async (eventId: string, attendeeId: string) => {
    try {
      setLoading(true)
      const response = await request(`/events/${eventId}/attendees/${attendeeId}`, "DELETE")

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const updatedEvent = {
          ...response.data,
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }

        setEvents((prevEvents) => prevEvents.map((event) => (event._id === eventId ? updatedEvent : event)))

        toast.success("Attendee removed successfully")
        return updatedEvent
      }

      throw new Error("Failed to remove attendee")
    } catch (err) {
      console.error("Failed to remove attendee:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to remove attendee"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update attendee status
  const updateAttendeeStatus = async (eventId: string, attendeeId: string, status: string) => {
    try {
      setLoading(true)
      const response = await request(`/events/${eventId}/attendees/${attendeeId}/status`, "PATCH", { status })

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const updatedEvent = {
          ...response.data,
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }

        setEvents((prevEvents) => prevEvents.map((event) => (event._id === eventId ? updatedEvent : event)))

        toast.success("Attendee status updated successfully")
        return updatedEvent
      }

      throw new Error("Failed to update attendee status")
    } catch (err) {
      console.error("Failed to update attendee status:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update attendee status"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Add timeline entry
  const addTimelineEntry = async (eventId: string, notes: string, status?: string) => {
    try {
      setLoading(true)
      const response = await request(`/events/${eventId}/timeline`, "POST", { notes, status })

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const updatedEvent = {
          ...response.data,
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }

        setEvents((prevEvents) => prevEvents.map((event) => (event._id === eventId ? updatedEvent : event)))

        toast.success("Timeline entry added successfully")
        return updatedEvent
      }

      throw new Error("Failed to add timeline entry")
    } catch (err) {
      console.error("Failed to add timeline entry:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to add timeline entry"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update event notes
  const updateEventNotes = async (eventId: string, notes: string) => {
    try {
      setLoading(true)
      const response = await request(`/events/${eventId}/notes`, "PATCH", { notes })

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const updatedEvent = {
          ...response.data,
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }

        setEvents((prevEvents) => prevEvents.map((event) => (event._id === eventId ? updatedEvent : event)))

        toast.success("Event notes updated successfully")
        return updatedEvent
      }

      throw new Error("Failed to update event notes")
    } catch (err) {
      console.error("Failed to update event notes:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update event notes"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Duplicate event
  const duplicateEvent = async (
    eventId: string,
    duplicateData: {
      title?: string
      start_date?: string
      end_date?: string
    },
  ) => {
    try {
      setLoading(true)
      const response = await request(`/events/${eventId}/duplicate`, "POST", duplicateData)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const newEvent = {
          ...response.data,
          start_date: new Date(response.data.start_date),
          end_date: new Date(response.data.end_date),
        }

        setEvents((prevEvents) => [newEvent, ...prevEvents])
        toast.success("Event duplicated successfully")
        return newEvent
      }

      throw new Error("Failed to duplicate event")
    } catch (err) {
      console.error("Failed to duplicate event:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to duplicate event"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Save as template
  const saveAsTemplate = async (
    eventId: string,
    templateData: {
      template_name?: string
      description?: string
      category?: string
    },
  ) => {
    try {
      setLoading(true)
      const response = await request(`/events/${eventId}/save-as-template`, "POST", templateData)

      if (response.error) {
        throw new Error(response.error)
      }

      toast.success("Event saved as template successfully")
      return response.data
    } catch (err) {
      console.error("Failed to save event as template:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to save event as template"
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch on mount
  useEffect(() => {
    if (hotelId) {
      fetchEvents({ hotel_id: hotelId })
    }
  }, [hotelId, fetchEvents])

  return {
    events,
    loading,
    error,
    fetchEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    addServiceToEvent,
    removeServiceFromEvent,
    completeEventSetup,
    completeEventTeardown,
    getCalendarView,
    checkAvailability,
    addAttendee,
    removeAttendee,
    updateAttendeeStatus,
    addTimelineEntry,
    updateEventNotes,
    duplicateEvent,
    saveAsTemplate,
    refreshEvents: fetchEvents,
  }
}
