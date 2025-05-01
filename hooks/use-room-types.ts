"use client"

import { useState } from "react"
import { useApi } from "./use-api"

export type RoomType = {
  _id: string
  name: string
  description: string
  basePrice: number // Changed from base_price to match API response
  bedConfiguration: string
  size: number
  maxOccupancy: number // Changed from max_occupancy to match API response
  capacity: {
    adults: number
    children: number
  }
  amenities?: string[]
  images?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  id?: string // Added as it appears in the API response
  availableRoomsCount?: number // Added as it appears in the API response
}

export function useRoomTypes() {
  const { request, isLoading } = useApi()
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])

  const fetchRoomTypes = async () => {
    const { data, error } = await request<{ data: RoomType[] } | RoomType[]>("/room-types")

    if (error) {
      setRoomTypes([])
      return []
    }

    let roomTypesData: RoomType[] = []

    if (data) {
      // If data is an array, use it directly
      if (Array.isArray(data)) {
        roomTypesData = data
      }
      // If data has a 'data' property that's an array, use that
      else if (data.data && Array.isArray(data.data)) {
        roomTypesData = data.data
      }
    }

    console.log("Processed room types data:", roomTypesData)
    setRoomTypes(roomTypesData)
    return roomTypesData
  }

  const fetchRoomTypeById = async (id: string) => {
    const { data, error } = await request<{ data: RoomType; success: boolean }>(`/room-types/${id}`)
    return error || !data?.success ? null : data?.data
  }

  const createRoomType = async (roomTypeData: Partial<RoomType>) => {
    const { data, error } = await request<{ data: RoomType; success: boolean; message?: string }>(
      "/room-types",
      "POST",
      roomTypeData,
    )
    return {
      data: error || !data?.success ? null : data?.data,
      error: error || (data?.success === false ? data?.message : null),
    }
  }

  const updateRoomType = async (id: string, roomTypeData: Partial<RoomType>) => {
    const { data, error } = await request<{ data: RoomType; success: boolean; message?: string }>(
      `/room-types/${id}`,
      "PUT",
      roomTypeData,
    )
    return {
      data: error || !data?.success ? null : data?.data,
      error: error || (data?.success === false ? data?.message : null),
    }
  }

  const deleteRoomType = async (id: string) => {
    const { data, error } = await request<{ message: string; success: boolean }>(`/room-types/${id}`, "DELETE")
    return { success: !error && data?.success, message: error || data?.message }
  }

  const fetchRoomTypeStats = async () => {
    const { data, error } = await request<{ data: any[]; success: boolean }>("/room-types/stats")
    return error || !data?.success ? [] : data?.data || []
  }

  return {
    roomTypes,
    isLoading,
    fetchRoomTypes,
    fetchRoomTypeById,
    createRoomType,
    updateRoomType,
    deleteRoomType,
    fetchRoomTypeStats,
  }
}
