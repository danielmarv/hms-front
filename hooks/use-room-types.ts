"use client"

import { useState } from "react"
import { useApi } from "./use-api"

export type RoomType = {
  _id: string
  name: string
  description: string
  basePrice: number
  category: string
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
}

export function useRoomTypes() {
  const { request, isLoading } = useApi()
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])

  const fetchRoomTypes = async () => {
    const { data } = await request<{ data: RoomType[] }>("/room-types")

    if (data) {
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
    const { data, error } = await request<{ data: RoomType; success: boolean; message?: string }>(
      "/room-types",
      "POST",
      roomTypeData,
    )
    return {
      data: error ? null : data?.data,
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
      data: error ? null : data?.data,
      error: error || (data?.success === false ? data?.message : null),
    }
  }

  const deleteRoomType = async (id: string) => {
    const { data, error } = await request<{ message: string; success: boolean }>(`/room-types/${id}`, "DELETE")
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
