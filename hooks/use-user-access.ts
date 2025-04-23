"use client"

import { useCallback } from "react"
import { useApi } from "./use-api"
import type { Hotel } from "./use-hotels"

export interface UserHotelAccess {
  _id: string
  user: string
  hotel: string | Hotel
  accessLevel: "full" | "limited" | "readonly"
  permissions: string[]
  accessAllBranches: boolean
  accessibleBranches: string[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export function useUserAccess() {
  const { request, isLoading } = useApi()

  const getUserHotelAccess = useCallback(
    async (userId: string) => {
      return await request<UserHotelAccess[]>(`/users/${userId}/hotels`)
    },
    [request],
  )

  const getHotelUserAccess = useCallback(
    async (hotelId: string) => {
      return await request<UserHotelAccess[]>(`/hotels/${hotelId}/users`)
    },
    [request],
  )

  const grantHotelAccess = useCallback(
    async (
      userId: string,
      hotelId: string,
      accessData: {
        accessLevel: "full" | "limited" | "readonly"
        permissions?: string[]
        accessAllBranches?: boolean
        accessibleBranches?: string[]
        isDefault?: boolean
      },
    ) => {
      return await request<UserHotelAccess>(`/users/${userId}/hotels/${hotelId}`, "POST", accessData)
    },
    [request],
  )

  const updateHotelAccess = useCallback(
    async (
      userId: string,
      hotelId: string,
      accessData: {
        accessLevel?: "full" | "limited" | "readonly"
        permissions?: string[]
        accessAllBranches?: boolean
        accessibleBranches?: string[]
        isDefault?: boolean
      },
    ) => {
      return await request<UserHotelAccess>(`/users/${userId}/hotels/${hotelId}`, "PUT", accessData)
    },
    [request],
  )

  const revokeHotelAccess = useCallback(
    async (userId: string, hotelId: string) => {
      return await request<{}>(`/users/${userId}/hotels/${hotelId}`, "DELETE")
    },
    [request],
  )

  const getUserDefaultHotel = useCallback(
    async (userId: string) => {
      return await request<{ hotel: Hotel; accessLevel: string; accessAllBranches: boolean }>(
        `/users/${userId}/default-hotel`,
      )
    },
    [request],
  )

  const setUserDefaultHotel = useCallback(
    async (userId: string, hotelId: string) => {
      return await request<{}>(`/users/${userId}/default-hotel/${hotelId}`, "PUT")
    },
    [request],
  )

  return {
    isLoading,
    getUserHotelAccess,
    getHotelUserAccess,
    grantHotelAccess,
    updateHotelAccess,
    revokeHotelAccess,
    getUserDefaultHotel,
    setUserDefaultHotel,
  }
}
