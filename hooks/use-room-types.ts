"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"

export type RoomType = {
  _id: string
  name: string
  description: string
  basePrice: number
  bedConfiguration: string
  size: number
  maxOccupancy: number
  capacity: {
    adults: number
    children: number
  }
  amenities?: string[]
  images?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  id?: string
  availableRoomsCount?: number
}

export function useRoomTypes() {
  const { request, isLoading } = useApi()
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])

  // Use useCallback to memoize the fetchRoomTypes function
  const fetchRoomTypes = useCallback(async () => {
    const { data, error } = await request<{ data: RoomType[] } | RoomType[]>("/room-types")

    if (error) {
      console.error("API error:", error)
      setRoomTypes([])
      return []
    }

    // Handle both possible response formats
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

    setRoomTypes(roomTypesData)
    return roomTypesData
  }, [request])

  const fetchRoomTypeById = useCallback(
    async (id: string) => {
      const { data, error } = await request<{ data: RoomType; success: boolean }>(`/room-types/${id}`)
      return error || !data?.success ? null : data?.data
    },
    [request],
  )

  const createRoomType = useCallback(
    async (roomTypeData: Partial<RoomType>) => {
      const { data, error } = await request<{ data: RoomType; success: boolean; message?: string }>(
        "/room-types",
        "POST",
        roomTypeData,
      )
      return {
        data: error || !data?.success ? null : data?.data,
        error: error || (data?.success === false ? data?.message : null),
      }
    },
    [request],
  )

  const updateRoomType = useCallback(
    async (id: string, roomTypeData: Partial<RoomType>) => {
      const { data, error } = await request<{ data: RoomType; success: boolean; message?: string }>(
        `/room-types/${id}`,
        "PUT",
        roomTypeData,
      )
      return {
        data: error || !data?.success ? null : data?.data,
        error: error || (data?.success === false ? data?.message : null),
      }
    },
    [request],
  )

  const deleteRoomType = useCallback(
    async (id: string) => {
      const { data, error } = await request<{ message: string; success: boolean }>(`/room-types/${id}`, "DELETE")
      return { success: !error && data?.success, message: error || data?.message }
    },
    [request],
  )

  const fetchRoomTypeStats = useCallback(async () => {
    const { data, error } = await request<{ data: any[]; success: boolean }>("/room-types/stats")
    return error || !data?.success ? [] : data?.data || []
  }, [request])

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
