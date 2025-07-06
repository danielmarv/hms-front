"use client"

import { useCallback, useState } from "react"
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
  department?: string
}

export interface UserRole {
  _id: string
  name: string
  description: string
  permissions: string[]
}

export function useUsers() {
  const { request, isLoading } = useApi()
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)

  const getAllUsers = useCallback(
    async (page = 1, limit = 10) => {
      setError(null)
      const result = await request(
        `/users?page=${page}&limit=${limit}`,
      )

      if (result.error) {
        setError(result.error)
        return { data: null, error: result.error }
      }

      return result
    },
    [request],
  )

  const fetchUsers = useCallback(
    async (filters: { role?: string; status?: string; department?: string } = {}) => {
      setError(null)

      try {
        const queryParams = new URLSearchParams()

        // Only add filters that are valid for the backend
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== "all") {
            // Skip role filter if it's a string (since backend expects ObjectId)
            if (key === "role" && typeof value === "string" && value.length < 24) {
              return // Skip this filter
            }
            queryParams.append(key, value)
          }
        })

        const queryString = queryParams.toString()
        const endpoint = queryString ? `/users?${queryString}` : "/users"

        console.log("Fetching users from endpoint:", endpoint)

        const result = await request(endpoint)

        if (result.error) {
          setError(result.error)
          setUsers([])
          throw new Error(result.error)
        }

        if (result.data) {
          // Handle different response formats
          let userData: User[] = []

          if (Array.isArray(result.data)) {
            // Direct array response
            userData = result.data
          } else if (result.data.data && Array.isArray(result.data.data)) {
            // Nested data response
            userData = result.data.data
          } else if (result.data.success && result.data.data) {
            // Success wrapper response
            userData = Array.isArray(result.data.data) ? result.data.data : []
          }

          setUsers(userData)
          return userData
        }

        setUsers([])
        return []
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch users"
        setError(errorMessage)
        setUsers([])
        throw err
      }
    },
    [request],
  )

  const getUserById = useCallback(
    async (userId: string) => {
      setError(null)
      const result = await request(`/users/${userId}`)

      if (result.error) {
        setError(result.error)
        return { data: null, error: result.error }
      }

      return result
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
      department?: string
    }) => {
      setError(null)
      const result = await request("/users", "POST", userData)

      if (result.error) {
        setError(result.error)
        return { data: null, error: result.error }
      }

      // Refresh users list after creating
      await fetchUsers()

      return result
    },
    [request, fetchUsers],
  )

  const updateUser = useCallback(
    async (
      userId: string,
      userData: {
        full_name?: string
        email?: string
        role?: string
        status?: "active" | "inactive"
        department?: string
      },
    ) => {
      setError(null)
      const result = await request(`/users/${userId}`, "PUT", userData)

      if (result.error) {
        setError(result.error)
        return { data: null, error: result.error }
      }

      // Refresh users list after updating
      await fetchUsers()

      return result
    },
    [request, fetchUsers],
  )

  const deleteUser = useCallback(
    async (userId: string) => {
      setError(null)
      const result = await request(`/users/${userId}`, "DELETE")

      if (result.error) {
        setError(result.error)
        return { data: null, error: result.error }
      }

      // Refresh users list after deleting
      await fetchUsers()

      return result
    },
    [request, fetchUsers],
  )

  const resetPassword = useCallback(
    async (userId: string, data: { newPassword: string }) => {
      setError(null)
      return await request(`/users/${userId}/reset-password`, "POST", data)
    },
    [request],
  )

  const getUserRoles = useCallback(async () => {
    setError(null)
    return await request("/roles")
  }, [request])

  const getUserHotelCount = useCallback(
    async (userId: string) => {
      setError(null)
      return await request(`/users/${userId}/hotels/count`)
    },
    [request],
  )

  const getUserChainAccess = useCallback(
    async (userId: string) => {
      setError(null)
      return await request(`/users/${userId}/chains`)
    },
    [request],
  )

  return {
    users,
    isLoading,
    error,
    getAllUsers,
    fetchUsers,
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
