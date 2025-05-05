"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface InventoryItem {
  _id: string
  name: string
  sku: string
  category: string
  quantity_in_stock: number
  reorder_level: number
  unit: string
  price_per_unit: number
  total_value: number
  supplier:
    | string
    | {
        _id: string
        name: string
        contact_person: string
        phone: string
      }
  location: string
  is_active: boolean
  createdAt: string
  updatedAt: string
}

interface StockTransaction {
  _id: string
  item: string
  type: "restock" | "consumption" | "transfer" | "adjustment" | "waste" | "return"
  quantity: number
  unit_price: number
  transaction_date: string
  department?: string
  reference_number?: string
  reason?: string
  performedBy: string | { _id: string; full_name: string }
  status: "pending" | "completed" | "cancelled"
  createdAt: string
}

interface InventoryStats {
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

interface PaginationData {
  page: number
  limit: number
  totalPages: number
}

interface InventoryResponse {
  success: boolean
  count: number
  total: number
  pagination: PaginationData
  data: InventoryItem[]
}

interface TransactionResponse {
  success: boolean
  count: number
  total: number
  pagination: PaginationData
  data: StockTransaction[]
}

interface StatsResponse {
  success: boolean
  data: InventoryStats
}

interface StockUpdateData {
  quantity: number
  type: "restock" | "consumption" | "transfer" | "adjustment" | "waste" | "return"
  reason?: string
  unit_price?: number
  department?: string
  reference_number?: string
  transaction_date?: string
}

interface TransactionQueryParams {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  type?: string
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    totalPages: 1,
  })
  const [totalItems, setTotalItems] = useState<number>(0)
  const { toast } = useToast()

  const fetchInventoryItems = useCallback(
    async (page = 1, limit = 20, search = "", category = "", supplier = "", stockStatus = "", isActive = "") => {
      setLoading(true)
      setError(null)

      try {
        let url = `/api/inventory?page=${page}&limit=${limit}`
        if (search) url += `&search=${encodeURIComponent(search)}`
        if (category) url += `&category=${encodeURIComponent(category)}`
        if (supplier) url += `&supplier=${encodeURIComponent(supplier)}`
        if (stockStatus) url += `&stockStatus=${encodeURIComponent(stockStatus)}`
        if (isActive !== "") url += `&isActive=${isActive}`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Error fetching inventory items: ${response.status}`)
        }

        const data: InventoryResponse = await response.json()

        setItems(data.data)
        setPagination(data.pagination)
        setTotalItems(data.total)
        return data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to fetch inventory items",
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  // Alias for fetchInventoryItems with different name for clarity
  const getInventoryItems = fetchInventoryItems

  const getInventoryItemById = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)

      try {
        // Skip API call if the ID is "new"
        if (id === "new") {
          setLoading(false)
          return null
        }

        const response = await fetch(`/api/inventory/${id}`)

        if (!response.ok) {
          throw new Error(`Error fetching inventory item: ${response.status}`)
        }

        const data = await response.json()
        return data.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to fetch inventory item",
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const createInventoryItem = useCallback(
    async (itemData: Partial<InventoryItem>) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/inventory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Error creating inventory item: ${response.status}`)
        }

        const data = await response.json()

        toast({
          title: "Success",
          description: "Inventory item created successfully",
        })

        return data.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to create inventory item",
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const updateInventoryItem = useCallback(
    async (id: string, itemData: Partial<InventoryItem>) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/inventory/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(itemData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Error updating inventory item: ${response.status}`)
        }

        const data = await response.json()

        toast({
          title: "Success",
          description: "Inventory item updated successfully",
        })

        return data.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to update inventory item",
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const deleteInventoryItem = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/inventory/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Error deleting inventory item: ${response.status}`)
        }

        toast({
          title: "Success",
          description: "Inventory item deleted successfully",
        })

        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to delete inventory item",
          variant: "destructive",
        })
        return false
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const updateStockLevel = useCallback(
    async (id: string, data: StockUpdateData) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/inventory/${id}/stock`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
            transaction_date: data.transaction_date || new Date().toISOString(),
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Error updating stock level: ${response.status}`)
        }

        const responseData = await response.json()

        toast({
          title: "Success",
          description: "Stock level updated successfully",
        })

        return responseData.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to update stock level",
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const getItemTransactions = useCallback(
    async (id: string, params: TransactionQueryParams = {}) => {
      setLoading(true)
      setError(null)

      try {
        const { page = 1, limit = 20, startDate, endDate, type } = params

        let url = `/api/inventory/${id}/transactions?page=${page}&limit=${limit}`
        if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`
        if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`
        if (type) url += `&type=${encodeURIComponent(type)}`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Error fetching transactions: ${response.status}`)
        }

        const data: TransactionResponse = await response.json()
        return data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to fetch transactions",
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const fetchLowStockItems = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/inventory/low-stock")

      if (!response.ok) {
        throw new Error(`Error fetching low stock items: ${response.status}`)
      }

      const data = await response.json()
      return data.data
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch low stock items",
        variant: "destructive",
      })
      return []
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchInventoryStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/inventory/stats")

      if (!response.ok) {
        throw new Error(`Error fetching inventory statistics: ${response.status}`)
      }

      const data: StatsResponse = await response.json()
      return data.data
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch inventory statistics",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [toast])

  const transferStock = useCallback(
    async (fromItemId: string, toItemId: string, quantity: number, reason?: string, department?: string) => {
      setLoading(true)
      setError(null)

      try {
        // First, reduce stock from source item
        const deductResponse = await updateStockLevel(fromItemId, {
          quantity,
          type: "transfer",
          reason: `Transfer to item ID: ${toItemId}${reason ? ` - ${reason}` : ""}`,
          department,
        })

        if (!deductResponse) {
          throw new Error("Failed to deduct stock from source item")
        }

        // Then, add stock to destination item
        const addResponse = await updateStockLevel(toItemId, {
          quantity,
          type: "transfer",
          reason: `Transfer from item ID: ${fromItemId}${reason ? ` - ${reason}` : ""}`,
          department,
        })

        if (!addResponse) {
          // If adding to destination fails, we should ideally revert the deduction
          // This would require a more complex transaction system
          throw new Error("Failed to add stock to destination item")
        }

        toast({
          title: "Success",
          description: "Stock transferred successfully",
        })

        return { from: deductResponse, to: addResponse }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to transfer stock",
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast, updateStockLevel],
  )

  const transferStockToDepartment = useCallback(
    async (itemId: string, quantity: number, department: string, reason?: string) => {
      setLoading(true)
      setError(null)

      try {
        const response = await updateStockLevel(itemId, {
          quantity,
          type: "consumption",
          reason: `Transfer to ${department} department${reason ? ` - ${reason}` : ""}`,
          department,
        })

        if (!response) {
          throw new Error("Failed to transfer stock to department")
        }

        toast({
          title: "Success",
          description: `Stock transferred successfully to ${department} department`,
        })

        return response
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to transfer stock to department",
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast, updateStockLevel],
  )

  return {
    items,
    loading,
    error,
    pagination,
    totalItems,
    fetchInventoryItems,
    getInventoryItems,
    getInventoryItemById,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateStockLevel,
    getItemTransactions,
    fetchLowStockItems,
    fetchInventoryStats,
    transferStock,
    transferStockToDepartment,
  }
}
