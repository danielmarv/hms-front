"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"

export type RoomStatus = "available" | "occupied" | "maintenance" | "cleaning" | "reserved" | "out_of_order"

export type Room = {
  _id: string
  roomNumber: string
  floor: string | number
  building?: string
  status: RoomStatus
  roomType: {
    _id: string
    name: string
    basePrice: number
    bedConfiguration?: string
  }
  view?: string
  is_smoking_allowed?: boolean
  is_accessible?: boolean
  has_smart_lock?: boolean
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

export type CreateRoomData = {
  roomNumber: string
  floor: string | number
  roomType: string
  building?: string
  status?: RoomStatus
  view?: string
  is_smoking_allowed?: boolean
  is_accessible?: boolean
  has_smart_lock?: boolean
  amenities?: string[]
  notes?: string
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

  const fetchRooms = useCallback(
    async (filters: RoomFilters = {}) => {
      const queryParams = new URLSearchParams()

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value))
        }
      })

      try {
        const { data, error } = await request<{
          data?: Room[] | null
          pagination?: {
            page: number
            limit: number
            totalPages: number
          }
          total?: number
          success?: boolean
        }>(`/rooms?${queryParams.toString()}`)

        if (data && !error) {
          // Handle case where data might be directly the array or nested in data property
          const roomsData = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : null

          if (roomsData) {
            setRooms(roomsData)

            // Handle the case where pagination might not be in the response
            setPagination({
              page: data.pagination?.page || 1,
              limit: data.pagination?.limit || 10,
              totalPages: data.pagination?.totalPages || 1,
              total: data.total || (roomsData ? roomsData.length : 0),
            })

            return roomsData
          }
        }

        // If we get here, something went wrong
        console.error("Error fetching rooms:", error || "Invalid response format")
        return []
      } catch (err) {
        console.error("Exception fetching rooms:", err)
        return []
      }
    },
    [request],
  )

  const fetchRoomById = useCallback(
    async (id: string) => {
      try {
        const { data, error } = await request<{ data?: Room; success?: boolean }>(`/rooms/${id}`)

        if (error) {
          console.error("Error fetching room:", error)
          return null
        }

        // Handle case where data might be directly the room or nested in data property
        return data?.data || (data && !("data" in data) ? (data as unknown as Room) : null)
      } catch (err) {
        console.error("Exception fetching room:", err)
        return null
      }
    },
    [request],
  )

  const createRoom = useCallback(
    async (roomData: CreateRoomData) => {
      try {
        const { data, error } = await request<{ data?: Room; success?: boolean; message?: string }>(
          "/rooms",
          "POST",
          roomData,
        )

        if (error || data?.success === false) {
          const errorMessage = error || data?.message || "Failed to create room"
          console.error("Error creating room:", errorMessage)
          return { data: null, error: errorMessage }
        }

        return {
          data: data?.data || (data && !("data" in data) ? (data as unknown as Room) : null),
          error: null,
        }
      } catch (err) {
        console.error("Exception creating room:", err)
        return { data: null, error: err instanceof Error ? err.message : "Unknown error" }
      }
    },
    [request],
  )

  const updateRoom = useCallback(
    async (id: string, roomData: Partial<Room>) => {
      try {
        const { data, error } = await request<{ data?: Room; success?: boolean; message?: string }>(
          `/rooms/${id}`,
          "PUT",
          roomData,
        )

        if (error || data?.success === false) {
          const errorMessage = error || data?.message || "Failed to update room"
          console.error("Error updating room:", errorMessage)
          return { data: null, error: errorMessage }
        }

        return {
          data: data?.data || (data && !("data" in data) ? (data as unknown as Room) : null),
          error: null,
        }
      } catch (err) {
        console.error("Exception updating room:", err)
        return { data: null, error: err instanceof Error ? err.message : "Unknown error" }
      }
    },
    [request],
  )

  const deleteRoom = useCallback(
    async (id: string) => {
      try {
        const { data, error } = await request<{ message?: string; success?: boolean }>(`/rooms/${id}`, "DELETE")

        if (error || data?.success === false) {
          const errorMessage = error || data?.message || "Failed to delete room"
          console.error("Error deleting room:", errorMessage)
          return { success: false, message: errorMessage }
        }

        return { success: true, message: data?.message || "Room deleted successfully" }
      } catch (err) {
        console.error("Exception deleting room:", err)
        return { success: false, message: err instanceof Error ? err.message : "Unknown error" }
      }
    },
    [request],
  )

  const updateRoomStatus = useCallback(
    async (id: string, status: RoomStatus) => {
      try {
        const { data, error } = await request<{ data?: Room; success?: boolean; message?: string }>(
          `/rooms/${id}/status`,
          "PATCH",
          { status },
        )

        if (error || data?.success === false) {
          const errorMessage = error || data?.message || "Failed to update room status"
          console.error("Error updating room status:", errorMessage)
          return { data: null, error: errorMessage }
        }

        return {
          data: data?.data || (data && !("data" in data) ? (data as unknown as Room) : null),
          error: null,
        }
      } catch (err) {
        console.error("Exception updating room status:", err)
        return { data: null, error: err instanceof Error ? err.message : "Unknown error" }
      }
    },
    [request],
  )

  const fetchRoomStats = useCallback(async () => {
    try {
      const { data, error } = await request<{ data?: RoomStats; success?: boolean }>("/rooms/stats")

      if (error || data?.success === false) {
        console.error("Error fetching room stats:", error || "Invalid response format")
        return null
      }

      const statsData = data?.data || (data && !("data" in data) ? (data as unknown as RoomStats) : null)

      if (statsData) {
        setRoomStats(statsData)
        return statsData
      }

      return null
    } catch (err) {
      console.error("Exception fetching room stats:", err)
      return null
    }
  }, [request])

  const connectRooms = useCallback(
    async (roomIds: string[]) => {
      try {
        const { data, error } = await request<{ message?: string; success?: boolean }>("/rooms/connect", "POST", {
          roomIds,
        })

        if (error || data?.success === false) {
          const errorMessage = error || data?.message || "Failed to connect rooms"
          console.error("Error connecting rooms:", errorMessage)
          return { success: false, message: errorMessage }
        }

        return { success: true, message: data?.message || "Rooms connected successfully" }
      } catch (err) {
        console.error("Exception connecting rooms:", err)
        return { success: false, message: err instanceof Error ? err.message : "Unknown error" }
      }
    },
    [request],
  )

  const disconnectRooms = useCallback(
    async (roomId: string, disconnectFromId: string) => {
      try {
        const { data, error } = await request<{ message?: string; success?: boolean }>("/rooms/disconnect", "POST", {
          roomId,
          disconnectFromId,
        })

        if (error || data?.success === false) {
          const errorMessage = error || data?.message || "Failed to disconnect rooms"
          console.error("Error disconnecting rooms:", errorMessage)
          return { success: false, message: errorMessage }
        }

        return { success: true, message: data?.message || "Rooms disconnected successfully" }
      } catch (err) {
        console.error("Exception disconnecting rooms:", err)
        return { success: false, message: err instanceof Error ? err.message : "Unknown error" }
      }
    },
    [request],
  )

  const fetchAvailableRooms = useCallback(
    async (
      startDate: string,
      endDate: string,
      filters: Omit<RoomFilters, "status" | "sort" | "limit" | "page"> = {},
    ) => {
      try {
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

        const { data, error } = await request<{ data?: Room[]; success?: boolean }>(
          `/rooms/available?${queryParams.toString()}`,
        )

        if (error || data?.success === false) {
          console.error("Error fetching available rooms:", error || "Invalid response format")
          return []
        }

        // Handle case where data might be directly the array or nested in data property
        return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
      } catch (err) {
        console.error("Exception fetching available rooms:", err)
        return []
      }
    },
    [request],
  )

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
