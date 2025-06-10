"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"
import type { Order, OrderFilters, OrderStats, ApiResponse } from "@/types"

export const useRestaurantOrders = () => {
  const { request, isLoading: apiLoading } = useApi()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getOrders = async (filters: OrderFilters = {}) => {
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

      const response = await request<ApiResponse<Order[]>>(`/restaurant/orders?${queryParams.toString()}`, "GET")
      setLoading(false)
      return response
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch orders")
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
      const response = await request<ApiResponse<Order>>(`/restaurant/orders/${id}`, "GET")
      setLoading(false)
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch order")
      return null
    }
  }

  const createOrder = async (order: Partial<Order>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<Order>>("/restaurant/orders", "POST", order)
      setLoading(false)
      toast.success("Order created successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to create order")
      return null
    }
  }

  const updateOrder = async (id: string, order: Partial<Order>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<Order>>(`/restaurant/orders/${id}`, "PUT", order)
      setLoading(false)
      toast.success("Order updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update order")
      return null
    }
  }

  const updateOrderStatus = async (id: string, status: string, cancellationReason?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<Order>>(`/restaurant/orders/${id}/status`, "PATCH", {
        status,
        cancellationReason,
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

  const updatePaymentStatus = async (id: string, status: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<Order>>(`/restaurant/orders/${id}/payment`, "PATCH", { status })
      setLoading(false)
      toast.success(response.message || "Payment status updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update payment status")
      return null
    }
  }

  const getOrderStats = async (startDate?: string, endDate?: string) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      if (startDate) queryParams.append("startDate", startDate)
      if (endDate) queryParams.append("endDate", endDate)

      const response = await request<ApiResponse<OrderStats>>(
        `/restaurant/orders/stats?${queryParams.toString()}`,
        "GET",
      )
      setLoading(false)
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch order statistics")
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
    updatePaymentStatus,
    getOrderStats,
  }
}
