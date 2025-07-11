"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"

export type MaintenanceRequest = {
  _id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "critical"
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled"
  room?: {
    _id: string
    roomNumber: string
    floor: string
    type: string
    status: string
  }
  reportedBy: {
    _id: string
    name: string
    email: string
  }
  assignedTo?: {
    _id: string
    name: string
    email: string
  }
  estimatedCost?: number
  actualCost?: number
  tags?: string[]
  images?: string[]
  notes?: Array<{
    note: string
    addedBy: {
      _id: string
      name: string
    }
    addedAt: string
  }>
  isRecurring?: boolean
  recurringSchedule?: {
    frequency: string
    interval: number
    endDate?: string
  }
  startedAt?: string
  completedAt?: string
  assignedAt?: string
  resolution?: string
  createdAt: string
  updatedAt: string
}

export type MaintenanceFilters = {
  page?: number
  limit?: number
  status?: string
  priority?: string
  category?: string
  roomId?: string
  assignedTo?: string
  reportedBy?: string
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export type MaintenanceStats = {
  total: number
  byStatus: Record<
    string,
    {
      count: number
      avgCost: number
      totalCost: number
    }
  >
  byPriority: Record<string, number>
  byCategory: Record<string, number>
  costs: {
    total: number
    average: number
  }
  resolutionTime: {
    avgResolutionTime: number
    minResolutionTime: number
    maxResolutionTime: number
  }
}

export const useMaintenanceRequests = () => {
  const { request, isLoading } = useApi()
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [stats, setStats] = useState<MaintenanceStats | null>(null)

  const getMaintenanceRequests = async (filters: MaintenanceFilters = {}) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value))
        }
      })

      const response = await request(`/maintenance?${queryParams.toString()}`)

      if (response) {
        setMaintenanceRequests(response.data || [])
      }

      return response
    } catch (error) {
      return { success: false, message: "Failed to fetch maintenance requests" }
    }
  }

  const getMaintenanceRequestById = async (id: string) => {
    try {
      const response = await request(`/maintenance/${id}`)
      return response
    } catch (error) {
      console.error("Error fetching maintenance request:", error)
      return { success: false, message: "Failed to fetch maintenance request" }
    }
  }

  const createMaintenanceRequest = async (data: Partial<MaintenanceRequest>) => {
    try {
      const response = await request("/maintenance", "POST", data)

      if (response.data) {
        toast.success("Maintenance request created successfully")

        await getMaintenanceRequests()
      }

      return response
    } catch (error) {
      toast.error("Failed to create maintenance request")
      return { success: false, message: "Failed to create maintenance request" }
    }
  }

  const updateMaintenanceRequest = async (id: string, data: Partial<MaintenanceRequest>) => {
    try {
      const response = await request(`/maintenance/${id}`, "PUT", data)

      if (response.data) {
        toast.success("Maintenance request updated successfully")
        await getMaintenanceRequests()
      }

      return response
    } catch (error) {
      toast.error("Failed to update maintenance request")
      return { success: false, message: "Failed to update maintenance request" }
    }
  }

  const updateMaintenanceStatus = async (
    id: string,
    status: string,
    additionalData?: { actualCost?: number; resolution?: string },
  ) => {
    try {
      const response = await request(`/maintenance/${id}/status`, "PATCH", {
        status,
        ...additionalData,
      })

      if (response.data) {
        toast.success(`Maintenance request ${status}`)
        await getMaintenanceRequests()
      }

      return response
    } catch (error) {
      toast.error("Failed to update maintenance status")
      return { success: false, message: "Failed to update maintenance status" }
    }
  }

  const assignMaintenanceRequest = async (id: string, assignedTo: string) => {
    try {
      const response = await request(`/maintenance/${id}/assign`, "PATCH", {
        assignedTo,
      })

      if (response.data) {
        toast.success("Maintenance request assigned successfully")
        await getMaintenanceRequests()
      }

      return response
    } catch (error) {
      console.error("Error assigning maintenance request:", error)
      toast.error("Failed to assign maintenance request")
      return { success: false, message: "Failed to assign maintenance request" }
    }
  }

  const addMaintenanceNote = async (id: string, note: string) => {
    try {
      const response = await request(`/maintenance/${id}/notes`, "POST", {
        note,
      })

      if (response.data) {
        toast.success("Note added successfully")
      }

      return response
    } catch (error) {
      toast.error("Failed to add note")
      return { success: false, message: "Failed to add note" }
    }
  }

  const getMaintenanceByRoom = async (roomId: string, filters?: { status?: string; limit?: number }) => {
    try {
      const queryParams = new URLSearchParams()
      if (filters?.status) queryParams.append("status", filters.status)
      if (filters?.limit) queryParams.append("limit", String(filters.limit))

      const response = await request(`/maintenance/room/${roomId}?${queryParams.toString()}`)

      return response
    } catch (error) {
      return { success: false, message: "Failed to fetch room maintenance requests" }
    }
  }

  const getMaintenanceStats = async (filters?: { startDate?: string; endDate?: string }) => {
    try {
      const queryParams = new URLSearchParams()
      if (filters?.startDate) queryParams.append("startDate", filters.startDate)
      if (filters?.endDate) queryParams.append("endDate", filters.endDate)

      const response = await request(`/maintenance/stats?${queryParams.toString()}`)

      if (response.data) {
        setStats(response.data)
      }

      return response
    } catch (error) {
      return { success: false, message: "Failed to fetch maintenance statistics" }
    }
  }

  const getMaintenanceHistory = async (filters?: { period?: string; limit?: number }) => {
    try {
      const queryParams = new URLSearchParams()
      if (filters?.period) queryParams.append("period", filters.period)
      if (filters?.limit) queryParams.append("limit", String(filters.limit))

      const response = await request(`/maintenance/history?${queryParams.toString()}`)

      return response
    } catch (error) {
      console.error("Error fetching maintenance history:", error)
      return { success: false, message: "Failed to fetch maintenance history" }
    }
  }

  const deleteMaintenanceRequest = async (id: string) => {
    try {
      const response = await request(`/maintenance/${id}`, "DELETE")

      if (response) {
        toast.success("Maintenance request deleted successfully")
        await getMaintenanceRequests()
      }

      return response
    } catch (error) {
      toast.error("Failed to delete maintenance request")
      return { success: false, message: "Failed to delete maintenance request" }
    }
  }

  return {
    maintenanceRequests,
    stats,
    getMaintenanceRequests,
    getMaintenanceRequestById,
    createMaintenanceRequest,
    updateMaintenanceRequest,
    updateMaintenanceStatus,
    assignMaintenanceRequest,
    addMaintenanceNote,
    getMaintenanceByRoom,
    getMaintenanceStats,
    getMaintenanceHistory,
    deleteMaintenanceRequest,
    isLoading,
  }
}
