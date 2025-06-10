"use client"

import { useState, useCallback } from "react"
import { useApi, type ApiResponse } from "./use-api"

// Types based on the backend schema
export type InventoryItem = {
  _id: string
  name: string
  description?: string
  category: string
  sku?: string
  barcode?: string
  unit: string
  unitPrice: number
  currentStock: number
  minStockLevel: number
  maxStockLevel: number
  reorderPoint: number
  reorderQuantity: number
  location?: string
  supplier?:
    | string
    | {
        _id: string
        name: string
        contact_person: string
        phone: string
        email: string
      }
  expiryDate?: string
  isPerishable: boolean
  isActive: boolean
  image?: string
  tags?: string[]
  notes?: string
  lastRestockDate?: string
  lastCountDate?: string
  createdAt: string
  updatedAt: string
  stockStatus?: string
}

export type StockTransaction = {
  _id: string
  item: string
  type: "restock" | "use" | "transfer" | "adjustment" | "waste"
  quantity: number
  unit_price: number
  transaction_date: string
  department?: string
  reference_number?: string
  reason?: string
  performedBy: string | { _id: string; full_name: string }
  approvedBy?: string | { _id: string; full_name: string }
  status: "pending" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
}

export type InventoryStats = {
  totalItems: number
  activeItems: number
  totalValue: number
  categoryStats: Array<{
    _id: string
    count: number
    value: number
  }>
  stockStatus: Array<{
    _id: string
    count: number
  }>
}

export type PaginationData = {
  page: number
  limit: number
  totalPages: number
}

export type StockUpdateData = {
  quantity: number
  type: "restock" | "use" | "transfer" | "adjustment" | "waste"
  reason?: string
  unit_price?: number
  department?: string
  reference_number?: string
  transaction_date?: string
}

