"use client"

import { useCallback } from "react"
import { useApi } from "./use-api"

export interface Permission {
  _id: string
  key: string
  description: string
}

export function usePermissions() {
  const { request, isLoading } = useApi()

  const getAllPermissions = useCallback(async () => {
    return await request<Permission[]>("/permissions")
  }, [request])

  const getPermissionById = useCallback(
    async (id: string) => {
      return await request<Permission>(`/permissions/${id}`)
    },
    [request],
  )

  const createPermission = useCallback(
    async (permissionData: { key: string; description: string }) => {
      return await request<Permission>("/permissions", "POST", permissionData)
    },
    [request],
  )

  const updatePermission = useCallback(
    async (id: string, permissionData: { key?: string; description?: string }) => {
      return await request<Permission>(`/permissions/${id}`, "PUT", permissionData)
    },
    [request],
  )

  const deletePermission = useCallback(
    async (id: string) => {
      return await request<{}>(`/permissions/${id}`, "DELETE")
    },
    [request],
  )

  return {
    isLoading,
    getAllPermissions,
    getPermissionById,
    createPermission,
    updatePermission,
    deletePermission,
  }
}
