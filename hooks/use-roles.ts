"use client"

import { useCallback } from "react"
import { useApi } from "./use-api"

export interface Permission {
  _id: string
  key: string
  description: string
}

export interface Role {
  _id: string
  name: string
  description: string
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export function useRoles() {
  const { request, isLoading } = useApi()

  const getAllRoles = useCallback(async () => {
    return await request<Role[]>("/roles")
  }, [request])

  const getRoleById = useCallback(
    async (id: string) => {
      return await request<Role>(`/roles/${id}`)
    },
    [request],
  )

  const createRole = useCallback(
    async (roleData: { name: string; description: string; permissions: string[] }) => {
      return await request<Role>("/roles", "POST", roleData)
    },
    [request],
  )

  const updateRole = useCallback(
    async (id: string, roleData: { name?: string; description?: string; permissions?: string[] }) => {
      return await request<Role>(`/roles/${id}`, "PUT", roleData)
    },
    [request],
  )

  const deleteRole = useCallback(
    async (id: string) => {
      return await request<{}>(`/roles/${id}`, "DELETE")
    },
    [request],
  )

  const getAllPermissions = useCallback(async () => {
    return await request<Permission[]>("/permissions")
  }, [request])

  return {
    isLoading,
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    getAllPermissions,
  }
}