export function useInventory() {
  const { request, isLoading } = useApi()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    totalPages: 1,
  })
  const [totalItems, setTotalItems] = useState(0)

  // Get all inventory items with filtering, pagination, and sorting
  const fetchInventoryItems = useCallback(
    async (page = 1, limit = 20, search = "", category = "", supplier = "", stockStatus = "", isActive = "") => {
      let queryParams = `?page=${page}&limit=${limit}`
      if (search) queryParams += `&search=${encodeURIComponent(search)}`
      if (category) queryParams += `&category=${encodeURIComponent(category)}`
      if (supplier) queryParams += `&supplier=${encodeURIComponent(supplier)}`
      if (stockStatus) queryParams += `&stockStatus=${encodeURIComponent(stockStatus)}`
      if (isActive !== "") queryParams += `&isActive=${isActive}`

      const response = await request<{
        data: InventoryItem[]
        pagination: PaginationData
        total: number
      }>(`/inventory${queryParams}`, "GET", undefined, false)

      if (response.data) {
        setItems(response.data.data)
        setPagination(response.data.pagination)
        setTotalItems(response.data.total)
      } else {
        setError(response.error)
      }

      return response
    },
    [request],
  )

  // Alias for fetchInventoryItems
  const getInventoryItems = fetchInventoryItems

  // Get inventory item by ID
  const getInventoryItemById = useCallback(
    async (id: string): Promise<ApiResponse<InventoryItem>> => {
      // Skip API call if the ID is "new"
      if (id === "new") {
        return { data: null, error: null, isLoading: false }
      }

      return await request<InventoryItem>(`/inventory/${id}`, "GET", undefined, false)
    },
    [request],
  )

  // Get item transactions
  const getItemTransactions = useCallback(
    async (
      id: string,
      params: { page?: number; limit?: number; startDate?: string; endDate?: string; type?: string } = {},
    ): Promise<ApiResponse<{ data: StockTransaction[]; pagination: PaginationData; total: number }>> => {
      const { page = 1, limit = 20, startDate, endDate, type } = params

      let queryParams = `?page=${page}&limit=${limit}`
      if (startDate) queryParams += `&startDate=${encodeURIComponent(startDate)}`
      if (endDate) queryParams += `&endDate=${encodeURIComponent(endDate)}`
      if (type) queryParams += `&type=${encodeURIComponent(type)}`

      return await request<{ data: StockTransaction[]; pagination: PaginationData; total: number }>(
        `/inventory/${id}/transactions${queryParams}`,
        "GET",
        undefined,
        false,
      )
    },
    [request],
  )

  // Create new inventory item
  const createInventoryItem = useCallback(
    async (itemData: Partial<InventoryItem>) => {
      return await request<InventoryItem>("/inventory", "POST", itemData)
    },
    [request],
  )

  // Update inventory item
  const updateInventoryItem = useCallback(
    async (id: string, itemData: Partial<InventoryItem>) => {
      return await request<InventoryItem>(`/inventory/${id}`, "PUT", itemData)
    },
    [request],
  )

  // Delete inventory item
  const deleteInventoryItem = useCallback(
    async (id: string) => {
      return await request<{ success: boolean; message: string }>(`/inventory/${id}`, "DELETE")
    },
    [request],
  )

  // Update stock level
  const updateStockLevel = useCallback(
    async (id: string, data: StockUpdateData) => {
      return await request<{ transaction: StockTransaction; currentStock: number; stockStatus: string }>(
        `/inventory/${id}/stock`,
        "PATCH",
        data,
      )
    },
    [request],
  )

  // Get low stock items
  const fetchLowStockItems = useCallback(async () => {
    return await request<InventoryItem[]>("/inventory/low-stock", "GET", undefined, false)
  }, [request])

  // Get inventory statistics
  const fetchInventoryStats = useCallback(async () => {
    return await request<InventoryStats>("/inventory/stats", "GET", undefined, false)
  }, [request])

  // Transfer stock between items
  const transferStock = useCallback(
    async (fromItemId: string, toItemId: string, quantity: number, reason?: string) => {
      // This is a custom implementation since there's no direct endpoint for this
      // First, reduce stock from source item
      const deductResponse = await updateStockLevel(fromItemId, {
        quantity,
        type: "transfer",
        reason: `Transfer to item ID: ${toItemId}${reason ? ` - ${reason}` : ""}`,
      })

      if (!deductResponse.data) {
        return { data: null, error: "Failed to deduct stock from source item", isLoading: false }
      }

      // Then, add stock to destination item
      const addResponse = await updateStockLevel(toItemId, {
        quantity,
        type: "transfer",
        reason: `Transfer from item ID: ${fromItemId}${reason ? ` - ${reason}` : ""}`,
      })

      if (!addResponse.data) {
        return { data: null, error: "Failed to add stock to destination item", isLoading: false }
      }

      return {
        data: { success: true, from: deductResponse.data, to: addResponse.data },
        error: null,
        isLoading: false,
      }
    },
    [updateStockLevel],
  )

  // Transfer stock to department
  const transferStockToDepartment = useCallback(
    async (itemId: string, department: string, quantity: number, reason?: string) => {
      return await updateStockLevel(itemId, {
        quantity,
        type: "use",
        department,
        reason: `Transfer to ${department} department${reason ? ` - ${reason}` : ""}`,
      })
    },
    [updateStockLevel],
  )

  // Get inventory categories (hardcoded based on backend schema)
  const getInventoryCategories = useCallback(async () => {
    return {
      data: [
        "Food",
        "Beverage",
        "Cleaning",
        "Toiletries",
        "Linen",
        "Office",
        "Maintenance",
        "Equipment",
        "Furniture",
        "Other",
      ],
      error: null,
      isLoading: false,
    }
  }, [])

  // Get inventory units (hardcoded based on backend schema)
  const getInventoryUnits = useCallback(async () => {
    return {
      data: ["piece", "kg", "g", "l", "ml", "box", "carton", "pack", "set", "pair", "other"],
      error: null,
      isLoading: false,
    }
  }, [])

  // Get inventory locations (would be dynamic in a real app)
  const getInventoryLocations = useCallback(async () => {
    return {
      data: [
        "Main Storage",
        "Kitchen",
        "Bar",
        "Housekeeping",
        "Maintenance",
        "Front Desk",
        "Restaurant",
        "Spa",
        "Gym",
        "Other",
      ],
      error: null,
      isLoading: false,
    }
  }, [])

  // Get inventory departments (would be dynamic in a real app)
  const getInventoryDepartments = useCallback(async () => {
    return {
      data: [
        "Kitchen",
        "Housekeeping",
        "Maintenance",
        "Front Desk",
        "Restaurant",
        "Bar",
        "Spa",
        "Gym",
        "Administration",
        "Other",
      ],
      error: null,
      isLoading: false,
    }
  }, [])

  return {
    items,
    loading: isLoading,
    error,
    pagination,
    totalItems,
    fetchInventoryItems,
    getInventoryItems,
    getInventoryItemById,
    getItemTransactions,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateStockLevel,
    fetchLowStockItems,
    fetchInventoryStats,
    transferStock,
    transferStockToDepartment,
    getInventoryCategories,
    getInventoryUnits,
    getInventoryLocations,
    getInventoryDepartments,
  }
}
