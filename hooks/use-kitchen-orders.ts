"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { useToast } from "./use-toast"

export type KitchenOrderItem = {
  _id: string
  menuItem: any
  name: string
  quantity: number
  notes?: string
  modifiers?: any[]
  status: string
  assignedTo?: any
  startedAt?: string
  completedAt?: string
}

export type KitchenOrder = {
  _id: string
  orderNumber: string
  order: any
  table?: any
  room?: any
  items: KitchenOrderItem[]
  priority: string
  status: string
  notes?: string
  orderType: string
  waiter?: any
  chef?: any
  estimatedCompletionTime?: string
  actualCompletionTime?: string
  startedAt?: string
  completedAt?: string
  cancelledAt?: string
  cancellationReason?: string
  isModified: boolean
  modificationNotes?: string
  createdAt: string
  updatedAt: string
}

export type KitchenOrderFilters = {
  status?: string
  priority?: string
  orderType?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sort?: string
}

export const useKitchenOrders = () => {
  const { request, isLoading: apiLoading } = useApi()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getKitchenOrders = async (filters: KitchenOrderFilters = {}) => {
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

      const response = await request<any>(`/kitchen/orders?${queryParams.toString()}`, "GET")
      setLoading(false)
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch kitchen orders")
      toast({
        title: "Error",
        description: err.message || "Failed to fetch kitchen orders",
        variant: "destructive",
      })
      return { data: [], count: 0, total: 0, pagination: { page: 1, limit: 20, totalPages: 0 } }
    }
  }

  const getKitchenOrder = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<any>(`/kitchen/orders/${id}`, "GET")
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

  const createKitchenOrder = async (kitchenOrder: Partial<KitchenOrder>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<any>("/kitchen/orders", "POST", kitchenOrder)
      setLoading(false)
      toast({
        title: "Success",
        description: "Kitchen order created successfully",
      })
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to create kitchen order")
      toast({
        title: "Error",
        description: err.message || "Failed to create kitchen order",
        variant: "destructive",
      })
      return null
    }
  }

  const updateKitchenOrder = async (id: string, kitchenOrder: Partial<KitchenOrder>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<any>(`/kitchen/orders/${id}`, "PUT", kitchenOrder)
      setLoading(false)
      toast({
        title: "Success",
        description: "Kitchen order updated successfully",
      })
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update kitchen order")
      toast({
        title: "Error",
        description: err.message || "Failed to update kitchen order",
        variant: "destructive",
      })
      return null
    }
  }

  const updateKitchenOrderStatus = async (id: string, status: string, cancellationReason?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<any>(`/kitchen/orders/${id}/status`, "PATCH", {
        status,
        cancellationReason,
      })
      setLoading(false)
      toast({
        title: "Success",
        description: response.message || "Kitchen order status updated successfully",
      })
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update kitchen order status")
      toast({
        title: "Error",
        description: err.message || "Failed to update kitchen order status",
        variant: "destructive",
      })
      return null
    }
  }

  const updateKitchenOrderItemStatus = async (id: string, itemId: string, status: string, assignedTo?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<any>(`/kitchen/orders/${id}/item-status`, "PATCH", {
        itemId,
        status,
        assignedTo,
      })
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

  const assignChef = async (id: string, chef: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<any>(`/kitchen/orders/${id}/assign-chef`, "PATCH", { chef })
      setLoading(false)
      toast({
        title: "Success",
        description: response.message || "Chef assigned successfully",
      })
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to assign chef")
      toast({
        title: "Error",
        description: err.message || "Failed to assign chef",
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

      const response = await request<any>(`/kitchen/orders/stats?${queryParams.toString()}`, "GET")
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
    loading,
    error,
    getKitchenOrders,
    getKitchenOrder,
    createKitchenOrder,
    updateKitchenOrder,
    updateKitchenOrderStatus,
    updateKitchenOrderItemStatus,
    assignChef,
    getKitchenStats,
  }
}
