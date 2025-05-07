"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { useToast } from "./use-toast"

export type OrderItem = {
  _id: string
  menuItem: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
  modifiers?: any[]
  status: string
  preparedBy?: string
  servedAt?: string
}

export type Order = {
  _id: string
  orderNumber: string
  table?: any
  room?: any
  guest?: any
  booking?: any
  waiter?: any
  items: OrderItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discountPercentage: number
  discountAmount: number
  serviceChargePercentage: number
  serviceChargeAmount: number
  totalAmount: number
  orderType: string
  orderStatus: string
  paymentStatus: string
  priority: string
  notes?: string
  customerName?: string
  customerPhone?: string
  deliveryAddress?: string
  deliveryNotes?: string
  orderedAt: string
  completedAt?: string
  cancelledAt?: string
  cancellationReason?: string
  isModified: boolean
  modificationNotes?: string
  createdAt: string
  updatedAt: string
}

export type OrderFilters = {
  table?: string
  room?: string
  guest?: string
  orderStatus?: string
  paymentStatus?: string
  orderType?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sort?: string
}

export const useRestaurantOrders = () => {
  const { request, isLoading: apiLoading } = useApi()
  const { toast } = useToast()
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

      const response = await request<any>(`/restaurant/orders?${queryParams.toString()}`, "GET")
      setLoading(false)
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch orders")
      toast({
        title: "Error",
        description: err.message || "Failed to fetch orders",
        variant: "destructive",
      })
      return { data: [], count: 0, total: 0, pagination: { page: 1, limit: 20, totalPages: 0 } }
    }
  }

  const getOrder = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<any>(`/restaurant/orders/${id}`, "GET")
      setLoading(false)
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch order")
      toast({
        title: "Error",
        description: err.message || "Failed to fetch order",
        variant: "destructive",
      })
      return null
    }
  }

  const createOrder = async (order: Partial<Order>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<any>("/restaurant/orders", "POST", order)
      setLoading(false)
      toast({
        title: "Success",
        description: "Order created successfully",
      })
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to create order")
      toast({
        title: "Error",
        description: err.message || "Failed to create order",
        variant: "destructive",
      })
      return null
    }
  }

  const updateOrder = async (id: string, order: Partial<Order>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<any>(`/restaurant/orders/${id}`, "PUT", order)
      setLoading(false)
      toast({
        title: "Success",
        description: "Order updated successfully",
      })
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update order")
      toast({
        title: "Error",
        description: err.message || "Failed to update order",
        variant: "destructive",
      })
      return null
    }
  }

  const updateOrderStatus = async (id: string, status: string, cancellationReason?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<any>(`/restaurant/orders/${id}/status`, "PATCH", {
        status,
        cancellationReason,
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

  const updatePaymentStatus = async (id: string, status: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<any>(`/restaurant/orders/${id}/payment`, "PATCH", { status })
      setLoading(false)
      toast({
        title: "Success",
        description: response.message || "Payment status updated successfully",
      })
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update payment status")
      toast({
        title: "Error",
        description: err.message || "Failed to update payment status",
        variant: "destructive",
      })
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

      const response = await request<any>(`/restaurant/orders/stats?${queryParams.toString()}`, "GET")
      setLoading(false)
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch order statistics")
      toast({
        title: "Error",
        description: err.message || "Failed to fetch order statistics",
        variant: "destructive",
      })
      return null
    }
  }

  return {
    loading,
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
