"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"

export type MaintenanceRequest = {
  _id: string
  type: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "assigned" | "in-progress" | "completed" | "cancelled"
  description: string
  room?: {
    _id: string
    number: string
    floor: string
  }
  reportedBy: {
    _id: string
    full_name: string
  }
  assignedTo?: {
    _id: string
    full_name: string
  }
  estimatedCost?: number
  actualCost?: number
  scheduledDate?: string
  completedDate?: string
  notes?: string
  images?: string[]
  createdAt: string
  updatedAt: string
}

export type MaintenanceFilters = {
  type?: string
  priority?: string
  status?: string
  room?: string
  assignedTo?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sort?: string
}

export const useMaintenanceRequests = () => {
  const { request, isLoading } = useApi()
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])

  const getMaintenanceRequests = async (filters: MaintenanceFilters = {}) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value))
        }
      })

      const response = await request<{
        data: MaintenanceRequest[]
        count: number
        total: number
        pagination: { page: number; limit: number; totalPages: number }
      }>(`/maintenance?${queryParams.toString()}`)

      if (response.data) {
        setMaintenanceRequests(response.data.data || [])
      }

      return response
    } catch (error) {
      console.error("Error fetching maintenance requests:", error)
      return { success: false, message: "Failed to fetch maintenance requests" }
    }
  }

  const createMaintenanceRequest = async (data: Partial<MaintenanceRequest>) => {
    try {
      const response = await request<MaintenanceRequest>("/maintenance", "POST", data)

      if (response.success) {
        toast.success("Maintenance request created successfully")
      }

      return response
    } catch (error) {
      console.error("Error creating maintenance request:", error)
      return { success: false, message: "Failed to create maintenance request" }
    }
  }

  const updateMaintenanceRequest = async (id: string, data: Partial<MaintenanceRequest>) => {
    try {
      const response = await request<MaintenanceRequest>(`/maintenance/${id}`, "PUT", data)

      if (response.success) {
        toast.success("Maintenance request updated successfully")
      }

      return response
    } catch (error) {
      console.error("Error updating maintenance request:", error)
      return { success: false, message: "Failed to update maintenance request" }
    }
  }

  return {
    maintenanceRequests,
    getMaintenanceRequests,
    createMaintenanceRequest,
    updateMaintenanceRequest,
    isLoading,
  }
}
