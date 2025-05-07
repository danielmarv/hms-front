"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { useToast } from "./use-toast"
import type { KitchenOrder, KitchenOrderFilters, KitchenStats, ApiResponse } from "@/types"

export const useKitchenOrders = () => {
  const { request, isLoading: apiLoading } = useApi()
  const { toast } = useToast()
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
      toast({
        title: "Error",
        description: err.message || "Failed to fetch kitchen orders",
        variant: "destructive",
      })
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
      toast({
        title: "Error",
        description: err.message || "Failed to fetch kitchen order",
        variant: "destructive",
      })
      return null
    }
  }

  const updateOrderStatus = async (id: string, status: string, notes?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<KitchenOrder>>(`/kitchen/orders/${id}/status`, "PATCH", {
        status,
        notes,
      })
      setLoading(false)
      toast({
        title: "Success",
        description: response.message || "Order status updated successfully",
      })
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update order status")
      toast({
        title: "Error",
        description: err.message || "Failed to update order status",
        variant: "destructive",
      })
      return null
    }
  }

  const updateItemStatus = async (orderId: string, itemId: string, status: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<KitchenOrder>>(
        `/kitchen/orders/${orderId}/items/${itemId}/status`,
        "PATCH",
        { status },
      )
      setLoading(false)
      toast({
        title: "Success",
        description: response.message || "Item status updated successfully",
      })
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update item status")
      toast({
        title: "Error",
        description: err.message || "Failed to update item status",
        variant: "destructive",
      })
      return null
    }
  }

  const assignOrder = async (orderId: string, chefId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<KitchenOrder>>(`/kitchen/orders/${orderId}/assign`, "PATCH", {
        chefId,
      })
      setLoading(false)
      toast({
        title: "Success",
        description: response.message || "Order assigned successfully",
      })
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to assign order")
      toast({
        title: "Error",
        description: err.message || "Failed to assign order",
        variant: "destructive",
      })
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
      toast({
        title: "Error",
        description: err.message || "Failed to fetch kitchen statistics",
        variant: "destructive",
      })
      return null
    }
  }

  return {
    loading: loading || apiLoading,
    error,
    getOrders,
    getOrder,
    updateOrderStatus,
    updateItemStatus,
    assignOrder,
    getKitchenStats,
  }
}
