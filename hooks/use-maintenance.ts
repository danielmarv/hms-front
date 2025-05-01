"use client"

import { useState } from "react"
import { useApi } from "./use-api"

export type MaintenanceStatus = "pending" | "in_progress" | "resolved" | "unresolved"

export type MaintenanceRequest = {
  _id: string
  room: {
    _id: string
    number: string
    floor: string
    building: string
    status: string
  }
  title: string
  description: string
  status: MaintenanceStatus
  priority: "low" | "medium" | "high" | "critical"
  reported_by: {
    _id: string
    name: string
  }
  assigned_to?: {
    _id: string
    name: string
  }
  estimated_cost?: number
  actual_cost?: number
  resolved_at?: string
  createdAt: string
  updatedAt: string
}

export type MaintenanceFilters = {
  room?: string
  status?: MaintenanceStatus
  assigned_to?: string
  reported_by?: string
  startDate?: string
  endDate?: string
  sort?: string
  limit?: number
  page?: number
}

export type MaintenanceStats = {
  total: number
  pending: number
  in_progress: number
  resolved: number
  unresolved: number
  totalCost: number
  avgCost: number
}

export function useMaintenance() {
  const { request, isLoading } = useApi()
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [stats, setStats] = useState<MaintenanceStats | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    total: 0,
  })

  const fetchRequests = async (filters: MaintenanceFilters = {}) => {
    const queryParams = new URLSearchParams()

    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value))
      }
    })

    const { data, error } = await request<{
      data: MaintenanceRequest[]
      pagination: {
        page: number
        limit: number
        totalPages: number
      }
      total: number
    }>(`/maintenance?${queryParams.toString()}`)

    if (data && !error) {
      setRequests(data.data)
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        totalPages: data.pagination.totalPages,
        total: data.total,
      })
      return data.data
    }

    return []
  }

  const fetchRequestById = async (id: string) => {
    const { data, error } = await request<{ data: MaintenanceRequest }>(`/maintenance/${id}`)
    return error ? null : data?.data
  }

  const createRequest = async (requestData: Partial<MaintenanceRequest>) => {
    const { data, error } = await request<{ data: MaintenanceRequest }>("/maintenance", "POST", requestData)
    return { data: error ? null : data?.data, error }
  }

  const updateRequest = async (id: string, requestData: Partial<MaintenanceRequest>) => {
    const { data, error } = await request<{ data: MaintenanceRequest }>(`/maintenance/${id}`, "PUT", requestData)
    return { data: error ? null : data?.data, error }
  }

  const deleteRequest = async (id: string) => {
    const { data, error } = await request<{ message: string }>(`/maintenance/${id}`, "DELETE")
    return { success: !error, message: error || data?.message }
  }

  const assignRequest = async (id: string, assignedTo: string) => {
    const { data, error } = await request<{ data: MaintenanceRequest }>(`/maintenance/${id}/assign`, "PATCH", {
      assignedTo,
    })
    return { data: error ? null : data?.data, error }
  }

  const fetchStats = async () => {
    const { data, error } = await request<{ data: MaintenanceStats }>("/maintenance/stats")

    if (data && !error) {
      setStats(data.data)
      return data.data
    }

    return null
  }

  return {
    requests,
    stats,
    pagination,
    isLoading,
    fetchRequests,
    fetchRequestById,
    createRequest,
    updateRequest,
    deleteRequest,
    assignRequest,
    fetchStats,
  }
}
