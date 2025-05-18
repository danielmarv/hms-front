"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { Venue } from "./use-events"

export function useVenues(hotelId?: string) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true)
        const url = hotelId ? `/api/events/venues?hotel_id=${hotelId}` : "/api/events/venues"
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Error fetching venues: ${response.statusText}`)
        }

        const data = await response.json()
        setVenues(data.venues)
      } catch (err) {
        console.error("Failed to fetch venues:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch venues")
        toast.error("Failed to load venues")
      } finally {
        setLoading(false)
      }
    }

    fetchVenues()
  }, [hotelId])

  // Function to create a new venue
  const createVenue = async (venueData: Partial<Venue>) => {
    try {
      setLoading(true)
      const response = await fetch("/api/events/venues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(venueData),
      })

      if (!response.ok) {
        throw new Error(`Error creating venue: ${response.statusText}`)
      }

      const data = await response.json()

      // Add the new venue to the state
      setVenues((prevVenues) => [...prevVenues, data.venue])

      toast.success("Venue created successfully")
      return data.venue
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
      const response = await fetch(`/api/events/venues/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(venueData),
      })

      if (!response.ok) {
        throw new Error(`Error updating venue: ${response.statusText}`)
      }

      const data = await response.json()

      // Update the venue in the state
      setVenues((prevVenues) => prevVenues.map((venue) => (venue._id === id ? { ...venue, ...data.venue } : venue)))

      toast.success("Venue updated successfully")
      return data.venue
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
      const response = await fetch(`/api/events/venues/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error deleting venue: ${response.statusText}`)
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
      const response = await fetch(`/api/events/venues/${id}`)

      if (!response.ok) {
        throw new Error(`Error fetching venue: ${response.statusText}`)
      }

      const data = await response.json()
      return data.venue
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
      const response = await fetch(
        `/api/events/venues/${venueId}/availability?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`,
      )

      if (!response.ok) {
        throw new Error(`Error checking venue availability: ${response.statusText}`)
      }

      const data = await response.json()
      return data
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
  }
}
