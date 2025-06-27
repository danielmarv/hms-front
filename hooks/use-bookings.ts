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
    nationality?: string
    id_type?: string
    id_number?: string
    address?: any
    vip?: boolean
  }
  room: {
    _id: string
    number: string
    floor: string
    building?: string
    room_type: {
      _id: string
      name: string
      base_price: number
      category: string
    }
    status: string
  }
  check_in: string
  check_out: string
  number_of_guests: number
  status: "confirmed" | "checked_in" | "checked_out" | "cancelled" | "no_show"
  payment_status: "pending" | "partial" | "paid" | "refunded"
  payment_method?: string
  total_amount: number
  special_requests?: string
  booking_source: "direct" | "website" | "phone" | "email" | "walk_in" | "agent" | "ota" | "other"
  rate_plan?: {
    _id: string
    title: string
    price: number
    condition: string
  }
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
  assigned_staff?: {
    _id: string
    full_name: string
    email: string
  }
  check_in_time?: string
  check_out_time?: string
  actual_check_in?: string
  actual_check_out?: string
  no_show_charged: boolean
  early_check_in: boolean
  late_check_out: boolean
  early_check_in_fee: number
  late_check_out_fee: number
  was_modified: boolean
  modification_notes?: string
  cancellation_reason?: string
  cancellation_date?: string
  duration: number
  grand_total: number
  createdAt: string
  updatedAt: string
  createdBy?: {
    _id: string
    full_name: string
  }
  updatedBy?: {
    _id: string
    full_name: string
  }
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
  payment_status?: string
  payment_method?: string
  total_amount: number
  special_requests?: string
  rate_plan?: string
  discount?: number
  discount_reason?: string
  tax_rate?: number
  is_group_booking?: boolean
  group_id?: string
  is_corporate?: boolean
  corporate_id?: string
  assigned_staff?: string
}

export type AvailableRoomFilters = {
  check_in: string
  check_out: string
  room_type?: string
  capacity?: number
  floor?: string
  building?: string
  view?: string
}

export function useBookings() {
  const { request, isLoading } = useApi()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availableRooms, setAvailableRooms] = useState<any[]>([])

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

  const createBooking = async (bookingData: CreateBookingData) => {
    return await request("/bookings", "POST", bookingData)
  }

  const updateBooking = async (
    id: string,
    bookingData: Partial<CreateBookingData> & { modification_notes?: string },
  ) => {
    return await request(
      `/bookings/${id}`, "PUT", bookingData
    )
  }

  const cancelBooking = async (id: string, cancellation_reason: string) => {
    return await request(
      `/bookings/${id}/cancel`, "PATCH", { cancellation_reason }
    )
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

  const getAvailableRooms = async (filters: AvailableRoomFilters) => {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })

    const response = await request<{
      success: boolean
      count: number
      data: any[]
    }>(`/bookings/available-rooms?${queryParams.toString()}`)

    if (response.data?.data) {
      setAvailableRooms(response.data.data)
    }

    return response
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
