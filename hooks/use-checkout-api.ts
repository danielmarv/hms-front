"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"

export type CheckIn = {
  _id: string
  folio_number: string
  guest: {
    _id: string
    full_name: string
    email: string
    phone: string
    vip?: boolean
  }
  room: {
    _id: string
    roomNumber: string
    floor: string
  }
  booking?: {
    _id: string
    confirmation_number: string
  }
  check_in_date: string
  expected_check_out: string
  actual_check_out?: string
  number_of_guests: number
  number_of_nights: number
  room_rate: number
  total_room_charges: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  deposit_amount: number
  balance_due: number
  additional_charges: Array<{
    description: string
    amount: number
    category: string
    date: string
  }>
  discounts: Array<{
    description: string
    amount: number
    type: "fixed" | "percentage"
    date: string
  }>
  status: "checked_in" | "checked_out"
  payment_status: "pending" | "partial" | "paid"
  special_requests?: string
  notes?: string
  key_cards_issued: number
  parking_space?: string
  vehicle_details?: {
    license_plate: string
    make: string
    model: string
    color: string
  }
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
  checked_in_by: {
    _id: string
    full_name: string
  }
  checked_out_by?: {
    _id: string
    full_name: string
  }
  createdAt: string
  updatedAt: string
}

export type CheckInFilters = {
  status?: string
  check_in_type?: string
  room?: string
  guest?: string
  search?: string
  page?: number
  limit?: number
  sort?: string
}

export interface CheckOutData {
  additional_charges?: Array<{
    description: string
    amount: number
    category: string
  }>
  discounts?: Array<{
    description: string
    amount: number
    type: "fixed" | "percentage"
  }>
  payment_method?: string
  payment_amount?: number
  notes?: string
}

export interface CheckOutResponse {
  id: string
  guest: any
  room: any
  booking?: any
  check_in_date: string
  actual_check_out: string
  folio_number: string
  status: string
  total_amount: number
  balance_due: number
  payment_status: string
}

export interface AddChargesData {
  charges: Array<{
    description: string
    amount: number
    category: string
  }>
}

export interface AddDiscountData {
  description: string
  amount: number
  type: "fixed" | "percentage"
}

export type OccupancyData = {
  occupied_rooms: CheckIn[]
  total_rooms: number
  occupancy_count: number
  occupancy_rate: number
  available_rooms: number
}

export type GuestFolio = {
  folio_number: string
  guest: any
  room: any
  check_in_date: string
  check_out_date: string
  number_of_nights: number
  room_charges: {
    rate_per_night: number
    number_of_nights: number
    total: number
  }
  additional_charges: Array<{
    description: string
    amount: number
    category: string
    date: string
  }>
  discounts: Array<{
    description: string
    amount: number
    type: "fixed" | "percentage"
    date: string
  }>
  tax: {
    rate: number
    amount: number
  }
  totals: {
    subtotal: number
    discount_total: number
    tax_amount: number
    grand_total: number
    paid_amount: number
    balance_due: number
  }
  payment_status: string
  status: string
}

