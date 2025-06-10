"use client"

import { useCallback, useState } from "react"
import { useApi } from "./use-api"

export interface Permission {
  id: string
  key: string
  description: string
  category: string
  isGlobal: boolean
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  permissionCount?: number
}

export interface PermissionsByCategory {
  category: string
  permissions: Permission[]
}

export function useRoles() {
  const { request, isLoading } = useApi()
  const [error, setError] = useState<string | null>(null)

  const getAllRoles = useCallback(async () => {
    try {
      setError(null)
      const response = await request<{ success: boolean; count: number; data: Role[] }>("/roles")

      if (!response || !response.data) {
        throw new Error("Invalid response format")
      }

      return response.data
    } catch (err: any) {
      setError(err.message || "Failed to fetch roles")
      return []
    }
  }, [request])

  const getRoleById = useCallback(
    async (id: string) => {
      try {
        setError(null)
        const response = await request<{ success: boolean; data: Role }>(`/roles/${id}`)

        if (!response || !response.data) {
          throw new Error("Invalid response format")
        }

        return response.data
      } catch (err: any) {
        setError(err.message || `Failed to fetch role with ID: ${id}`)
        return null
      }
    },
    [request],
  )

  const createRole = useCallback(
    async (roleData: { name: string; description: string; permissions: string[] }) => {
      try {
        setError(null)
        const response = await request<{ success: boolean; data: Role }>("/roles", "POST", roleData)

        if (!response || !response.data) {
          throw new Error("Invalid response format")
        }

        return response.data
      } catch (err: any) {
        setError(err.message || "Failed to create role")
        throw err
      }
    },
    [request],
  )

  const updateRole = useCallback(
    async (id: string, roleData: { name?: string; description?: string; permissions?: string[] }) => {
      try {
        setError(null)
        const response = await request<{ success: boolean; data: Role }>(`/roles/${id}`, "PUT", roleData)

        if (!response || !response.data) {
          throw new Error("Invalid response format")
        }

        return response.data
      } catch (err: any) {
        setError(err.message || `Failed to update role with ID: ${id}`)
        throw err
      }
    },
    [request],
  )

  const deleteRole = useCallback(
    async (id: string) => {
      try {
        setError(null)
        const response = await request<{ success: boolean; message: string }>(`/roles/${id}`, "DELETE")

        if (!response || !response.success) {
          throw new Error("Invalid response format")
        }

        return response.message
      } catch (err: any) {
        setError(err.message || `Failed to delete role with ID: ${id}`)
        throw err
      }
    },
    [request],
  )

  const getAvailablePermissions = useCallback(async () => {
    try {
      setError(null)
      const response = await request<{ success: boolean; data: PermissionsByCategory[] }>(
        "/roles/permissions/available",
      )

      if (!response || !response.data) {
        throw new Error("Invalid response format")
      }

      return response.data
    } catch (err: any) {
      setError(err.message || "Failed to fetch available permissions")
      return []
    }
  }, [request])

  return {
    isLoading,
    error,
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    getAvailablePermissions,
  }
}
