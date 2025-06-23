"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"

export interface CheckInData {
  guest_id?: string
  guest_info?: {
    full_name: string
    email: string
    phone: string
    address?: string
    id_number?: string
    nationality?: string
  }
  room_id: string
  expected_check_out: string
  number_of_guests: number
  number_of_nights?: number
  booking_id?: string
  special_requests?: string
  notes?: string
  deposit_amount?: number
  key_cards_issued?: number
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
  // Registration document data
  registration_document?: {
    guest_signature: string
    agreements: {
      terms_and_conditions: boolean
      privacy_policy: boolean
      damage_policy: boolean
      no_smoking_policy: boolean
    }
    additional_requests?: string
  }
}

export interface CheckInResponse {
  id: string
  guest: any
  room: any
  booking?: any
  check_in_date: string
  expected_check_out: string
  folio_number: string
  status: string
  total_amount: number
  balance_due: number
}

export function useCheckInApi() {
  const [checkIns, setCheckIns] = useState<CheckInResponse[]>([])
  const { request, isLoading } = useApi()

  // Get all check-ins with filtering
  const getCheckIns = async (filters?: {
    status?: string
    check_in_type?: string
    room?: string
    guest?: string
    search?: string
    page?: number
    limit?: number
  }) => {
    try {
      const queryParams = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString())
          }
        })
      }

      const endpoint = `/check-ins${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
      const response = await request(endpoint, "GET")

      if (response.data) {
        setCheckIns(response.data)
        return {
          data: response.data,
          total: response.total,
          pagination: response.pagination,
        }
      }
      return { data: [], total: 0, pagination: null }
    } catch (error) {
      toast.error("Failed to fetch check-ins")
      return { data: [], total: 0, pagination: null }
    }
  }

  // Check-in a guest
  const checkInGuest = async (checkInData: CheckInData) => {
    try {
      const response = await request("/check-ins", "POST", checkInData)
      if (response.data) {
        setCheckIns((prev) => [response.data, ...prev])
        toast.success("Guest checked in successfully!")
        return response.data
      }
      throw new Error("Failed to check in guest")
    } catch (error) {
      toast.error("Failed to check in guest")
      throw error
    }
  }

  // Get check-in by ID
  const getCheckInById = async (checkInId: string) => {
    try {
      const response = await request(`/check-ins/${checkInId}`, "GET")
      return response.data
    } catch (error) {
      toast.error("Failed to fetch check-in details")
      throw error
    }
  }

  // Check-out a guest
  const checkOutGuest = async (
    checkInId: string,
    checkOutData: {
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
    },
  ) => {
    try {
      const response = await request(`/check-ins/${checkInId}/checkout`, "PATCH", checkOutData)
      if (response.data) {
        setCheckIns((prev) => prev.map((checkIn) => (checkIn.id === checkInId ? response.data : checkIn)))
        toast.success("Guest checked out successfully!")
        return response.data
      }
      throw new Error("Failed to check out guest")
    } catch (error) {
      toast.error("Failed to check out guest")
      throw error
    }
  }

  // Add charges to check-in
  const addCharges = async (
    checkInId: string,
    charges: Array<{
      description: string
      amount: number
      category: string
    }>,
  ) => {
    try {
      const response = await request(`/check-ins/${checkInId}/charges`, "POST", { charges })
      if (response.data) {
        setCheckIns((prev) => prev.map((checkIn) => (checkIn.id === checkInId ? response.data : checkIn)))
        toast.success("Charges added successfully!")
        return response.data
      }
      throw new Error("Failed to add charges")
    } catch (error) {
      toast.error("Failed to add charges")
      throw error
    }
  }

  // Add discount to check-in
  const addDiscount = async (
    checkInId: string,
    discount: {
      description: string
      amount: number
      type: "fixed" | "percentage"
    },
  ) => {
    try {
      const response = await request(`/check-ins/${checkInId}/discount`, "POST", discount)
      if (response.data) {
        setCheckIns((prev) => prev.map((checkIn) => (checkIn.id === checkInId ? response.data : checkIn)))
        toast.success("Discount added successfully!")
        return response.data
      }
      throw new Error("Failed to add discount")
    } catch (error) {
      toast.error("Failed to add discount")
      throw error
    }
  }

  // Get guest folio
  const getGuestFolio = async (checkInId: string) => {
    try {
      const response = await request(`/check-ins/${checkInId}/folio`, "GET")
      return response.data
    } catch (error) {
      toast.error("Failed to fetch guest folio")
      throw error
    }
  }

  // Get current occupancy
  const getCurrentOccupancy = async () => {
    try {
      const response = await request("/check-ins/occupancy", "GET")
      return response.data
    } catch (error) {
      toast.error("Failed to fetch occupancy data")
      throw error
    }
  }

  // Search available rooms
  const searchAvailableRooms = async (searchParams: {
    check_in: string
    check_out: string
    guests?: number
    room_type?: string
  }) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })

      const response = await request(`/check-ins/available-rooms?${queryParams.toString()}`, "GET")
      return response.data || []
    } catch (error) {
      toast.error("Failed to search available rooms")
      return []
    }
  }

  return {
    checkIns,
    isLoading,
    getCheckIns,
    checkInGuest,
    getCheckInById,
    checkOutGuest,
    addCharges,
    addDiscount,
    getGuestFolio,
    getCurrentOccupancy,
    searchAvailableRooms,
  }
}