export const useCheckoutApi = () => {
  const { request, isLoading } = useApi()
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null)
  const [occupancy, setOccupancy] = useState<OccupancyData | null>(null)
  const [folio, setFolio] = useState<GuestFolio | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    total: 0,
  })

  const getAllCheckIns = async (filters: CheckInFilters = {}) => {
    try {
      const queryParams = new URLSearchParams()
      if (filters.status) queryParams.append("status", filters.status)
      if (filters.check_in_type) queryParams.append("check_in_type", filters.check_in_type)
      if (filters.room) queryParams.append("room", filters.room)
      if (filters.guest) queryParams.append("guest", filters.guest)
      if (filters.search) queryParams.append("search", filters.search)
      if (filters.page) queryParams.append("page", filters.page.toString())
      if (filters.limit) queryParams.append("limit", filters.limit.toString())
      if (filters.sort) queryParams.append("sort", filters.sort)

      const response = await request(`/check-ins?${queryParams.toString()}`)

      if (response) {
        setCheckIns(response.data || [])
        setPagination({
          page: (response && (response as any).pagination?.page) ?? 1,
          limit: (response && (response as any).pagination?.limit) ?? 20,
          totalPages: (response && (response as any).pagination?.totalPages) ?? 1,
          total: (response && (response as any).pagination?.total) ?? (response && (response as any).total) ?? 0,
        })
      }

      return response
    } catch (error) {
      console.error("Error fetching check-ins:", error)
      return { success: false, message: "Failed to fetch check-ins" }
    }
  }

  const getCheckInById = async (id: string) => {
    try {
      const response = await request(`/check-ins/${id}`)

      if (response) {
        setCheckIn(response.data || null)
      }

      return response
    } catch (error) {
      console.error(`Error fetching check-in ${id}:`, error)
      return { success: false, message: "Failed to fetch check-in" }
    }
  }

  // Check-out a guest
  const checkOutGuest = async (checkInId: string, checkOutData: CheckOutData) => {
    try {
      const response = await request(`/check-ins/${checkInId}/checkout`, "PATCH", checkOutData)

      if (response && response.data) {
        toast.success("Guest checked out successfully!")
        // Update local state
        if (checkIn && checkIn._id === checkInId) {
          setCheckIn(response.data || null)
        }
        setCheckIns(checkIns.map((ci) => (ci._id === checkInId ? response.data || ci : ci)))
        return response
      }
      throw new Error((response as any)?.message || "Failed to check out guest")
    } catch (error) {
      console.error("Check-out error:", error)
      const errorMessage = typeof error === "object" && error !== null && "message" in error ? (error as { message?: string }).message : undefined
      toast.error(errorMessage || "Failed to check out guest")
      throw error
    }
  }

  // Add charges to check-in
  const addCharges = async (checkInId: string, chargesData: { charges: Array<any> }) => {
    try {
      const response = await request(`/check-ins/${checkInId}/charges`, "POST", chargesData)

      if (response) {
        toast.success("Charges added successfully!")
        // Update local state
        if (checkIn && checkIn._id === checkInId) {
          setCheckIn(response.data || null)
        }
        return response
      }
      throw new Error((response as any).message || "Failed to add charges")
    } catch (error) {
      console.error("Error adding charges:", error)
      const errorMessage = typeof error === "object" && error !== null && "message" in error ? (error as { message?: string }).message : undefined
      toast.error(errorMessage || "Failed to add charges")
      throw error
    }
  }

  // Add discount to check-in
  const addDiscount = async (checkInId: string, discountData: any) => {
    try {
      const response = await request(`/check-ins/${checkInId}/discount`, "POST", discountData)

      if (response) {
        toast.success("Discount added successfully!")
        // Update local state
        if (checkIn && checkIn._id === checkInId) {
          setCheckIn(response.data || null)
        }
        return response
      }
      throw new Error((response as any)?.message || "Failed to add discount")
    } catch (error) {
      console.error("Error adding discount:", error)
      const errorMessage = typeof error === "object" && error !== null && "message" in error ? (error as { message?: string }).message : undefined
      toast.error(errorMessage || "Failed to add discount")
      throw error
    }
  }

  const getCurrentOccupancy = async () => {
    try {
      const response = await request("/check-ins/occupancy")

      if (response) {
        setOccupancy(response.data || null)
      }

      return response
    } catch (error) {
      console.error("Error fetching occupancy:", error)
      return { success: false, message: "Failed to fetch occupancy data" }
    }
  }

  // Get guest folio
  const getGuestFolio = async (checkInId: string) => {
    try {
      const response = await request(`/check-ins/${checkInId}/folio`, "GET")
      if (response && response.data) {
        setFolio(response.data || null)
      }
      return response
    } catch (error) {
      console.error("Error fetching guest folio:", error)
      toast.error("Failed to fetch guest folio")
      throw error
    }
  }

  const searchAvailableRooms = async (filters: {
    check_in: string
    check_out: string
    guests?: number
    room_type?: string
  }) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("check_in", filters.check_in)
      queryParams.append("check_out", filters.check_out)
      if (filters.guests) queryParams.append("guests", filters.guests.toString())
      if (filters.room_type) queryParams.append("room_type", filters.room_type)

      const response = await request(`/check-ins/available-rooms?${queryParams.toString()}`)

      return response
    } catch (error) {
      console.error("Error searching available rooms:", error)
      return { success: false, message: "Failed to search available rooms" }
    }
  }

  return {
    checkIns,
    checkIn,
    occupancy,
    folio,
    pagination,
    isLoading,
    getAllCheckIns,
    getCheckInById,
    checkOutGuest,
    addCharges,
    addDiscount,
    getCurrentOccupancy,
    getGuestFolio,
    searchAvailableRooms,
  }
}
