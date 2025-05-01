"use client"

import { useState } from "react"
import { useApi } from "./use-api"

export type RoomType = {
  _id: string
  name: string
  base_price: number
  category: string
  description?: string
  max_occupancy: number
  amenities?: string[]
  images?: string[]
  createdAt: string
  updatedAt: string
}

export function useRoomTypes() {
  const { request, isLoading } = useApi()
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])

  const fetchRoomTypes = async () => {
    const { data, error } = await request<{ data: RoomType[] }>("/room-types")

    if (data && !error) {
      setRoomTypes(data.data || [])
      return data.data
    }

    return []
  }

  const fetchRoomTypeById = async (id: string) => {
    const { data, error } = await request<{ data: RoomType }>(`/room-types/${id}`)
    return error ? null : data?.data
  }

  const createRoomType = async (roomTypeData: Partial<RoomType>) => {
    const { data, error } = await request<{ data: RoomType }>("/room-types", "POST", roomTypeData)
    return { data: error ? null : data?.data, error }
  }

  const updateRoomType = async (id: string, roomTypeData: Partial<RoomType>) => {
    const { data, error } = await request<{ data: RoomType }>(`/room-types/${id}`, "PUT", roomTypeData)
    return { data: error ? null : data?.data, error }
  }

  const deleteRoomType = async (id: string) => {
    const { data, error } = await request<{ message: string }>(`/room-types/${id}`, "DELETE")
    return { success: !error, message: error || data?.message }
  }

  const fetchRoomTypeStats = async () => {
    const { data, error } = await request<{ data: any[] }>("/room-types/stats")
    return error ? [] : data?.data || []
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
