"use client"

import { useState } from "react"
import { useApi } from "./use-api"

export type Guest = {
  _id: string
  full_name: string
  email: string
  phone: string
  gender?: string
  dob?: string
  nationality?: string
  id_type?: string
  id_number?: string
  id_expiry?: string
  address?: {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  preferences?: {
    room_type?: string
    pillow_type?: string
    special_requests?: string[]
    dietary_restrictions?: string[]
  }
  loyalty_program: {
    member: boolean
    points: number
    tier: string
    membership_number?: string
    member_since?: string
  }
  marketing_preferences?: {
    email: boolean
    sms: boolean
    phone: boolean
    mail: boolean
  }
  notes?: string
  tags?: string[]
  vip: boolean
  blacklisted: boolean
  blacklist_reason?: string
  company?: {
    name: string
    position?: string
    address?: string
    tax_id?: string
  }
  emergency_contact?: {
    name: string
    relationship: string
    phone: string
  }
  stay_history?: {
    total_stays: number
    last_stay_date?: string
    total_spent?: number
    average_stay_length?: number
    favorite_room_type?: {
      _id: string
      name: string
      category: string
    }
  }
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

export type GuestBooking = {
  _id: string
  room: {
    _id: string
    number: string
    floor: string
    building: string
  }
  rate_plan: {
    _id: string
    title: string
    price: number
  }
  check_in: string
  check_out: string
  status: string
  total_amount: number
  payment_status: string
}

export type GuestStats = {
  totalGuests: number
  vipGuests: number
  blacklistedGuests: number
  loyaltyMembers: number
  loyaltyTiers: Array<{ _id: string; count: number }>
  nationalityDistribution: Array<{ _id: string; count: number }>
  recentGuests: Array<{ _id: string; full_name: string; email: string; phone: string }>
}

export type GuestFilters = {
  search?: string
  email?: string
  phone?: string
  nationality?: string
  vip?: boolean
  blacklisted?: boolean
  loyalty_member?: boolean
  loyalty_tier?: string
  page?: number
  limit?: number
  sort?: string
}

export type CreateGuestData = Omit<Guest, "_id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy">

export function useGuests() {
  const { request, isLoading } = useApi()
  const [guestStats, setGuestStats] = useState<GuestStats | null>(null)

  const getGuests = async (filters: GuestFilters = {}) => {
    // Convert filters to query string
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })

    return await request<{
      count: number
      total: number
      pagination: { page: number; limit: number; totalPages: number }
      data: Guest[]
    }>(`/guests?${queryParams.toString()}`)
  }

  const getGuestById = async (id: string) => {
    return await request<Guest>(`/guests/${id}`)
  }

  const getGuestBookingHistory = async (id: string) => {
    return await request<{ count: number; data: GuestBooking[] }>(`/guests/${id}/bookings`)
  }

  const createGuest = async (guestData: Partial<CreateGuestData>) => {
    return await request<Guest>("/guests", "POST", guestData)
  }

  const updateGuest = async (id: string, guestData: Partial<CreateGuestData>) => {
    return await request<Guest>(`/guests/${id}`, "PUT", guestData)
  }

  const deleteGuest = async (id: string) => {
    return await request<{ message: string }>(`/guests/${id}`, "DELETE")
  }

  const updateGuestLoyalty = async (
    id: string,
    loyaltyData: {
      member?: boolean
      points?: number
      tier?: string
      membership_number?: string
    },
  ) => {
    return await request<{ message: string; data: Guest["loyalty_program"] }>(
      `/guests/${id}/loyalty`,
      "PATCH",
      loyaltyData,
    )
  }

  const toggleVipStatus = async (id: string) => {
    return await request<{ message: string; data: { vip: boolean } }>(`/guests/${id}/vip`, "PATCH")
  }

  const toggleBlacklistStatus = async (id: string, blacklisted: boolean, reason?: string) => {
    return await request<{ message: string; data: { blacklisted: boolean; reason?: string } }>(
      `/guests/${id}/blacklist`,
      "PATCH",
      { blacklisted, reason },
    )
  }

  const getGuestStatistics = async () => {
    const response = await request<GuestStats>("/guests/stats")
    if (response.data) {
      setGuestStats(response.data)
    }
    return response
  }

  return {
    getGuests,
    getGuestById,
    getGuestBookingHistory,
    createGuest,
    updateGuest,
    deleteGuest,
    updateGuestLoyalty,
    toggleVipStatus,
    toggleBlacklistStatus,
    getGuestStatistics,
    guestStats,
    isLoading,
  }
}
