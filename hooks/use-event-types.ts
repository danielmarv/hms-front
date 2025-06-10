"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { useApi } from "@/hooks/use-api"
import type { EventType } from "./use-events"

export function useEventTypes(hotelId?: string) {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { request } = useApi()

  const fetchEventTypes = useCallback(async () => {
    try {
      setLoading(true)
      const endpoint = hotelId ? `/events/event-types?hotel_id=${hotelId}` : "/events/event-types"
      const response = await request<{ event_types: EventType[] }>(endpoint, "GET")

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data && response.data.event_types) {
        setEventTypes(response.data.event_types)
      } else {
        setEventTypes([])
      }
    } catch (err) {
      console.error("Failed to fetch event types:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch event types")
      toast.error("Failed to load event types")
    } finally {
      setLoading(false)
    }
  }, [hotelId, request])

  useEffect(() => {
    fetchEventTypes()
  }, [fetchEventTypes])

  // Function to create a new event type
  const createEventType = async (eventTypeData: Partial<EventType>) => {
    try {
      setLoading(true)
      const response = await request<{ event_type: EventType }>("/events/event-types", "POST", eventTypeData)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data && response.data.event_type) {
        // Add the new event type to the state
        setEventTypes((prevEventTypes) => [...prevEventTypes, response.data.event_type])
        toast.success("Event type created successfully")
        return response.data.event_type
      }

      throw new Error("Failed to create event type")
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
      const response = await request<{ event_type: EventType }>(`/events/event-types/${id}`, "PUT", eventTypeData)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data && response.data.event_type) {
        // Update the event type in the state
        setEventTypes((prevEventTypes) =>
          prevEventTypes.map((eventType) =>
            eventType._id === id ? { ...eventType, ...response.data.event_type } : eventType,
          ),
        )

        toast.success("Event type updated successfully")
        return response.data.event_type
      }

      throw new Error("Failed to update event type")
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
      const response = await request<{ success: boolean }>(`/events/event-types/${id}`, "DELETE")

      if (response.error) {
        throw new Error(response.error)
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
      const response = await request<{ event_type: EventType }>(`/events/event-types/${id}`, "GET")

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data && response.data.event_type) {
        return response.data.event_type
      }

      throw new Error(`Failed to fetch event type with ID ${id}`)
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
    refreshEventTypes: fetchEventTypes,
  }
}
