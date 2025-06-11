"use client"

import { useState } from "react"
import { useApi } from "./use-api"

export type Guest = {
  _id: string
  full_name: string
  email?: string
  phone: string
  gender?: "male" | "female" | "other"
  dob?: string
  nationality?: string
  id_type?: "passport" | "national_id" | "driver_license" | "other"
  id_number?: string
  id_expiry?: string
  id_scan?: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    zip?: string
  }
  preferences?: {
    bed_type?: "single" | "double" | "queen" | "king" | "twin" | "sofa" | "bunk"
    smoking?: boolean
    floor_preference?: string
    room_location?: string
    dietary_requirements?: string[]
    special_requests?: string
    amenities?: string[]
  }
  loyalty_program: {
    member: boolean
    points: number
    tier: "standard" | "silver" | "gold" | "platinum"
    member_since?: string
    membership_number?: string
  }
  marketing_preferences?: {
    email_opt_in: boolean
    sms_opt_in: boolean
    mail_opt_in: boolean
  }
  notes?: string
  tags?: string[]
  vip: boolean
  blacklisted: boolean
  blacklist_reason?: string
  company?: {
    name?: string
    position?: string
    address?: string
    tax_id?: string
  }
  emergency_contact?: {
    name?: string
    relationship?: string
    phone?: string
    email?: string
  }
  stay_history?: {
    total_stays: number
    last_stay?: string
    average_stay_length: number
    total_spent: number
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
  // Virtual fields
  full_address?: string
  age?: number
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

export type CreateGuestData = Omit<
  Guest,
  "_id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "stay_history" | "full_address" | "age"
>

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
      success: boolean
      count: number
      total: number
      pagination: { page: number; limit: number; totalPages: number }
      data: Guest[]
    }>(`/guests?${queryParams.toString()}`)
  }

  const getGuestById = async (id: string) => {
    // Skip API call for "new" route
    if (id === "new") {
      return { data: null, error: null, isLoading: false }
    }
    return await request<{
      success: boolean
      data: Guest
    }>(`/guests/${id}`)
  }

  const getGuestBookingHistory = async (id: string) => {
    return await request<{
      success: boolean
      count: number
      data: GuestBooking[]
    }>(`/guests/${id}/bookings`)
  }

  const createGuest = async (guestData: Partial<CreateGuestData>) => {
    return await request<{
      success: boolean
      data: Guest
    }>("/guests", "POST", guestData)
  }

  const updateGuest = async (id: string, guestData: Partial<CreateGuestData>) => {
    return await request<{
      success: boolean
      data: Guest
    }>(`/guests/${id}`, "PUT", guestData)
  }

  const deleteGuest = async (id: string) => {
    return await request<{
      success: boolean
      message: string
    }>(`/guests/${id}`, "DELETE")
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
    return await request<{
      success: boolean
      message: string
      data: Guest["loyalty_program"]
    }>(`/guests/${id}/loyalty`, "PATCH", loyaltyData)
  }

  const toggleVipStatus = async (id: string) => {
    return await request<{
      success: boolean
      message: string
      data: { vip: boolean }
    }>(`/guests/${id}/vip`, "PATCH")
  }

  const toggleBlacklistStatus = async (id: string, blacklisted: boolean, reason?: string) => {
    return await request<{
      success: boolean
      message: string
      data: { blacklisted: boolean; reason?: string }
    }>(`/guests/${id}/blacklist`, "PATCH", { blacklisted, reason })
  }

  const getGuestStatistics = async () => {
    const response = await request<{
      success: boolean
      data: GuestStats
    }>("/guests/stats")
    if (response.data?.data) {
      setGuestStats(response.data.data)
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
