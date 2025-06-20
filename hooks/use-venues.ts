"use client"

import { useState, useCallback, useEffect } from "react"
import { useApi } from "./use-api"

export interface Venue {
  _id: string
  name: string
  description?: string
  hotel_id: string
  type: "ballroom" | "conference_room" | "meeting_room" | "banquet_hall" | "outdoor" | "restaurant" | "other"
  capacity: number
  area?: {
    value: number
    unit: "sq_ft" | "sq_m"
  }
  location?: {
    floor?: string
    building?: string
    directions?: string
  }
  amenities?: string[]
  features?: string[]
  pricing?: {
    base_price: number
    price_per_hour: number
    price_per_person: number
    minimum_spend: number
    currency: string
  }
  availability: {
    days_of_week: number[]
    start_time: string
    end_time: string
    exceptions: Array<{
      date: Date
      available: boolean
      reason: string
    }>
  }
  setup_time: number
  teardown_time: number
  minimum_hours: number
  cancellation_policy: "flexible" | "moderate" | "strict"
  images?: Array<{
    url: string
    caption?: string
  }>
  floor_plan?: {
    url: string
    width: number
    height: number
  }
  status: "active" | "inactive" | "maintenance"
  maintenance?: {
    start_date: Date
    end_date: Date
    reason: string
    scheduled_by: string
  }
  is_deleted: boolean
  createdBy?: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
}

export interface VenueFilters {
  hotel_id?: string
  status?: string
  type?: string
  capacity_min?: number
  capacity_max?: number
  search?: string
  page?: number
  limit?: number
}

export interface VenueStatistics {
  total_events: number
  confirmed_events: number
  cancelled_events: number
  cancellation_rate: string
  revenue: string
  average_duration: string
  utilization_rate: string
  popular_event_types: Array<{
    id: string
    count: number
  }>
}

export interface VenueAvailability {
  venue: {
    id: string
    name: string
    capacity: number
  }
  date_range: {
    start: Date
    end: Date
  }
  events: any[]
  available_slots: Array<{
    start: Date
    end: Date
    available: boolean
  }>
}

export interface AvailabilityCheck {
  available: boolean
  conflicting_events?: any[]
  venue: {
    id: string
    name: string
    capacity: number
  }
}

export interface MaintenanceSchedule {
  id: string
  title: string
  description: string
  start_date: Date
  end_date: Date
  status: string
  notes?: string
}

export interface CreateVenueData {
  name: string
  description?: string
  hotel_id: string
  type: Venue["type"]
  capacity: number
  area?: Venue["area"]
  location?: Venue["location"]
  amenities?: string[]
  features?: string[]
  pricing?: Venue["pricing"]
  availability?: Venue["availability"]
  setup_time?: number
  teardown_time?: number
  minimum_hours?: number
  cancellation_policy?: Venue["cancellation_policy"]
  images?: Venue["images"]
  floor_plan?: Venue["floor_plan"]
  status?: Venue["status"]
}

