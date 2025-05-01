"use client"

import { useCallback } from "react"
import { useApi } from "./use-api"

export interface Hotel {
  _id: string
  name: string
  code: string
  chainCode?: string
  type?: string
  active?: boolean
}

export interface Role {
  _id: string
  name: string
  description?: string
}

export interface HotelChain {
  _id: string
  name: string
  chainCode: string
  description?: string
}

export interface UserAccess {
  _id?: string
  hotel: Hotel | string
  role?: Role | string
  access_level: "read" | "write" | "admin"
  accessAllBranches?: boolean
  isDefault?: boolean
}

export interface User {
  _id: string
  full_name: string
  email: string
  role?: Role | string
  status: "active" | "inactive"
  accessible_hotels: UserAccess[]
}

export function useUserAccess() {
  const { request, isLoading } = useApi()

  const getUserHotelAccess = useCallback(
    async (userId: string) => {
      try {
        const response = await request<User | { data: User; success: boolean }>(`/users/${userId}`)

        // Handle different response formats
        if (response && typeof response === "object") {
          if ("data" in response) {
            return Array.isArray(response.data.accessible_hotels) ? response.data.accessible_hotels : []
          }
          return Array.isArray(response.accessible_hotels) ? response.accessible_hotels : []
        }

        return []
      } catch (error) {
        console.error("Error fetching user hotel access:", error)
        return []
      }
    },
    [request],
  )

  const addUserHotelAccess = useCallback(
    async (
      userId: string,
      hotelId: string,
      accessData: {
        roleId?: string
        accessLevel: "read" | "write" | "admin"
      },
    ) => {
      const payload = {
        hotelId,
        roleId: accessData.roleId,
        accessLevel: accessData.accessLevel,
      }

      const response = await request<{ success: boolean; data: { hotelAccess: UserAccess } }>(
        `/users/${userId}/hotels`,
        "POST",
        payload,
      )

      // Handle different response formats
      if (response && typeof response === "object" && "data" in response) {
        return response.data.hotelAccess
      }

      throw new Error("Invalid response format")
    },
    [request],
  )

  const removeUserHotelAccess = useCallback(
    async (userId: string, hotelId: string) => {
      return await request<{ success: boolean; message: string }>(`/users/${userId}/hotels/${hotelId}`, "DELETE")
    },
    [request],
  )

  const setDefaultHotel = useCallback(
    async (userId: string, hotelId: string) => {
      const response = await request<{ success: boolean; data: User }>(
        `/users/${userId}/default-hotel/${hotelId}`,
        "PUT",
      )

      // Return the updated user
      if (response && typeof response === "object" && "data" in response) {
        return response.data
      }

      throw new Error("Invalid response format")
    },
    [request],
  )

  const getAllHotels = useCallback(async () => {
    try {
      const response = await request<{ success: boolean; data: Hotel[] }>("/hotels")

      // Handle different response formats
      if (response && typeof response === "object" && "data" in response) {
        return Array.isArray(response.data) ? response.data : []
      }

      return []
    } catch (error) {
      console.error("Error fetching hotels:", error)
      return []
    }
  }, [request])

  const getAllChains = useCallback(async () => {
    try {
      const response = await request<{ success: boolean; data: HotelChain[] }>("/chains")

      // Handle different response formats
      if (response && typeof response === "object" && "data" in response) {
        return Array.isArray(response.data) ? response.data : []
      }

      return []
    } catch (error) {
      console.error("Error fetching chains:", error)
      return []
    }
  }, [request])

  const getAllRoles = useCallback(async () => {
    try {
      const response = await request<{ success: boolean; data: Role[] }>("/roles")

      // Handle different response formats
      if (response && typeof response === "object" && "data" in response) {
        return Array.isArray(response.data) ? response.data : []
      }

      return []
    } catch (error) {
      console.error("Error fetching roles:", error)
      return []
    }
  }, [request])

  return {
    isLoading,
    getUserHotelAccess,
    addUserHotelAccess,
    removeUserHotelAccess,
    setDefaultHotel,
    getAllHotels,
    getAllChains,
    getAllRoles,
  }
}
