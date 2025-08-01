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
  deposit_payment_method?: string
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

      if (response && response.data) {
        setCheckIns(response.data)
        return {
          data: response.data,
          total: 'total' in response ? (response as any).total : 0,
          pagination: 'pagination' in response ? (response as any).pagination : null,
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
      // Format the data to match backend expectations
      const apiData = {
        // Guest information
        guest_id: checkInData.guest_id,
        guest_info: checkInData.guest_info,

        // Room and stay information
        room_id: checkInData.room_id,
        expected_check_out: checkInData.expected_check_out,
        number_of_guests: checkInData.number_of_guests,
        number_of_nights: checkInData.number_of_nights,

        // Booking information (optional)
        booking_id: checkInData.booking_id,

        // Additional information
        special_requests: checkInData.special_requests,
        notes: checkInData.notes,
        deposit_amount: checkInData.deposit_amount || 0, // Payment made by guest towards bill
        deposit_payment_method: checkInData.deposit_payment_method,
        key_cards_issued: checkInData.key_cards_issued || 1,
        parking_space: checkInData.parking_space,
        vehicle_details: checkInData.vehicle_details,
        emergency_contact: checkInData.emergency_contact,
      }

      const response = await request("/check-ins", "POST", apiData)

      if (response && response.data) {
        setCheckIns((prev) => [response.data, ...prev])
        toast.success("Guest checked in successfully!")
        return response.data
      }
      throw new Error((response && 'message' in response ? (response as any).message : undefined) || "Failed to check in guest")
    } catch (error) {
      console.error("Check-in error:", error)
      const errorMessage = (error && typeof error === "object" && "message" in error) ? (error as { message?: string }).message : undefined
      toast.error(errorMessage || "Failed to check in guest")
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
    getCurrentOccupancy,
    searchAvailableRooms,
  }
}