export function useVenues(hotelId?: string) {
  const { request, isLoading } = useApi()
  const [error, setError] = useState<string | null>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [totalVenues, setTotalVenues] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  // Clear error helper
  const clearError = useCallback(() => setError(null), [])

  // Get all venues with filters and pagination
  const getAllVenues = useCallback(
    async (filters: VenueFilters = {}) => {
      clearError()

      const params = new URLSearchParams()

      // Add hotel_id from hook parameter or filters
      if (hotelId) params.append("hotel_id", hotelId)
      else if (filters.hotel_id) params.append("hotel_id", filters.hotel_id)

      if (filters.status) params.append("status", filters.status)
      if (filters.type) params.append("type", filters.type)
      if (filters.capacity_min) params.append("capacity_min", filters.capacity_min.toString())
      if (filters.capacity_max) params.append("capacity_max", filters.capacity_max.toString())
      if (filters.search) params.append("search", filters.search)
      if (filters.page) params.append("page", filters.page.toString())
      if (filters.limit) params.append("limit", filters.limit.toString())

      const response = await request(`/event-venues?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return { venues: [], pagination: null }
      }

      if (response.data) {
        const venuesData = response.data.venues || []
        setVenues(venuesData)
        setTotalVenues(response.data.pagination?.total || 0)
        setCurrentPage(response.data.pagination?.page || 1)
        return response.data
      }

      return { venues: [], pagination: null }
    },
    [request, hotelId, clearError],
  )

  // Get venue by ID
  const getVenueById = useCallback(
    async (venueId: string) => {
      clearError()

      const response = await request(`/event-venues/${venueId}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data
    },
    [request, clearError],
  )

  // Create new venue
  const createVenue = useCallback(
    async (venueData: CreateVenueData) => {
      clearError()

      const response = await request("/event-venues", "POST", venueData)

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Refresh venues list
        await getAllVenues({ hotel_id: hotelId })
        return response.data
      }

      return null
    },
    [request, clearError, getAllVenues, hotelId],
  )

  // Update venue
  const updateVenue = useCallback(
    async (venueId: string, updateData: Partial<CreateVenueData>) => {
      clearError()

      const response = await request(`/event-venues/${venueId}`, "PUT", updateData)

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Update local venues list
        setVenues((prev) => prev.map((venue) => (venue._id === venueId ? { ...venue, ...response.data } : venue)))
        return response.data
      }

      return null
    },
    [request, clearError],
  )

  // Delete venue
  const deleteVenue = useCallback(
    async (venueId: string) => {
      clearError()

      const response = await request(`/event-venues/${venueId}`, "DELETE")

      if (response.error) {
        setError(response.error)
        return false
      }

      // Remove from local venues list
      setVenues((prev) => prev.filter((venue) => venue._id !== venueId))
      setTotalVenues((prev) => prev - 1)
      return true
    },
    [request, clearError],
  )

  // Get venues statistics
  const getVenuesStatistics = useCallback(
    async (filters?: { hotel_id?: string; start_date?: Date; end_date?: Date }) => {
      clearError()

      const params = new URLSearchParams()
      if (hotelId) params.append("hotel_id", hotelId)
      else if (filters?.hotel_id) params.append("hotel_id", filters.hotel_id)
      if (filters?.start_date) params.append("start_date", filters.start_date.toISOString())
      if (filters?.end_date) params.append("end_date", filters.end_date.toISOString())

      const response = await request(`/event-venues/statistics?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data
    },
    [request, hotelId, clearError],
  )

  // Get venue availability
  const getVenueAvailability = useCallback(
    async (venueId: string, startDate: Date, endDate: Date): Promise<VenueAvailability | null> => {
      clearError()

      const params = new URLSearchParams()
      params.append("start_date", startDate.toISOString())
      params.append("end_date", endDate.toISOString())

      const response = await request(`/event-venues/${venueId}/availability?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        return {
          ...response.data,
          date_range: {
            start: new Date(response.data.date_range.start),
            end: new Date(response.data.date_range.end),
          },
          available_slots:
            response.data.available_slots?.map((slot: any) => ({
              ...slot,
              start: new Date(slot.start),
              end: new Date(slot.end),
            })) || [],
        }
      }

      return null
    },
    [request, clearError],
  )

  // Check venue availability
  const checkVenueAvailability = useCallback(
    async (
      venueId: string,
      startDate: Date,
      endDate: Date,
      excludeEventId?: string,
    ): Promise<AvailabilityCheck | null> => {
      clearError()

      const requestData = {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        exclude_event_id: excludeEventId,
      }

      const response = await request(`/event-venues/${venueId}/availability/check`, "POST", requestData)

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data
    },
    [request, clearError],
  )

  // Get venue events
  const getVenueEvents = useCallback(
    async (
      venueId: string,
      filters?: {
        start_date?: Date
        end_date?: Date
        status?: string
        page?: number
        limit?: number
      },
    ) => {
      clearError()

      const params = new URLSearchParams()
      if (filters?.start_date) params.append("start_date", filters.start_date.toISOString())
      if (filters?.end_date) params.append("end_date", filters.end_date.toISOString())
      if (filters?.status) params.append("status", filters.status)
      if (filters?.page) params.append("page", filters.page.toString())
      if (filters?.limit) params.append("limit", filters.limit.toString())

      const response = await request(`/event-venues/${venueId}/events?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data
    },
    [request, clearError],
  )

  // Get venue statistics
  const getVenueStatistics = useCallback(
    async (venueId: string, startDate?: Date, endDate?: Date): Promise<VenueStatistics | null> => {
      clearError()

      const params = new URLSearchParams()
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())

      const response = await request(`/event-venues/${venueId}/statistics?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data?.statistics || null
    },
    [request, clearError],
  )

  // Get venues by hotel
  const getVenuesByHotel = useCallback(
    async (targetHotelId?: string, filters?: { status?: string; type?: string }) => {
      clearError()

      const hotelIdToUse = targetHotelId || hotelId
      if (!hotelIdToUse) {
        setError("Hotel ID is required")
        return []
      }

      const params = new URLSearchParams()
      if (filters?.status) params.append("status", filters.status)
      if (filters?.type) params.append("type", filters.type)

      const response = await request(`/event-venues/hotel/${hotelIdToUse}?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return []
      }

      return response.data || []
    },
    [request, hotelId, clearError],
  )

  // Add maintenance schedule
  const addMaintenanceSchedule = useCallback(
    async (
      venueId: string,
      maintenanceData: {
        start_date: Date
        end_date: Date
        reason: string
        notes?: string
      },
    ) => {
      clearError()

      const requestData = {
        start_date: maintenanceData.start_date.toISOString(),
        end_date: maintenanceData.end_date.toISOString(),
        reason: maintenanceData.reason,
        notes: maintenanceData.notes,
      }

      const response = await request(`/event-venues/${venueId}/maintenance`, "POST", requestData)

      if (response.error) {
        setError(response.error)
        return null
      }

      // Update local venue status
      setVenues((prev) =>
        prev.map((venue) => (venue._id === venueId ? { ...venue, status: "maintenance" as const } : venue)),
      )

      return response.data
    },
    [request, clearError],
  )

  // Get maintenance schedule
  const getMaintenanceSchedule = useCallback(
    async (venueId: string): Promise<MaintenanceSchedule[]> => {
      clearError()

      const response = await request(`/event-venues/${venueId}/maintenance`, "GET")

      if (response.error) {
        setError(response.error)
        return []
      }

      if (response.data?.maintenance_schedule) {
        return response.data.maintenance_schedule.map((schedule: any) => ({
          ...schedule,
          start_date: new Date(schedule.start_date),
          end_date: new Date(schedule.end_date),
        }))
      }

      return []
    },
    [request, clearError],
  )

  // Remove maintenance schedule
  const removeMaintenanceSchedule = useCallback(
    async (venueId: string, maintenanceId: string) => {
      clearError()

      const response = await request(`/event-venues/${venueId}/maintenance/${maintenanceId}`, "DELETE")

      if (response.error) {
        setError(response.error)
        return false
      }

      // Update local venue status
      setVenues((prev) =>
        prev.map((venue) => (venue._id === venueId ? { ...venue, status: "active" as const } : venue)),
      )

      return true
    },
    [request, clearError],
  )

  // Refresh venues list
  const refreshVenues = useCallback(
    async (filters?: VenueFilters) => {
      return await getAllVenues(filters)
    },
    [getAllVenues],
  )

  // Load initial venues if hotelId is provided
  useEffect(() => {
    if (hotelId && venues.length === 0) {
      getAllVenues()
    }
  }, [hotelId, venues.length, getAllVenues])

  return {
    // State
    venues,
    totalVenues,
    currentPage,
    loading: isLoading,
    error,

    // Actions
    clearError,
    refreshVenues,

    // CRUD Operations
    getAllVenues,
    getVenueById,
    createVenue,
    updateVenue,
    deleteVenue,

    // Statistics
    getVenuesStatistics,
    getVenueStatistics,

    // Availability
    getVenueAvailability,
    checkVenueAvailability,

    // Events
    getVenueEvents,

    // Hotel-specific
    getVenuesByHotel,

    // Maintenance
    addMaintenanceSchedule,
    getMaintenanceSchedule,
    removeMaintenanceSchedule,
  }
}
