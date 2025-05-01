"use client"

import { useCallback } from "react"
import { useApi } from "./use-api"

export interface User {
  _id: string
  full_name: string
  email: string
  role: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  hotelAccess?: number
}

export interface UserRole {
  _id: string
  name: string
  description: string
  permissions: string[]
}

export function useUsers() {
  const { request, isLoading } = useApi()

  const getAllUsers = useCallback(
    async (page = 1, limit = 10) => {
      return await request<{ data: User[]; pagination: any; total: number }>(`/users?page=${page}&limit=${limit}`)
    },
    [request],
  )

  const getUserById = useCallback(
    async (userId: string) => {
      return await request<User>(`/users/${userId}`)
    },
    [request],
  )

  const createUser = useCallback(
    async (userData: {
      full_name: string
      email: string
      password: string
      role: string
      status?: "active" | "inactive"
    }) => {
      return await request<User>("/users", "POST", userData)
    },
    [request],
  )

  const updateUser = useCallback(
    async (
      userId: string,
      userData: {
        full_name?: string
        email?: string
        role?: string
        status?: "active" | "inactive"
      },
    ) => {
      return await request<User>(`/users/${userId}`, "PUT", userData)
    },
    [request],
  )

  const deleteUser = useCallback(
    async (userId: string) => {
      return await request<{ success: boolean; message: string }>(`/users/${userId}`, "DELETE")
    },
    [request],
  )

  const resetPassword = useCallback(
    async (userId: string, data: { newPassword: string }) => {
      return await request<{ success: boolean; message: string }>(`/users/${userId}/reset-password`, "POST", data)
    },
    [request],
  )

  const getUserRoles = useCallback(async () => {
    return await request<UserRole[]>("/roles")
  }, [request])

  const getUserHotelCount = useCallback(
    async (userId: string) => {
      return await request<{ count: number }>(`/users/${userId}/hotels/count`)
    },
    [request],
  )

  const getUserChainAccess = useCallback(
    async (userId: string) => {
      return await request<{ chainCode: string; name: string; accessLevel: string }[]>(`/users/${userId}/chains`)
    },
    [request],
  )

  return {
    isLoading,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    getUserRoles,
    getUserHotelCount,
    getUserChainAccess,
  }
}
