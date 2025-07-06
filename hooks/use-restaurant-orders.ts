"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"
import type { MenuItem, Table, Order, OrderFilters, OrderStats, ApiResponse } from "@/types"

// Types for filters
interface MenuItemFilters {
  search?: string
  category?: string
  subcategory?: string
  availability?: boolean
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  featured?: boolean
  minPrice?: number
  maxPrice?: number
  menuSection?: string
  page?: number
  limit?: number
  sort?: string
}

interface TableFilters {
  section?: string
  status?: string
  capacity?: number
  isActive?: boolean
}

export const useRestaurant = () => {
  const { request, isLoading: apiLoading } = useApi()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ===== MENU ITEMS =====
  const getMenuItems = async (filters: MenuItemFilters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })

      const response = await request(`/restaurant/menu-items?${queryParams.toString()}`, "GET")
      setLoading(false)
      return response
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch menu items")
      return {
        success: false,
        data: [],
        count: 0,
        total: 0,
        pagination: { page: 1, limit: 20, totalPages: 0 },
      }
    }
  }

  const getMenuItem = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request(`/restaurant/menu-items/${id}`, "GET")
      setLoading(false)
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch menu item")
      return null
    }
  }

  const createMenuItem = async (menuItem: Partial<MenuItem>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request("/restaurant/menu-items", "POST", menuItem)
      setLoading(false)
      toast.success("Menu item created successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to create menu item")
      toast.error(err.message || "Failed to create menu item")
      return null
    }
  }

  const updateMenuItem = async (id: string, menuItem: Partial<MenuItem>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request(`/restaurant/menu-items/${id}`, "PUT", menuItem)
      setLoading(false)
      toast.success("Menu item updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update menu item")
      toast.error(err.message || "Failed to update menu item")
      return null
    }
  }

  const deleteMenuItem = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request(`/restaurant/menu-items/${id}`, "DELETE")
      setLoading(false)
      toast.success("Menu item deleted successfully")
      return response
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to delete menu item")
      toast.error(err.message || "Failed to delete menu item")
      return false
    }
  }

  const toggleMenuItemAvailability = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request(
        `/restaurant/menu-items/${id}/availability`,
        "PATCH",
      )
      setLoading(false)
      toast.success("Menu item availability updated")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update availability")
      toast.error(err.message || "Failed to update availability")
      return null
    }
  }

  const toggleMenuItemFeatured = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request(
        `/restaurant/menu-items/${id}/featured`,
        "PATCH",
      )
      setLoading(false)
      toast.success("Menu item featured status updated")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update featured status")
      toast.error(err.message || "Failed to update featured status")
      return null
    }
  }

  // ===== TABLES =====
  const getTables = async (filters: TableFilters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })

      const response = await request(`/restaurant/tables?${queryParams.toString()}`, "GET")
      setLoading(false)
      return response
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch tables")
      return {
        success: false,
        data: [],
        count: 0,
      }
    }
  }

  const getTable = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request(`/restaurant/tables/${id}`, "GET")
      setLoading(false)
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch table")
      return null
    }
  }

  const createTable = async (table: Partial<Table>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request("/restaurant/tables", "POST", table)
      setLoading(false)
      toast.success("Table created successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to create table")
      toast.error(err.message || "Failed to create table")
      return null
    }
  }

  const updateTable = async (id: string, table: Partial<Table>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request(`/restaurant/tables/${id}`, "PUT", table)
      setLoading(false)
      toast.success("Table updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update table")
      toast.error(err.message || "Failed to update table")
      return null
    }
  }

  const deleteTable = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request(`/restaurant/tables/${id}`, "DELETE")
      setLoading(false)
      toast.success("Table deleted successfully")
      return response
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to delete table")
      toast.error(err.message || "Failed to delete table")
      return false
    }
  }

  const updateTableStatus = async (
    id: string,
    statusData: {
      status: string
      currentGuests?: number
      reservationName?: string
      reservationPhone?: string
      reservationTime?: string
      notes?: string
    },
  ) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request(`/restaurant/tables/${id}/status`, "PATCH", statusData)
      setLoading(false)
      toast.success("Table status updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update table status")
      toast.error(err.message || "Failed to update table status")
      return null
    }
  }

  const getOrders = async (filters: OrderFilters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })

      const response = await request(`/restaurant/orders?${queryParams.toString()}`, "GET")
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
      const response = await request(`/restaurant/orders/${id}`, "GET")
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
      const response = await request("/restaurant/orders", "POST", order)
      setLoading(false)
      toast.success("Order created successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to create order")
      toast.error(err.message || "Failed to create order")
      return null
    }
  }
  const updateOrder = async (id: string, order: Partial<Order>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request(`/restaurant/orders/${id}`, "PUT", order)
      setLoading(false)
      toast.success("Order updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update order")
      toast.error(err.message || "Failed to update order")
      return null
    }
  }

  const updateOrderStatus = async (id: string, status: string, cancellationReason?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request(`/restaurant/orders/${id}/status`, "PATCH", {
        status,
        cancellationReason,
      })
      setLoading(false)
      toast.success("Order status updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update order status")
      toast.error(err.message || "Failed to update order status")
      return null
    }
  }

  const updatePaymentStatus = async (id: string, status: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request(`/restaurant/orders/${id}/payment`, "PATCH", { status })
      setLoading(false)
      toast.success("Payment status updated successfully")
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update payment status")
      toast.error(err.message || "Failed to update payment status")
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

      const response = await request(
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

    // Menu Items
    getMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    toggleMenuItemFeatured,

    // Tables
    getTables,
    getTable,
    createTable,
    updateTable,
    deleteTable,
    updateTableStatus,

    // Orders
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    updateOrderStatus,
    updatePaymentStatus,
    getOrderStats,
  }
}

export const useRestaurantMenuItems = () => {
  const {
    getMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    toggleMenuItemFeatured,
    loading,
    error,
  } = useRestaurant()

  return {
    getMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    toggleMenuItemFeatured,
    loading,
    error,
  }
}

export const useRestaurantTables = () => {
  const { getTables, getTable, createTable, updateTable, deleteTable, updateTableStatus, loading, error } =
    useRestaurant()

  return {
    getTables,
    getTable,
    createTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    loading,
    error,
  }
}

export const useRestaurantOrders = () => {
  const {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    updateOrderStatus,
    updatePaymentStatus,
    getOrderStats,
    loading,
    error,
  } = useRestaurant()

  return {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    updateOrderStatus,
    updatePaymentStatus,
    getOrderStats,
    loading,
    error,
  }
}
