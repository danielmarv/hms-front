"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"
import type { KitchenOrder, KitchenOrderFilters, KitchenStats, ApiResponse } from "@/types"

export const useKitchenOrders = () => {
  const { request, isLoading: apiLoading } = useApi()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getOrders = async (filters: KitchenOrderFilters = {}) => {
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

      const response = await request<ApiResponse<KitchenOrder[]>>(`/kitchen/orders?${queryParams.toString()}`, "GET")
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

  const getOrder = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<KitchenOrder>>(`/kitchen/orders/${id}`, "GET")
      setLoading(false)
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch kitchen order")
      return null
    }
  }

  const createOrder = async (kitchenOrder: Partial<KitchenOrder>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<KitchenOrder>>("/kitchen/orders", "POST", kitchenOrder)
      setLoading(false)
      toast.success("Kitchen order created successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to create kitchen order")
      return null
    }
  }

  const updateOrder = async (id: string, kitchenOrder: Partial<KitchenOrder>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<KitchenOrder>>(`/kitchen/orders/${id}`, "PUT", kitchenOrder)
      setLoading(false)
      toast.success("Kitchen order updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update kitchen order")
      return null
    }
  }

  const updateOrderStatus = async (id: string, status: string, notes?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<KitchenOrder>>(`/kitchen/orders/${id}/status`, "PATCH", {
        status,
        cancellationReason: notes,
      })
      setLoading(false)
      toast.success(response.message || "Order status updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update order status")
      return null
    }
  }

  const updateItemStatus = async (orderId: string, itemId: string, status: string, assignedTo?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<KitchenOrder>>(`/kitchen/orders/${orderId}/item-status`, "PATCH", {
        itemId,
        status,
        assignedTo,
      })
      setLoading(false)
      toast.success(response.message || "Item status updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update item status")
      return null
    }
  }

  const assignChef = async (orderId: string, chef: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<KitchenOrder>>(`/kitchen/orders/${orderId}/assign-chef`, "PATCH", {
        chef,
      })
      setLoading(false)
      toast.success(response.message || "Chef assigned successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to assign chef")
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

      const response = await request<ApiResponse<KitchenStats>>(
        `/kitchen/orders/stats?${queryParams.toString()}`,
        "GET",
      )
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
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    updateOrderStatus,
    updateItemStatus,
    assignChef,
    getKitchenStats,
  }
}
