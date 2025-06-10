"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { useApi } from "@/hooks/use-api"
import type { Venue } from "./use-events"

export function useVenues(hotelId?: string) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { request } = useApi()

  const fetchVenues = useCallback(async () => {
    try {
      setLoading(true)
      const endpoint = hotelId ? `/events/event-venues?hotel_id=${hotelId}` : "/events/event-venues"
      const response = await request<{ venues: Venue[] }>(endpoint, "GET")

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data && response.data.venues) {
        setVenues(response.data.venues)
      } else {
        setVenues([])
      }
    } catch (err) {
      console.error("Failed to fetch venues:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch venues")
      toast.error("Failed to load venues")
    } finally {
      setLoading(false)
    }
  }, [hotelId, request])

  useEffect(() => {
    fetchVenues()
  }, [fetchVenues])

  // Function to create a new venue
  const createVenue = async (venueData: Partial<Venue>) => {
    try {
      setLoading(true)
      const response = await request<{ venue: Venue }>("/events/event-venues", "POST", venueData)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data && response.data.venue) {
        // Add the new venue to the state
        setVenues((prevVenues) => [...prevVenues, response.data.venue])
        toast.success("Venue created successfully")
        return response.data.venue
      }

      throw new Error("Failed to create venue")
    } catch (err) {
      console.error("Failed to create venue:", err)
      setError(err instanceof Error ? err.message : "Failed to create venue")
      toast.error("Failed to create venue")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to update a venue
  const updateVenue = async (id: string, venueData: Partial<Venue>) => {
    try {
      setLoading(true)
      const response = await request<{ venue: Venue }>(`/events/event-venues/${id}`, "PUT", venueData)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data && response.data.venue) {
        // Update the venue in the state
        setVenues((prevVenues) =>
          prevVenues.map((venue) => (venue._id === id ? { ...venue, ...response.data.venue } : venue)),
        )

        toast.success("Venue updated successfully")
        return response.data.venue
      }

      throw new Error("Failed to update venue")
    } catch (err) {
      console.error("Failed to update venue:", err)
      setError(err instanceof Error ? err.message : "Failed to update venue")
      toast.error("Failed to update venue")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to delete a venue
  const deleteVenue = async (id: string) => {
    try {
      setLoading(true)
      const response = await request<{ success: boolean }>(`/events/event-venues/${id}`, "DELETE")

      if (response.error) {
        throw new Error(response.error)
      }

      // Remove the venue from the state
      setVenues((prevVenues) => prevVenues.filter((venue) => venue._id !== id))
      toast.success("Venue deleted successfully")
    } catch (err) {
      console.error("Failed to delete venue:", err)
      setError(err instanceof Error ? err.message : "Failed to delete venue")
      toast.error("Failed to delete venue")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to get a single venue by ID
  const getVenue = async (id: string) => {
    try {
      setLoading(true)
      const response = await request<{ venue: Venue }>(`/events/event-venues/${id}`, "GET")

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data && response.data.venue) {
        return response.data.venue
      }

      throw new Error(`Failed to fetch venue with ID ${id}`)
    } catch (err) {
      console.error(`Failed to fetch venue with ID ${id}:`, err)
      setError(err instanceof Error ? err.message : `Failed to fetch venue with ID ${id}`)
      toast.error("Failed to load venue details")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to check venue availability
  const checkVenueAvailability = async (venueId: string, startDate: Date, endDate: Date) => {
    try {
      setLoading(true)
      const response = await request<{ available: boolean; conflicts?: any[] }>(
        `/events/event-venues/${venueId}/availability?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`,
        "GET",
      )

      if (response.error) {
        throw new Error(response.error)
      }

      return response.data
    } catch (err) {
      console.error("Failed to check venue availability:", err)
      setError(err instanceof Error ? err.message : "Failed to check venue availability")
      toast.error("Failed to check venue availability")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    venues,
    loading,
    error,
    createVenue,
    updateVenue,
    deleteVenue,
    getVenue,
    checkVenueAvailability,
    refreshVenues: fetchVenues,
  }
}
