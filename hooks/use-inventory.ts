"use client"

import { useState, useCallback } from "react"
import { useApi, type ApiResponse } from "./use-api"

export type InventoryItem = {
  id: string
  name: string
  sku: string
  description?: string
  category: string
  currentStock: number
  minStockLevel: number
  maxStockLevel: number
  reorderPoint: number
  unitPrice: number
  unitCost: number
  supplier: string
  supplierName?: string
  location?: string
  department?: string
  lastRestockDate?: string
  expiryDate?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type InventoryTransaction = {
  id: string
  inventoryItemId: string
  type: "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT"
  quantity: number
  fromLocation?: string
  toLocation?: string
  fromDepartment?: string
  toDepartment?: string
  notes?: string
  createdBy: string
  createdAt: string
}

export type PaginationData = {
  currentPage: number
  totalPages: number
  limit: number
}

export function useInventory() {
  const { request, isLoading } = useApi()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  })
  const [totalItems, setTotalItems] = useState(0)

  const fetchInventoryItems = useCallback(
    async (page = 1, limit = 10, search = "", category = "", supplier = "", stockStatus = "", isActive = "") => {
      let queryParams = `?page=${page}&limit=${limit}`
      if (search) queryParams += `&search=${encodeURIComponent(search)}`
      if (category) queryParams += `&category=${encodeURIComponent(category)}`
      if (supplier) queryParams += `&supplier=${encodeURIComponent(supplier)}`
      if (stockStatus) queryParams += `&stockStatus=${encodeURIComponent(stockStatus)}`
      if (isActive) queryParams += `&isActive=${encodeURIComponent(isActive)}`

      const response = await request<{
        items: InventoryItem[]
        pagination: PaginationData
        totalItems: number
      }>(`/inventory${queryParams}`)

      if (response.data) {
        setItems(response.data.items)
        setPagination(response.data.pagination)
        setTotalItems(response.data.totalItems)
      } else {
        setError(response.error)
      }

      return response
    },
    [request],
  )

  // Add the missing getInventoryItemById method
  const getInventoryItemById = useCallback(
    async (id: string): Promise<ApiResponse<InventoryItem>> => {
      const response = await request<InventoryItem>(`/inventory/${id}`)
      return response
    },
    [request],
  )

  // Add the missing getInventoryItems method (different from fetchInventoryItems as it returns the raw response)
  const getInventoryItems = useCallback(
    async (
      page = 1,
      limit = 10,
      search = "",
      category = "",
      supplier = "",
      stockStatus = "",
      isActive = "",
    ): Promise<ApiResponse<{ items: InventoryItem[]; pagination: PaginationData; totalItems: number }>> => {
      let queryParams = `?page=${page}&limit=${limit}`
      if (search) queryParams += `&search=${encodeURIComponent(search)}`
      if (category) queryParams += `&category=${encodeURIComponent(category)}`
      if (supplier) queryParams += `&supplier=${encodeURIComponent(supplier)}`
      if (stockStatus) queryParams += `&stockStatus=${encodeURIComponent(stockStatus)}`
      if (isActive) queryParams += `&isActive=${encodeURIComponent(isActive)}`

      return await request<{
        items: InventoryItem[]
        pagination: PaginationData
        totalItems: number
      }>(`/inventory${queryParams}`)
    },
    [request],
  )

  // Add the missing getItemTransactions method
  const getItemTransactions = useCallback(
    async (
      itemId: string,
      page = 1,
      limit = 10,
    ): Promise<
      ApiResponse<{ transactions: InventoryTransaction[]; pagination: PaginationData; totalTransactions: number }>
    > => {
      const queryParams = `?page=${page}&limit=${limit}`
      return await request<{
        transactions: InventoryTransaction[]
        pagination: PaginationData
        totalTransactions: number
      }>(`/inventory/${itemId}/transactions${queryParams}`)
    },
    [request],
  )

  const createInventoryItem = useCallback(
    async (itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => {
      const response = await request<InventoryItem>("/inventory", "POST", itemData)
      if (response.data) {
        // Refresh the inventory list after creating a new item
        fetchInventoryItems(pagination.currentPage, pagination.limit)
      }
      return response
    },
    [request, fetchInventoryItems, pagination],
  )

  const updateInventoryItem = useCallback(
    async (id: string, itemData: Partial<InventoryItem>) => {
      const response = await request<InventoryItem>(`/inventory/${id}`, "PUT", itemData)
      if (response.data) {
        // Update the local state with the updated item
        setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, ...response.data } : item)))
      }
      return response
    },
    [request],
  )

  const deleteInventoryItem = useCallback(
    async (id: string) => {
      const response = await request<{ success: boolean }>(`/inventory/${id}`, "DELETE")
      if (response.data?.success) {
        // Remove the deleted item from the local state
        setItems((prevItems) => prevItems.filter((item) => item.id !== id))
        setTotalItems((prev) => prev - 1)
      }
      return response
    },
    [request],
  )

  const updateStockLevel = useCallback(
    async (
      id: string,
      quantity: number,
      type: "IN" | "OUT" | "ADJUSTMENT",
      notes?: string,
      location?: string,
      department?: string,
      supplier?: string,
    ) => {
      const data = {
        quantity,
        type,
        notes,
        location,
        department,
        supplier,
      }
      return await request<InventoryItem>(`/inventory/${id}/stock`, "PUT", data)
    },
    [request],
  )

  const transferStock = useCallback(
    async (
      fromItemId: string,
      toItemId: string,
      quantity: number,
      notes?: string,
      fromLocation?: string,
      toLocation?: string,
    ) => {
      const data = {
        fromItemId,
        toItemId,
        quantity,
        notes,
        fromLocation,
        toLocation,
      }
      return await request<{ success: boolean }>(`/inventory/transfer`, "POST", data)
    },
    [request],
  )

  // Add the missing transferStockToDepartment method
  const transferStockToDepartment = useCallback(
    async (itemId: string, departmentId: string, quantity: number, notes?: string) => {
      const data = {
        itemId,
        departmentId,
        quantity,
        notes,
      }
      return await request<{ success: boolean }>(`/inventory/${itemId}/transfer-to-department`, "POST", data)
    },
    [request],
  )

  const getInventoryCategories = useCallback(async () => {
    return await request<string[]>("/inventory/categories")
  }, [request])

  const getInventoryLocations = useCallback(async () => {
    return await request<string[]>("/inventory/locations")
  }, [request])

  const getInventoryDepartments = useCallback(async () => {
    return await request<string[]>("/inventory/departments")
  }, [request])

  return {
    items,
    loading: isLoading,
    error,
    pagination,
    totalItems,
    fetchInventoryItems,
    getInventoryItemById,
    getInventoryItems,
    getItemTransactions,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateStockLevel,
    transferStock,
    transferStockToDepartment,
    getInventoryCategories,
    getInventoryLocations,
    getInventoryDepartments,
  }
}
