"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { useToast } from "./use-toast"

export type MenuItem = {
  _id: string
  name: string
  description: string
  price: number
  cost: number
  category: string
  subcategory?: string
  imageUrl?: string
  availability: boolean
  preparationTime: number
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  allergens?: string[]
  spicyLevel?: number
  calories?: number
  ingredients?: string[]
  tags?: string[]
  featured: boolean
  menuSections?: string[]
  availableDays?: string[]
  availableTimeStart?: string
  availableTimeEnd?: string
  discountPercentage?: number
  isDiscounted: boolean
  createdAt: string
  updatedAt: string
}

export type MenuItemFilters = {
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

      const response = await request<any>(`/restaurant/menu-items?${queryParams.toString()}`, "GET")
      setLoading(false)
      return response.data
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to fetch menu items")
      toast({
        title: "Error",
        description: err.message || "Failed to fetch menu items",
        variant: "destructive",
      })
      return { data: [], count: 0, total: 0, pagination: { page: 1, limit: 20, totalPages: 0 } }
    }
  }

  const getMenuItem = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await request<any>(`/restaurant/menu-items/${id}`, "GET")
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
      const response = await request<any>("/restaurant/menu-items", "POST", menuItem)
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
      const response = await request<any>(`/restaurant/menu-items/${id}`, "PUT", menuItem)
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
      const response = await request<any>(`/restaurant/menu-items/${id}`, "DELETE")
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
      const response = await request<any>(`/restaurant/menu-items/${id}/availability`, "PATCH", {})
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
      const response = await request<any>(`/restaurant/menu-items/${id}/featured`, "PATCH", {})
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
    loading,
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
