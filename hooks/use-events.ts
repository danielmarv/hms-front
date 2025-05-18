"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

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
    end_after?: number
    end_date?: Date
  }
  organizer?: {
    name: string
    email: string
    phone?: string
  }
  attendees: number
  color?: string
  status: string
  visibility: string
  services?: Array<{
    service_id: string
    quantity: number
    price: number
  }>
  staffing?: Array<{
    role: string
    count: number
  }>
  notes?: string
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

export interface EventBooking {
  _id: string
  event_id?: string
  venue_id: string
  hotel_id?: string
  customer: {
    customer_id?: string
    name: string
    email: string
    phone?: string
  }
  start_date: Date
  end_date: Date
  attendees: number
  basePrice: number
  services: Array<{
    service: string
    quantity: number
    price: number
    specialRequests?: string
  }>
  totalAmount: number
  specialRequests?: string
  status: string
}

// Hook for fetching events
export function useEvents(hotelId?: string) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const url = hotelId ? `/api/events?hotel_id=${hotelId}` : "/api/events"
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Error fetching events: ${response.statusText}`)
        }

        const data = await response.json()

        // Transform dates from strings to Date objects
        const eventsWithDates = data.events.map((event: any) => ({
          ...event,
          start_date: new Date(event.start_date),
          end_date: new Date(event.end_date),
        }))

        setEvents(eventsWithDates)
      } catch (err) {
        console.error("Failed to fetch events:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch events")
        toast.error("Failed to load events")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [hotelId])

  // Function to create a new event
  const createEvent = async (eventData: Partial<Event>) => {
    try {
      setLoading(true)
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        throw new Error(`Error creating event: ${response.statusText}`)
      }

      const data = await response.json()

      // Add the new event to the state
      setEvents((prevEvents) => [
        ...prevEvents,
        {
          ...data.event,
          start_date: new Date(data.event.start_date),
          end_date: new Date(data.event.end_date),
        },
      ])

      toast.success("Event created successfully")
      return data.event
    } catch (err) {
      console.error("Failed to create event:", err)
      setError(err instanceof Error ? err.message : "Failed to create event")
      toast.error("Failed to create event")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to update an event
  const updateEvent = async (id: string, eventData: Partial<Event>) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        throw new Error(`Error updating event: ${response.statusText}`)
      }

      const data = await response.json()

      // Update the event in the state
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === id
            ? {
                ...event,
                ...data.event,
                start_date: new Date(data.event.start_date),
                end_date: new Date(data.event.end_date),
              }
            : event,
        ),
      )

      toast.success("Event updated successfully")
      return data.event
    } catch (err) {
      console.error("Failed to update event:", err)
      setError(err instanceof Error ? err.message : "Failed to update event")
      toast.error("Failed to update event")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to delete an event
  const deleteEvent = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error deleting event: ${response.statusText}`)
      }

      // Remove the event from the state
      setEvents((prevEvents) => prevEvents.filter((event) => event._id !== id))

      toast.success("Event deleted successfully")
    } catch (err) {
      console.error("Failed to delete event:", err)
      setError(err instanceof Error ? err.message : "Failed to delete event")
      toast.error("Failed to delete event")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to get a single event by ID
  const getEvent = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${id}`)

      if (!response.ok) {
        throw new Error(`Error fetching event: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform dates from strings to Date objects
      const eventWithDates = {
        ...data.event,
        start_date: new Date(data.event.start_date),
        end_date: new Date(data.event.end_date),
      }

      return eventWithDates
    } catch (err) {
      console.error(`Failed to fetch event with ID ${id}:`, err)
      setError(err instanceof Error ? err.message : `Failed to fetch event with ID ${id}`)
      toast.error("Failed to load event details")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent,
  }
}
