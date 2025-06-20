"use client"

import { useState, useEffect, useCallback } from "react"
import { useApi } from "@/hooks/use-api"

// Event Type interfaces
export interface EventType {
  _id: string
  name: string
  description?: string
  hotel_id: string
  category: "business" | "social" | "celebration" | "educational" | "other"
  color: string
  icon: string
  default_duration: number
  default_capacity: number
  base_price: number
  price_per_person: number
  features: string[]
  status: "active" | "inactive"
  is_deleted: boolean
  createdBy?: {
    _id: string
    firstName: string
    lastName: string
    email?: string
  }
  updatedBy?: {
    _id: string
    firstName: string
    lastName: string
    email?: string
  }
  createdAt: string
  updatedAt: string
}

export interface EventTypeStatistics {
  totalEvents: number
  confirmedEvents: number
  completedEvents: number
  cancelledEvents: number
  draftEvents: number
  confirmationRate: number
  completionRate: number
  cancellationRate: number
  totalAttendees: number
  averageAttendees: number
  totalDuration: number
  averageDuration: number
}

export interface EventTypeTemplate {
  name: string
  description?: string
  category: string
  default_duration: number
  default_capacity: number
  base_price: number
  price_per_person: number
  features: string[]
  color: string
  icon: string
}

export interface EventTypeFilters {
  hotel_id?: string
  category?: string
  status?: string
  search?: string
  page?: number
  limit?: number
  sort?: string
}

export interface CreateEventTypeData {
  name: string
  description?: string
  hotel_id: string
  category?: "business" | "social" | "celebration" | "educational" | "other"
  color?: string
  icon?: string
  default_duration?: number
  default_capacity?: number
  base_price?: number
  price_per_person?: number
  features?: string[]
}

export interface UpdateEventTypeData extends Partial<CreateEventTypeData> {}

export interface EventTypeWithStats extends EventType {
  statistics: {
    totalEvents: number
    confirmedEvents: number
    completedEvents: number
    cancelledEvents: number
    averageAttendees: number
  }
}

