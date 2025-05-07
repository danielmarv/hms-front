"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"
import type { Table, TableFilters, ApiResponse } from "@/types"

export const useTables = () => {
  const { request, isLoading: apiLoading } = useApi()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getTables = async (filters: TableFilters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()

      // Add all filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })

      const response = await request<ApiResponse<Table[]>>(`/restaurant/tables?${queryParams.toString()}`, "GET")
      setLoading(false)
      return response
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch tables")
      return { success: false, data: [] }
    }
  }

  const getTable = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<Table>>(`/restaurant/tables/${id}`, "GET")
      setLoading(false)
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch table")
      return null
    }
  }

  const createTable = async (table: Partial<Table>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<Table>>("/restaurant/tables", "POST", table)
      setLoading(false)
      toast.success("Table created successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to create table")
      return null
    }
  }

  const updateTable = async (id: string, table: Partial<Table>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<Table>>(`/restaurant/tables/${id}`, "PUT", table)
      setLoading(false)
      toast.success("Table updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update table")
      return null
    }
  }

  const deleteTable = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<null>>(`/restaurant/tables/${id}`, "DELETE")
      setLoading(false)
      toast.success("Table deleted successfully")
      return response.success
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to delete table")
      return false
    }
  }

  const updateTableStatus = async (
    id: string,
    status: string,
    data?: {
      currentGuests?: number
      reservationName?: string
      reservationPhone?: string
      reservationTime?: string
      notes?: string
    },
  ) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<Table>>(`/restaurant/tables/${id}/status`, "PATCH", {
        status,
        ...data,
      })
      setLoading(false)
      toast.success(response.message || "Table status updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update table status")
      return null
    }
  }

  return {
    loading: loading || apiLoading,
    error,
    getTables,
    getTable,
    createTable,
    updateTable,
    deleteTable,
    updateTableStatus,
  }
}
