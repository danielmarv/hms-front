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
      const endpoint = hotelId ? `/event-venues?hotel_id=${hotelId}` : "/event-venues"
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
      // Error logged in useApi hook
    } finally {
      setLoading(false)
    }
  }, [hotelId, request])

  useEffect(() => {
    fetchVenues()
  }, [fetchVenues])

  // Function to create a new venue
  const createVenue = async (venueData: Partial<Venue>, hotelId?: string) => {
    try {
      setLoading(true)

      // Add hotel_id to the venue data
      const dataWithHotelId = {
        ...venueData,
        hotel_id: hotelId || venueData.hotel_id,
      }

      console.log("Creating venue with data:", dataWithHotelId)

      const response = await request<any>("/event-venues", "POST", dataWithHotelId)

      console.log("Create venue response:", response)

      if (response.error) {
        throw new Error(response.error)
      }

      // Check for different possible response structures
      let createdVenue = null
      if (response.data) {
        // Try different possible response structures
        if (response.data.venue) {
          createdVenue = response.data.venue
        } else if (response.data.data) {
          createdVenue = response.data.data
        } else if (response.data._id) {
          // Response data is the venue itself
          createdVenue = response.data
        } else {
          console.log("Unexpected response structure:", response.data)
        }
      }

      if (createdVenue) {
        // Add the new venue to the state
        setVenues((prevVenues) => [...prevVenues, createdVenue])
        toast.success("Venue created successfully")
        return createdVenue
      } else {
        console.error("No venue data in response:", response)
        throw new Error("Venue was created but no data returned")
      }
    } catch (err) {
      console.error("Failed to create venue:", err)
      setError(err instanceof Error ? err.message : "Failed to create venue")
      // Error logged in useApi hook
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to update a venue
  const updateVenue = async (id: string, venueData: Partial<Venue>, hotelId?: string) => {
    try {
      setLoading(true)

      // Add hotel_id to the venue data if provided
      const dataWithHotelId = hotelId
        ? {
            ...venueData,
            hotel_id: hotelId,
          }
        : venueData

      const response = await request<any>(`/event-venues/${id}`, "PUT", dataWithHotelId)

      if (response.error) {
        throw new Error(response.error)
      }

      // Check for different possible response structures
      let updatedVenue = null
      if (response.data) {
        if (response.data.venue) {
          updatedVenue = response.data.venue
        } else if (response.data.data) {
          updatedVenue = response.data.data
        } else if (response.data._id) {
          updatedVenue = response.data
        }
      }

      if (updatedVenue) {
        // Update the venue in the state
        setVenues((prevVenues) => prevVenues.map((venue) => (venue._id === id ? { ...venue, ...updatedVenue } : venue)))

        toast.success("Venue updated successfully")
        return updatedVenue
      } else {
        throw new Error("Venue was updated but no data returned")
      }
    } catch (err) {
      console.error("Failed to update venue:", err)
      setError(err instanceof Error ? err.message : "Failed to update venue")
      // Error logged in useApi hook
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to delete a venue
  const deleteVenue = async (id: string) => {
    try {
      setLoading(true)
      const response = await request<{ success: boolean }>(`/event-venues/${id}`, "DELETE")

      if (response.error) {
        throw new Error(response.error)
      }

      // Remove the venue from the state
      setVenues((prevVenues) => prevVenues.filter((venue) => venue._id !== id))
      toast.success("Venue deleted successfully")
    } catch (err) {
      console.error("Failed to delete venue:", err)
      setError(err instanceof Error ? err.message : "Failed to delete venue")
      // Error logged in useApi hook
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to get a single venue by ID
  const getVenue = async (id: string) => {
    try {
      setLoading(true)
      const response = await request<any>(`/event-venues/${id}`, "GET")

      if (response.error) {
        throw new Error(response.error)
      }

      // Check for different possible response structures
      if (response.data) {
        if (response.data.venue) {
          return response.data.venue
        } else if (response.data.data) {
          return response.data.data
        } else if (response.data._id) {
          return response.data
        }
      }

      throw new Error(`Failed to fetch venue with ID ${id}`)
    } catch (err) {
      console.error(`Failed to fetch venue with ID ${id}:`, err)
      setError(err instanceof Error ? err.message : `Failed to fetch venue with ID ${id}`)
      // Error logged in useApi hook
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
        `/event-venues/${venueId}/availability?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`,
        "GET",
      )

      if (response.error) {
        throw new Error(response.error)
      }

      return response.data
    } catch (err) {
      console.error("Failed to check venue availability:", err)
      setError(err instanceof Error ? err.message : "Failed to check venue availability")
      // Error logged in useApi hook
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
