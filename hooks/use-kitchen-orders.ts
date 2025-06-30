"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"
import type { KitchenOrder, ApiResponse } from "@/types"

interface KitchenOrderFilters {
  status?: string
  priority?: string
  orderType?: string
  table?: string
  room?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sort?: string
}

export const useKitchenOrders = () => {
  const { request, isLoading: apiLoading } = useApi()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getKitchenOrders = async (filters: KitchenOrderFilters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })

      const response = await request(`/kitchen/orders?${queryParams.toString()}`, "GET")
      setLoading(false)
      return response
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch kitchen orders")
      return {
        success: false,
        data: [],
        count: 0,
        total: 0,
        pagination: { page: 1, limit: 20, totalPages: 0 },
      }
    }
  }

  const getKitchenOrder = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request(`/kitchen/orders/${id}`, "GET")
      setLoading(false)
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch kitchen order")
      return null
    }
  }

  const updateKitchenOrderStatus = async (id: string, status: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request(`/kitchen/orders/${id}/status`, "PATCH", { status })
      setLoading(false)
      toast.success("Kitchen order status updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update kitchen order status")
      toast.error(err.message || "Failed to update kitchen order status")
      return null
    }
  }

  const updateKitchenOrderItemStatus = async (orderId: string, itemId: string, status: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request(
        `/kitchen/orders/${orderId}/items/${itemId}/status`,
        "PATCH",
        { status },
      )
      setLoading(false)
      toast.success("Item status updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update item status")
      toast.error(err.message || "Failed to update item status")
      return null
    }
  }

  const updateKitchenOrderPriority = async (id: string, priority: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request(`/kitchen/orders/${id}/priority`, "PATCH", { priority })
      setLoading(false)
      toast.success("Order priority updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update order priority")
      toast.error(err.message || "Failed to update order priority")
      return null
    }
  }

  const getKitchenStats = async (startDate?: string, endDate?: string) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      if (startDate) queryParams.append("startDate", startDate)
      if (endDate) queryParams.append("endDate", endDate)

      const response = await request(`/kitchen/stats?${queryParams.toString()}`, "GET")
      setLoading(false)
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch kitchen statistics")
      return null
    }
  }

  return {
    loading: loading || apiLoading,
    error,
    getKitchenOrders,
    getKitchenOrder,
    updateKitchenOrderStatus,
    updateKitchenOrderItemStatus,
    updateKitchenOrderPriority,
    getKitchenStats,
  }
}
