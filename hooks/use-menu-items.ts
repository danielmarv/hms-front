"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { useToast } from "./use-toast"
import type { MenuItem, MenuItemFilters, ApiResponse } from "@/types"

export const useMenuItems = () => {
  const { request, isLoading: apiLoading } = useApi()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getMenuItems = async (filters: MenuItemFilters = {}) => {
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

      const response = await request<ApiResponse<MenuItem[]>>(`/restaurant/menu-items?${queryParams.toString()}`, "GET")
      setLoading(false)
      return response
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch menu items")
      toast({
        title: "Error",
        description: err.message || "Failed to fetch menu items",
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

  const getMenuItem = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<MenuItem>>(`/restaurant/menu-items/${id}`, "GET")
      setLoading(false)
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch menu item")
      toast({
        title: "Error",
        description: err.message || "Failed to fetch menu item",
        variant: "destructive",
      })
      return null
    }
  }

  const createMenuItem = async (menuItem: Partial<MenuItem>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<MenuItem>>("/restaurant/menu-items", "POST", menuItem)
      setLoading(false)
      toast({
        title: "Success",
        description: "Menu item created successfully",
      })
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to create menu item")
      toast({
        title: "Error",
        description: err.message || "Failed to create menu item",
        variant: "destructive",
      })
      return null
    }
  }

  const updateMenuItem = async (id: string, menuItem: Partial<MenuItem>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<MenuItem>>(`/restaurant/menu-items/${id}`, "PUT", menuItem)
      setLoading(false)
      toast({
        title: "Success",
        description: "Menu item updated successfully",
      })
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update menu item")
      toast({
        title: "Error",
        description: err.message || "Failed to update menu item",
        variant: "destructive",
      })
      return null
    }
  }

  const deleteMenuItem = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<null>>(`/restaurant/menu-items/${id}`, "DELETE")
      setLoading(false)
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      })
      return response.success
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to delete menu item")
      toast({
        title: "Error",
        description: err.message || "Failed to delete menu item",
        variant: "destructive",
      })
      return false
    }
  }

  const toggleAvailability = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<{ availability: boolean }>>(
        `/restaurant/menu-items/${id}/availability`,
        "PATCH",
        {},
      )
      setLoading(false)
      toast({
        title: "Success",
        description: response.message || "Availability updated successfully",
      })
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update availability")
      toast({
        title: "Error",
        description: err.message || "Failed to update availability",
        variant: "destructive",
      })
      return null
    }
  }

  const toggleFeatured = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<ApiResponse<{ featured: boolean }>>(
        `/restaurant/menu-items/${id}/featured`,
        "PATCH",
        {},
      )
      setLoading(false)
      toast({
        title: "Success",
        description: response.message || "Featured status updated successfully",
      })
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to update featured status")
      toast({
        title: "Error",
        description: err.message || "Failed to update featured status",
        variant: "destructive",
      })
      return null
    }
  }

  return {
    loading: loading || apiLoading,
    error,
    getMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    toggleFeatured,
  }
}
