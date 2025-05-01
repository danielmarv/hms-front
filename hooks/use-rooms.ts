"use client"

import { useState } from "react"
import { useApi } from "./use-api"

export type RoomStatus = "available" | "occupied" | "maintenance" | "cleaning" | "reserved" | "out_of_order"

export type Room = {
  _id: string
  number: string
  floor: string
  building: string
  status: RoomStatus
  room_type: {
    _id: string
    name: string
    base_price: number
    category: string
  }
  view?: string
  is_smoking_allowed: boolean
  is_accessible: boolean
  has_smart_lock: boolean
  connected_rooms?: string[]
  amenities?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export type RoomFilters = {
  status?: RoomStatus
  floor?: string
  building?: string
  view?: string
  is_smoking_allowed?: boolean
  is_accessible?: boolean
  room_type?: string
  has_smart_lock?: boolean
  sort?: string
  limit?: number
  page?: number
}

export type RoomStats = {
  total: number
  available: number
  occupied: number
  maintenance: number
  cleaning: number
  reserved: number
  out_of_order: number
}

export function useRooms() {
  const { request, isLoading } = useApi()
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomStats, setRoomStats] = useState<RoomStats | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  })

  // Fix the fetchRooms function to handle the API response structure correctly
  const fetchRooms = async (filters: RoomFilters = {}) => {
    const queryParams = new URLSearchParams()

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })

    const { data, error } = await request<{
      data: Room[]
      pagination?: {
        page: number
        limit: number
        totalPages: number
      }
      total?: number
    }>(`/rooms?${queryParams.toString()}`)

    if (data && !error) {
      setRooms(data.data || [])

      // Handle the case where pagination might not be in the response
      setPagination({
        page: data.pagination?.page || 1,
        limit: data.pagination?.limit || 10,
        totalPages: data.pagination?.totalPages || 1,
        total: data.total || data.data.length || 0,
      })

      return data.data
    }

    return []
  }

  const fetchRoomById = async (id: string) => {
    const { data, error } = await request<{ data: Room }>(`/rooms/${id}`)
    return error ? null : data?.data
  }

  const createRoom = async (roomData: Partial<Room>) => {
    const { data, error } = await request<{ data: Room }>("/rooms", "POST", roomData)
    return { data: error ? null : data?.data, error }
  }

  const updateRoom = async (id: string, roomData: Partial<Room>) => {
    const { data, error } = await request<{ data: Room }>(`/rooms/${id}`, "PUT", roomData)
    return { data: error ? null : data?.data, error }
  }

  const deleteRoom = async (id: string) => {
    const { data, error } = await request<{ message: string }>(`/rooms/${id}`, "DELETE")
    return { success: !error, message: error || data?.message }
  }

  const updateRoomStatus = async (id: string, status: RoomStatus) => {
    const { data, error } = await request<{ data: Room }>(`/rooms/${id}/status`, "PATCH", { status })
    return { data: error ? null : data?.data, error }
  }

  const fetchRoomStats = async () => {
    const { data, error } = await request<{ data: RoomStats }>("/rooms/stats")

    if (data && !error) {
      setRoomStats(data.data)
      return data.data
    }

    return null
  }

  const connectRooms = async (roomIds: string[]) => {
    const { data, error } = await request<{ message: string }>("/rooms/connect", "POST", { roomIds })
    return { success: !error, message: error || data?.message }
  }

  const disconnectRooms = async (roomId: string, disconnectFromId: string) => {
    const { data, error } = await request<{ message: string }>("/rooms/disconnect", "POST", {
      roomId,
      disconnectFromId,
    })
    return { success: !error, message: error || data?.message }
  }

  const fetchAvailableRooms = async (
    startDate: string,
    endDate: string,
    filters: Omit<RoomFilters, "status" | "sort" | "limit" | "page"> = {},
  ) => {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
    })

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })

    const { data, error } = await request<{ data: Room[] }>(`/rooms/available?${queryParams.toString()}`)
    return error ? [] : data?.data || []
  }

  return {
    rooms,
    roomStats,
    pagination,
    isLoading,
    fetchRooms,
    fetchRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    updateRoomStatus,
    fetchRoomStats,
    connectRooms,
    disconnectRooms,
    fetchAvailableRooms,
  }
}