export function useEventTypes(hotelId?: string) {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { request } = useApi()

  // Fetch all event types
  const fetchEventTypes = useCallback(
    async (filters: EventTypeFilters = {}) => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams()
        if (hotelId) queryParams.append("hotel_id", hotelId)
        if (filters.hotel_id) queryParams.append("hotel_id", filters.hotel_id)
        if (filters.category) queryParams.append("category", filters.category)
        if (filters.status) queryParams.append("status", filters.status)
        if (filters.search) queryParams.append("search", filters.search)
        if (filters.page) queryParams.append("page", filters.page.toString())
        if (filters.limit) queryParams.append("limit", filters.limit.toString())
        if (filters.sort) queryParams.append("sort", filters.sort)

        const response = await request(
          `/event-types?${queryParams.toString()}`,
          "GET"
        )

        if (response.error) {
          throw new Error(response.error)
        }

        if (response.data) {
          setEventTypes(response.data.eventTypes)
          return response.data
        }

        return { eventTypes: [], pagination: { total: 0, page: 1, pages: 0, limit: 20 } }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch event types"
        setError(errorMessage)
        console.error("Error fetching event types:", err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [hotelId, request],
  )

  // Get event type by ID
  const getEventTypeById = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        setError(null)

        const response = await request(
          `/event-types/${id}`, "GET"
        )

        if (response.error) {
          throw new Error(response.error)
        }

        return response.data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch event type"
        setError(errorMessage)
        console.error("Error fetching event type:", err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Create event type
  const createEventType = useCallback(
    async (data: CreateEventTypeData) => {
      try {
        setLoading(true)
        setError(null)

        const response = await request("/event-types", "POST", data)

        if (response.error) {
          throw new Error(response.error)
        }

        if (response.data) {
          setEventTypes((prev) => [...prev, response.data])
          return response.data
        }

        throw new Error("Failed to create event type")
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create event type"
        setError(errorMessage)
        console.error("Error creating event type:", err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Update event type
  const updateEventType = useCallback(
    async (id: string, data: UpdateEventTypeData) => {
      try {
        setLoading(true)
        setError(null)

        const response = await request(`/event-types/${id}`, "PUT", data)

        if (response.error) {
          throw new Error(response.error)
        }

        if (response.data) {
          setEventTypes((prev) => prev.map((eventType) => (eventType._id === id ? response.data : eventType)))
          return response.data
        }

        throw new Error("Failed to update event type")
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update event type"
        setError(errorMessage)
        console.error("Error updating event type:", err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Delete event type
  const deleteEventType = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        setError(null)

        const response = await request(`/event-types/${id}`, "DELETE")

        if (response.error) {
          throw new Error(response.error)
        }

        setEventTypes((prev) => prev.filter((eventType) => eventType._id !== id))
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete event type"
        setError(errorMessage)
        console.error("Error deleting event type:", err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Get event types by category
  const getEventTypesByCategory = useCallback(
    async (category: string, filters: { hotel_id?: string; status?: string } = {}) => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams()
        if (filters.hotel_id) queryParams.append("hotel_id", filters.hotel_id)
        if (filters.status) queryParams.append("status", filters.status)

        const response = await request(
          `/event-types/category/${category}?${queryParams.toString()}`,
          "GET",
        )

        if (response.error) {
          throw new Error(response.error)
        }

        return response.data || []
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch event types by category"
        setError(errorMessage)
        console.error("Error fetching event types by category:", err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Get event type statistics
  const getEventTypeStatistics = useCallback(
    async (id: string, dateRange?: { start_date: string; end_date: string }) => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams()
        if (dateRange?.start_date) queryParams.append("start_date", dateRange.start_date)
        if (dateRange?.end_date) queryParams.append("end_date", dateRange.end_date)

        const response = await request(
          `/event-types/${id}/statistics?${queryParams.toString()}`,
          "GET"
        )

        if (response.error) {
          throw new Error(response.error)
        }

        return response.data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch event type statistics"
        setError(errorMessage)
        console.error("Error fetching event type statistics:", err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Get events by type
  const getEventsByType = useCallback(
    async (
      id: string,
      filters: {
        status?: string
        start_date?: string
        end_date?: string
        page?: number
        limit?: number
      } = {},
    ) => {
      try {
        setLoading(true)
        setError(null)

        const queryParams = new URLSearchParams()
        if (filters.status) queryParams.append("status", filters.status)
        if (filters.start_date) queryParams.append("start_date", filters.start_date)
        if (filters.end_date) queryParams.append("end_date", filters.end_date)
        if (filters.page) queryParams.append("page", filters.page.toString())
        if (filters.limit) queryParams.append("limit", filters.limit.toString())

        const response = await request(
          `/event-types/${id}/events?${queryParams.toString()}`,
          "GET"
        )

        if (response.error) {
          throw new Error(response.error)
        }

        return response.data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch events by type"
        setError(errorMessage)
        console.error("Error fetching events by type:", err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Get event type template
  const getEventTypeTemplate = useCallback(
    async (id: string) => {
      try {
        setLoading(true)
        setError(null)

        const response = await request(`/event-types/${id}/template`, "GET")

        if (response.error) {
          throw new Error(response.error)
        }

        return response.data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch event type template"
        setError(errorMessage)
        console.error("Error fetching event type template:", err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Update event type template
  const updateEventTypeTemplate = useCallback(
    async (id: string, templateData: Partial<EventTypeTemplate>) => {
      try {
        setLoading(true)
        setError(null)

        const response = await request(`/event-types/${id}/template`, "POST", templateData)

        if (response.error) {
          throw new Error(response.error)
        }

        if (response.data) {
          setEventTypes((prev) => prev.map((eventType) => (eventType._id === id ? response.data : eventType)))
          return response.data
        }

        throw new Error("Failed to update event type template")
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update event type template"
        setError(errorMessage)
        console.error("Error updating event type template:", err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Load initial data
  useEffect(() => {
    if (hotelId) {
      fetchEventTypes({ hotel_id: hotelId })
    }
  }, [hotelId, fetchEventTypes])

  return {
    // State
    eventTypes,
    loading,
    error,

    // Actions
    fetchEventTypes,
    getEventTypeById,
    createEventType,
    updateEventType,
    deleteEventType,
    getEventTypesByCategory,
    getEventTypeStatistics,
    getEventsByType,
    getEventTypeTemplate,
    updateEventTypeTemplate,

    // Utilities
    refreshEventTypes: () => fetchEventTypes(hotelId ? { hotel_id: hotelId } : {}),
  }
}
