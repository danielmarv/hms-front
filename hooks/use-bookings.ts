"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"

export type Booking = {
  _id: string
  guest: {
    _id: string
    full_name: string
    email: string
    phone: string
    nationality?: string
    vip?: boolean
  }
  room: {
    _id: string
    number: string
    floor: number
    building?: string
    room_type?: {
      _id: string
      name: string
      base_price: number
      category?: string
    }
  }
  check_in: string
  check_out: string
  number_of_guests: number
  booking_source: string
  payment_status: string
  payment_method?: string
  total_amount: number
  special_requests?: string
  status: string
  confirmation_number: string
  rate_plan?: string
  additional_charges?: Array<{
    description: string
    amount: number
    date: string
  }>
  discount?: number
  discount_reason?: string
  tax_amount: number
  tax_rate: number
  is_group_booking: boolean
  group_id?: string
  is_corporate: boolean
  corporate_id?: string
  assigned_staff?: string
  check_in_time?: string
  check_out_time?: string
  actual_check_in?: string
  actual_check_out?: string
  no_show_charged: boolean
  early_check_in: boolean
  late_check_out: boolean
  early_check_in_fee: number
  late_check_out_fee: number
  cancellation_reason?: string
  cancellation_date?: string
  was_modified: boolean
  modification_notes?: string
  createdAt: string
  updatedAt: string
  duration: number
  grand_total: number
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

export type CreateBookingData = {
  guest: string
  room: string
  check_in: string
  check_out: string
  number_of_guests: number
  booking_source: string
  payment_status: string
  payment_method: string
  total_amount: number
  special_requests: string
  rate_plan: string
  discount: number
  discount_reason: string
  tax_rate: number
  is_group_booking: boolean
  group_id: string
  is_corporate: boolean
  corporate_id: string
  assigned_staff: string
}

export type AvailableRoomFilters = {
  check_in: string
  check_out: string
  capacity: number
  room_type?: string
  floor?: string
  building?: string
  view?: string
}

export function useBookings() {
  const { request, isLoading } = useApi()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availableRooms, setAvailableRooms] = useState<any[]>([])

  const getBookings = useCallback(
    async (filters: BookingFilters = {}) => {
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString())
        }
      })

      const url = `/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
      const { data, error } = await request(url)

      if (error) {
        console.error("API error:", error)
        setBookings([])
        return { data: [], total: 0 }
      }

      let bookingsData: Booking[] = []
      let total = 0
      let pagination = null

      if (data) {
        if (Array.isArray(data)) {
          bookingsData = data
          total = data.length
        } else if (data.data && Array.isArray(data.data)) {
          bookingsData = data.data
          total = data.total || data.data.length
          pagination = data.pagination
        }
      }

      setBookings(bookingsData)
      return { data: { data: bookingsData, total, pagination } }
    },
    [request],
  )

  const getBookingById = useCallback(
    async (id: string) => {
      const { data, error } = await request(`/bookings/${id}`)
      return error || !data?.success ? null : data?.data
    },
    [request],
  )

  const createBooking = useCallback(
    async (bookingData: CreateBookingData) => {
      const { data, error } = await request(
        "/bookings",
        "POST",
        bookingData,
      )

      if (!error && data?.success && data.data) {
        setBookings((prev) => [...prev, data.data])
      }

      return {
        data: error || !data?.success ? null : data?.data,
        error: error || (data?.success === false ? data?.message : null),
      }
    },
    [request],
  )

  const updateBooking = useCallback(
    async (id: string, bookingData: Partial<Booking>) => {
      const { data, error } = await request(
        `/bookings/${id}`,
        "PUT",
        bookingData,
      )

      if (!error && data?.success && data.data) {
        setBookings((prev) => prev.map((booking) => (booking._id === id ? { ...booking, ...data.data } : booking)))
      }

      return {
        data: error || !data?.success ? null : data?.data,
        error: error || (data?.success === false ? data?.message : null),
      }
    },
    [request],
  )

  const cancelBooking = useCallback(
    async (id: string, cancellation_reason: string) => {
      const { data, error } = await request(
        `/bookings/${id}/cancel`,
        "PATCH",
        { cancellation_reason },
      )

      if (!error && data?.success && data.data) {
        setBookings((prev) => prev.map((booking) => (booking._id === id ? { ...booking, ...data.data } : booking)))
      }

      return {
        data: error || !data?.success ? null : data?.data,
        error: error || (data?.success === false ? data?.message : null),
      }
    },
    [request],
  )

  const checkInBooking = useCallback(
    async (id: string) => {
      const { data, error } = await request(
        `/bookings/${id}/check-in`,
        "PATCH",
      )

      if (!error && data?.success && data.data) {
        setBookings((prev) => prev.map((booking) => (booking._id === id ? { ...booking, ...data.data } : booking)))
      }

      return {
        data: error || !data?.success ? null : data?.data,
        error: error || (data?.success === false ? data?.message : null),
      }
    },
    [request],
  )

  const checkOutBooking = useCallback(
    async (id: string) => {
      const { data, error } = await request(
        `/bookings/${id}/check-out`,
        "PATCH",
      )

      if (!error && data?.success && data.data) {
        setBookings((prev) => prev.map((booking) => (booking._id === id ? { ...booking, ...data.data } : booking)))
      }

      return {
        data: error || !data?.success ? null : data?.data,
        error: error || (data?.success === false ? data?.message : null),
      }
    },
    [request],
  )

  const getAvailableRooms = useCallback(
    async (filters: AvailableRoomFilters) => {
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString())
        }
      })

      const url = `/bookings/available-rooms?${queryParams.toString()}`
      const { data, error } = await request(url)

      if (error) {
        console.error("API error:", error)
        setAvailableRooms([])
        return []
      }

      let roomsData: any[] = []

      if (data) {
        if (Array.isArray(data)) {
          roomsData = data
        } else if (data.data && Array.isArray(data.data)) {
          roomsData = data.data
        }
      }

      setAvailableRooms(roomsData)
      return roomsData
    },
    [request],
  )

  const getBookingStats = useCallback(
    async (filters: { start_date?: string; end_date?: string } = {}) => {
      const queryParams = new URLSearchParams()

      if (filters.start_date) queryParams.append("start_date", filters.start_date)
      if (filters.end_date) queryParams.append("end_date", filters.end_date)

      const url = `/bookings/stats${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
      const { data, error } = await request<{ data: any; success: boolean }>(url)

      return {
        data: error || !data?.success ? null : data,
        error: error || (data?.success === false ? "Failed to fetch stats" : null),
      }
    },
    [request],
  )

  const getBookingCalendar = useCallback(
    async (start_date: string, end_date: string) => {
      const queryParams = new URLSearchParams()
      queryParams.append("start_date", start_date)
      queryParams.append("end_date", end_date)

      const url = `/bookings/calendar?${queryParams.toString()}`
      const { data, error } = await request<{ data: any[]; success: boolean }>(url)

      return {
        data: error || !data?.success ? [] : data?.data || [],
        error: error || (data?.success === false ? "Failed to fetch calendar data" : null),
      }
    },
    [request],
  )

  return {
    bookings,
    availableRooms,
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
