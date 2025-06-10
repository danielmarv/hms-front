"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"
import type { KitchenOrder, KitchenOrderFilters, KitchenStats, ApiResponse } from "@/types"

export const useKitchenOrders = () => {
  const { request, isLoading: apiLoading } = useApi()
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

      const endpoint = `/kitchen/orders${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
      const response = await request<ApiResponse<KitchenOrder[]>>(endpoint, "GET")
      setLoading(false)

      return response
    } catch (err: any) {
      setLoading(false)
      const errorMessage = err.message || "Failed to fetch kitchen orders"
      setError(errorMessage)
      console.error("Kitchen orders API error:", err)

      // Return a mock response structure for development/testing
      return {
        success: false,
        data: generateMockOrders(),
        count: 0,
        total: 0,
        pagination: { page: 1, limit: 20, totalPages: 0 },
        message: errorMessage,
      }
    }
  }

  const getKitchenOrder = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<KitchenOrder>>(`/kitchen/orders/${id}`, "GET")
      setLoading(false)
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch kitchen order")
      console.error("Kitchen order fetch error:", err)
      return null
    }
  }

  const createKitchenOrder = async (order: Partial<KitchenOrder>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<KitchenOrder>>("/kitchen/orders", "POST", order)
      setLoading(false)
      toast.success("Kitchen order created successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to create kitchen order")
      toast.error(err.message || "Failed to create kitchen order")
      console.error("Kitchen order creation error:", err)
      return null
    }
  }

  const updateKitchenOrder = async (id: string, order: Partial<KitchenOrder>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<KitchenOrder>>(`/kitchen/orders/${id}`, "PUT", order)
      setLoading(false)
      toast.success("Kitchen order updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update kitchen order")
      toast.error(err.message || "Failed to update kitchen order")
      console.error("Kitchen order update error:", err)
      return null
    }
  }

  const updateKitchenOrderStatus = async (id: string, status: string, notes?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<KitchenOrder>>(`/kitchen/orders/${id}/status`, "PATCH", {
        status,
        notes,
      })
      setLoading(false)
      toast.success(response.message || "Kitchen order status updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update kitchen order status")
      toast.error(err.message || "Failed to update kitchen order status")
      console.error("Kitchen order status update error:", err)
      return null
    }
  }

  const updateKitchenOrderItemStatus = async (orderId: string, itemId: string, status: string, assignedTo?: string) => {
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
      toast.error(err.message || "Failed to update item status")
      console.error("Kitchen order item status update error:", err)
      return null
    }
  }

  const assignChef = async (id: string, chefId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<KitchenOrder>>(`/kitchen/orders/${id}/assign-chef`, "PATCH", {
        chefId,
      })
      setLoading(false)
      toast.success("Chef assigned successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to assign chef")
      toast.error(err.message || "Failed to assign chef")
      console.error("Chef assignment error:", err)
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

      const endpoint = `/kitchen/orders/stats${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
      const response = await request<ApiResponse<KitchenStats>>(endpoint, "GET")
      setLoading(false)
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch kitchen statistics")
      console.error("Kitchen stats error:", err)

      // Return mock stats for development
      return generateMockStats()
    }
  }

  const getChefs = async () => {
    setLoading(true)
    setError(null)
    try {
      // This endpoint might need to be added to your backend
      const response = await request<ApiResponse<any[]>>("/kitchen/chefs", "GET")
      setLoading(false)
      return response.data || []
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch chefs")
      console.error("Chefs fetch error:", err)

      // Return mock chefs for development
      return [
        { id: "1", name: "Chef John", speciality: "Main Course", status: "available" },
        { id: "2", name: "Chef Sarah", speciality: "Desserts", status: "busy" },
        { id: "3", name: "Chef Mike", speciality: "Appetizers", status: "available" },
        { id: "4", name: "Chef Lisa", speciality: "Salads", status: "available" },
      ]
    }
  }

  return {
    loading: loading || apiLoading,
    error,
    getKitchenOrders,
    getKitchenOrder,
    createKitchenOrder,
    updateKitchenOrder,
    updateKitchenOrderStatus,
    updateKitchenOrderItemStatus,
    assignChef,
    getKitchenStats,
    getChefs,
  }
}

// Mock data generators for development/testing
function generateMockOrders(): KitchenOrder[] {
  const statuses = ["New", "Preparing", "Ready", "Completed"]
  const priorities = ["Low", "Medium", "High"]
  const orderTypes = ["Dine-in", "Takeout", "Delivery", "Room Service"]

  return Array.from({ length: 12 }, (_, i) => ({
    _id: `order-${i + 1}`,
    orderNumber: `KIT-${String(i + 1).padStart(4, "0")}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    orderType: orderTypes[Math.floor(Math.random() * orderTypes.length)],
    table: Math.random() > 0.5 ? Math.floor(Math.random() * 20) + 1 : undefined,
    room: Math.random() > 0.7 ? Math.floor(Math.random() * 100) + 100 : undefined,
    items: [
      {
        _id: `item-${i + 1}-1`,
        name: `Grilled Chicken Breast ${i + 1}`,
        quantity: Math.floor(Math.random() * 3) + 1,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        specialInstructions: i % 3 === 0 ? "Extra spicy, no onions" : undefined,
        price: Math.floor(Math.random() * 20) + 10,
      },
      {
        _id: `item-${i + 1}-2`,
        name: `Caesar Salad ${i + 1}`,
        quantity: 1,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        price: Math.floor(Math.random() * 10) + 8,
      },
    ],
    createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    startedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 3600000).toISOString() : undefined,
    completedAt: Math.random() > 0.7 ? new Date().toISOString() : undefined,
    estimatedTime: Math.floor(Math.random() * 30) + 10,
    assignedChef:
      Math.random() > 0.5 ? `Chef ${["John", "Sarah", "Mike", "Lisa"][Math.floor(Math.random() * 4)]}` : undefined,
    totalAmount: Math.floor(Math.random() * 50) + 20,
    customer: {
      name: `Customer ${i + 1}`,
      phone: `+1234567${String(i).padStart(3, "0")}`,
    },
    notes: i % 4 === 0 ? "Customer has allergies to nuts" : undefined,
  })) as KitchenOrder[]
}

function generateMockStats() {
  const now = new Date()
  const today = now.toISOString().split("T")[0]

  return {
    totalOrders: 45,
    completedOrders: 32,
    pendingOrders: 8,
    readyOrders: 3,
    cancelledOrders: 2,
    avgPreparationTime: 22,
    byStatus: [
      { _id: "Completed", count: 32 },
      { _id: "Preparing", count: 5 },
      { _id: "New", count: 3 },
      { _id: "Ready", count: 3 },
      { _id: "Cancelled", count: 2 },
    ],
    byPriority: [
      { _id: "High", count: 8 },
      { _id: "Medium", count: 25 },
      { _id: "Low", count: 12 },
    ],
    preparationTime: {
      avgPreparationTime: 22,
      minPreparationTime: 8,
      maxPreparationTime: 45,
    },
    hourlyStats: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      orders: Math.floor(Math.random() * 10),
      avgTime: Math.floor(Math.random() * 20) + 10,
    })),
    date: today,
  }
}
