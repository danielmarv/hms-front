"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { EventBooking } from "./use-events"

export function useEventBookings(hotelId?: string) {
  const [bookings, setBookings] = useState<EventBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const url = hotelId ? `/api/events/event-report?hotel=${hotelId}` : "/api/events/event-report"
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Error fetching event-report: ${response.statusText}`)
        }

        const data = await response.json()

        // Transform dates from strings to Date objects
        const bookingsWithDates = data.bookings.map((booking: any) => ({
          ...booking,
          start_date: new Date(booking.start_date),
          end_date: new Date(booking.end_date),
        }))

        setBookings(bookingsWithDates)
      } catch (err) {
        console.error("Failed to fetch bookings:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch bookings")
        toast.error("Failed to load bookings")
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [hotelId])

  // Function to create a new booking
  const createBooking = async (bookingData: Partial<EventBooking>) => {
    try {
      setLoading(true)
      const response = await fetch("/api/events/event-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        throw new Error(`Error creating booking: ${response.statusText}`)
      }

      const data = await response.json()

      // Add the new booking to the state with dates as Date objects
      setBookings((prevBookings) => [
        ...prevBookings,
        {
          ...data.booking,
          start_date: new Date(data.booking.start_date),
          end_date: new Date(data.booking.end_date),
        },
      ])

      toast.success("Booking created successfully")
      return data.booking
    } catch (err) {
      console.error("Failed to create booking:", err)
      setError(err instanceof Error ? err.message : "Failed to create booking")
      toast.error("Failed to create booking")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to update a booking
  const updateBooking = async (id: string, bookingData: Partial<EventBooking>) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/event-report/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        throw new Error(`Error updating booking: ${response.statusText}`)
      }

      const data = await response.json()

      // Update the booking in the state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === id
            ? {
                ...booking,
                ...data.booking,
                start_date: new Date(data.booking.start_date),
                end_date: new Date(data.booking.end_date),
              }
            : booking,
        ),
      )

      toast.success("Booking updated successfully")
      return data.booking
    } catch (err) {
      console.error("Failed to update booking:", err)
      setError(err instanceof Error ? err.message : "Failed to update booking")
      toast.error("Failed to update booking")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to delete a booking
  const deleteBooking = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/event-report/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error deleting booking: ${response.statusText}`)
      }

      // Remove the booking from the state
      setBookings((prevBookings) => prevBookings.filter((booking) => booking._id !== id))

      toast.success("Booking deleted successfully")
    } catch (err) {
      console.error("Failed to delete booking:", err)
      setError(err instanceof Error ? err.message : "Failed to delete booking")
      toast.error("Failed to delete booking")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to get a single booking by ID
  const getBooking = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/event-report/${id}`)

      if (!response.ok) {
        throw new Error(`Error fetching booking: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform dates from strings to Date objects
      const bookingWithDates = {
        ...data.booking,
        start_date: new Date(data.booking.start_date),
        end_date: new Date(data.booking.end_date),
      }

      return bookingWithDates
    } catch (err) {
      console.error(`Failed to fetch booking with ID ${id}:`, err)
      setError(err instanceof Error ? err.message : `Failed to fetch booking with ID ${id}`)
      toast.error("Failed to load booking details")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to update booking status
  const updateBookingStatus = async (id: string, status: string, notes?: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/event-report/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, notes }),
      })

      if (!response.ok) {
        throw new Error(`Error updating booking status: ${response.statusText}`)
      }

      const data = await response.json()

      // Update the booking in the state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === id
            ? {
                ...booking,
                ...data.booking,
                start_date: new Date(data.booking.start_date),
                end_date: new Date(data.booking.end_date),
              }
            : booking,
        ),
      )

      toast.success("Booking status updated successfully")
      return data.booking
    } catch (err) {
      console.error("Failed to update booking status:", err)
      setError(err instanceof Error ? err.message : "Failed to update booking status")
      toast.error("Failed to update booking status")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to add payment to booking
  const addBookingPayment = async (
    id: string,
    paymentData: { amount: number; method: string; reference?: string; notes?: string },
  ) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/event-report/${id}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        throw new Error(`Error adding payment to booking: ${response.statusText}`)
      }

      const data = await response.json()

      // Update the booking in the state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === id
            ? {
                ...booking,
                ...data.booking,
                start_date: new Date(data.booking.start_date),
                end_date: new Date(data.booking.end_date),
              }
            : booking,
        ),
      )

      toast.success("Payment added successfully")
      return data.booking
    } catch (err) {
      console.error("Failed to add payment to booking:", err)
      setError(err instanceof Error ? err.message : "Failed to add payment to booking")
      toast.error("Failed to add payment")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to confirm booking
  const confirmBooking = async (
    id: string,
    confirmationData?: { contract_signed?: boolean; signed_by?: string; terms_accepted?: boolean },
  ) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/event-report/${id}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(confirmationData || {}),
      })

      if (!response.ok) {
        throw new Error(`Error confirming booking: ${response.statusText}`)
      }

      const data = await response.json()

      // Update the booking in the state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === id
            ? {
                ...booking,
                ...data.booking,
                start_date: new Date(data.booking.start_date),
                end_date: new Date(data.booking.end_date),
              }
            : booking,
        ),
      )

      toast.success("Booking confirmed successfully")
      return data.booking
    } catch (err) {
      console.error("Failed to confirm booking:", err)
      setError(err instanceof Error ? err.message : "Failed to confirm booking")
      toast.error("Failed to confirm booking")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to cancel booking
  const cancelBooking = async (id: string, reason: string, refundAmount?: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/event-report/${id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason, refund_amount: refundAmount }),
      })

      if (!response.ok) {
        throw new Error(`Error cancelling booking: ${response.statusText}`)
      }

      const data = await response.json()

      // Update the booking in the state
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === id
            ? {
                ...booking,
                ...data.booking,
                start_date: new Date(data.booking.start_date),
                end_date: new Date(data.booking.end_date),
              }
            : booking,
        ),
      )

      toast.success("Booking cancelled successfully")
      return data.booking
    } catch (err) {
      console.error("Failed to cancel booking:", err)
      setError(err instanceof Error ? err.message : "Failed to cancel booking")
      toast.error("Failed to cancel booking")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBooking,
    deleteBooking,
    getBooking,
    updateBookingStatus,
    addBookingPayment,
    confirmBooking,
    cancelBooking,
  }
}
