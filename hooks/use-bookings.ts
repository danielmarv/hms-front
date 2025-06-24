"use client"

import { useState } from "react"
import { useApi } from "./use-api"

export type Booking = {
  _id: string
  confirmation_number: string
  guest: {
    _id: string
    full_name: string
    email: string
    phone: string
    vip?: boolean
  }
  room: {
    _id: string
    number: string
    floor: string
    building?: string
  }
  room_type: {
    _id: string
    name: string
    base_price: number
  }
  check_in: string
  check_out: string
  number_of_guests: number
  status: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show"
  payment_status: "pending" | "partial" | "paid" | "refunded"
  total_amount: number
  special_requests?: string
  booking_source: string
  createdAt: string
  updatedAt: string
}

export type BookingFilters = {
  guest?: string
  room?: string
  status?: string
  payment_status?: string
  start_date?: string
  end_date?: string
  booking_source?: string
  page?: number
  limit?: number
  sort?: string
}

export function useBookings() {
  const { request, isLoading } = useApi()
  const [bookings, setBookings] = useState<Booking[]>([])

  const getBookings = async (filters: BookingFilters = {}) => {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })

    const response = await request(`/bookings?${queryParams.toString()}`)

    if (response.data?.data) {
      setBookings(response.data.data)
    }

    return response
  }

  const getBookingById = async (id: string) => {
    return await request(`/bookings/${id}`)
  }

  const createBooking = async (bookingData: Partial<Booking>) => {
    return await request<{
      success: boolean
      data: Booking
    }>("/bookings", "POST", bookingData)
  }

  const updateBooking = async (id: string, bookingData: Partial<Booking>) => {
    return await request<{
      success: boolean
      data: Booking
    }>(`/bookings/${id}`, "PUT", bookingData)
  }

  const cancelBooking = async (id: string, cancellation_reason: string) => {
    return await request<{
      success: boolean
      message: string
      data: Booking
    }>(`/bookings/${id}/cancel`, "PATCH", { cancellation_reason })
  }

  const checkInBooking = async (id: string) => {
    return await request<{
      success: boolean
      message: string
      data: Booking
    }>(`/bookings/${id}/check-in`, "PATCH")
  }

  const checkOutBooking = async (id: string) => {
    return await request<{
      success: boolean
      message: string
      data: Booking
    }>(`/bookings/${id}/check-out`, "PATCH")
  }

  const getAvailableRooms = async (filters: {
    check_in: string
    check_out: string
    room_type?: string
    capacity?: number
    floor?: string
    building?: string
    view?: string
  }) => {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })

    return await request<{
      success: boolean
      count: number
      data: any[]
    }>(`/bookings/available-rooms?${queryParams.toString()}`)
  }

  const getBookingStats = async (filters: { start_date?: string; end_date?: string } = {}) => {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })

    return await request<{
      success: boolean
      data: {
        byStatus: any[]
        bySource: any[]
        daily: any[]
        totals: {
          totalBookings: number
          totalRevenue: number
          avgBookingValue: number
        }
      }
    }>(`/bookings/stats?${queryParams.toString()}`)
  }

  const getBookingCalendar = async (start_date: string, end_date: string) => {
    return await request<{
      success: boolean
      count: number
      data: any[]
    }>(`/bookings/calendar?start_date=${start_date}&end_date=${end_date}`)
  }

  return {
    bookings,
    isLoading,
    getBookings,
    getBookingById,
    createBooking,
    updateBooking,
    cancelBooking,
    checkInBooking,
    checkOutBooking,
    getAvailableRooms,
    getBookingStats,
    getBookingCalendar,
  }
}
