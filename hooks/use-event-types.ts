"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { EventType } from "./use-events"

export function useEventTypes(hotelId?: string) {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        setLoading(true)
        const url = hotelId ? `/api/events/types?hotel_id=${hotelId}` : "/api/events/types"
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Error fetching event types: ${response.statusText}`)
        }

        const data = await response.json()
        setEventTypes(data.event_types)
      } catch (err) {
        console.error("Failed to fetch event types:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch event types")
        toast.error("Failed to load event types")
      } finally {
        setLoading(false)
      }
    }

    fetchEventTypes()
  }, [hotelId])

  // Function to create a new event type
  const createEventType = async (eventTypeData: Partial<EventType>) => {
    try {
      setLoading(true)
      const response = await fetch("/api/events/types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventTypeData),
      })

      if (!response.ok) {
        throw new Error(`Error creating event type: ${response.statusText}`)
      }

      const data = await response.json()

      // Add the new event type to the state
      setEventTypes((prevEventTypes) => [...prevEventTypes, data.event_type])

      toast.success("Event type created successfully")
      return data.event_type
    } catch (err) {
      console.error("Failed to create event type:", err)
      setError(err instanceof Error ? err.message : "Failed to create event type")
      toast.error("Failed to create event type")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to update an event type
  const updateEventType = async (id: string, eventTypeData: Partial<EventType>) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/types/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventTypeData),
      })

      if (!response.ok) {
        throw new Error(`Error updating event type: ${response.statusText}`)
      }

      const data = await response.json()

      // Update the event type in the state
      setEventTypes((prevEventTypes) =>
        prevEventTypes.map((eventType) => (eventType._id === id ? { ...eventType, ...data.event_type } : eventType)),
      )

      toast.success("Event type updated successfully")
      return data.event_type
    } catch (err) {
      console.error("Failed to update event type:", err)
      setError(err instanceof Error ? err.message : "Failed to update event type")
      toast.error("Failed to update event type")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to delete an event type
  const deleteEventType = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/types/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error deleting event type: ${response.statusText}`)
      }

      // Remove the event type from the state
      setEventTypes((prevEventTypes) => prevEventTypes.filter((eventType) => eventType._id !== id))

      toast.success("Event type deleted successfully")
    } catch (err) {
      console.error("Failed to delete event type:", err)
      setError(err instanceof Error ? err.message : "Failed to delete event type")
      toast.error("Failed to delete event type")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to get a single event type by ID
  const getEventType = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/types/${id}`)

      if (!response.ok) {
        throw new Error(`Error fetching event type: ${response.statusText}`)
      }

      const data = await response.json()
      return data.event_type
    } catch (err) {
      console.error(`Failed to fetch event type with ID ${id}:`, err)
      setError(err instanceof Error ? err.message : `Failed to fetch event type with ID ${id}`)
      toast.error("Failed to load event type details")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    eventTypes,
    loading,
    error,
    createEventType,
    updateEventType,
    deleteEventType,
    getEventType,
  }
}
