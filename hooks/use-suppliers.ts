"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface Supplier {
  _id: string
  name: string
  code?: string
  contact_person?: string
  phone?: string
  alternative_phone?: string
  email?: string
  website?: string
  address?: {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  supplies?: string[]
  categories?: string[]
  tax_id?: string
  payment_terms?: string
  credit_limit?: number
  currency?: string
  bank_details?: {
    bank_name?: string
    account_number?: string
    account_name?: string
    swift_code?: string
  }
  notes?: string
  rating?: number
  is_active: boolean
  lead_time?: number
  minimum_order?: number
  documents?: Array<{
    _id: string
    name: string
    url: string
    type: string
    uploaded_at: string
  }>
  createdAt: string
  updatedAt: string
}

interface PaginationData {
  page: number
  limit: number
  totalPages: number
}

interface SupplierResponse {
  success: boolean
  count: number
  total: number
  pagination: PaginationData
  data: Supplier[]
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    totalPages: 1,
  })
  const [totalSuppliers, setTotalSuppliers] = useState<number>(0)
  const { toast } = useToast()

  const fetchSuppliers = useCallback(
    async (page = 1, limit = 20, search = "", category = "", isActive = "") => {
      setLoading(true)
      setError(null)

      try {
        let url = `/api/inventory/suppliers?page=${page}&limit=${limit}`
        if (search) url += `&search=${encodeURIComponent(search)}`
        if (category) url += `&category=${encodeURIComponent(category)}`
        if (isActive !== "") url += `&isActive=${isActive}`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Error fetching suppliers: ${response.status}`)
        }

        const data: SupplierResponse = await response.json()

        setSuppliers(data.data)
        setPagination(data.pagination)
        setTotalSuppliers(data.total)
        return data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to fetch suppliers",
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const getSupplierById = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)

      try {
        // Skip API call if the ID is "new"
        if (id === "new") {
          setLoading(false)
          return null
        }

        const response = await fetch(`/api/inventory/suppliers/${id}`)

        if (!response.ok) {
          throw new Error(`Error fetching supplier: ${response.status}`)
        }

        const data = await response.json()
        return data.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to fetch supplier",
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const createSupplier = useCallback(
    async (supplierData: Partial<Supplier>) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/inventory/suppliers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(supplierData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Error creating supplier: ${response.status}`)
        }

        const data = await response.json()

        toast({
          title: "Success",
          description: "Supplier created successfully",
        })

        return data.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to create supplier",
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const updateSupplier = useCallback(
    async (id: string, supplierData: Partial<Supplier>) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/inventory/suppliers/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(supplierData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Error updating supplier: ${response.status}`)
        }

        const data = await response.json()

        toast({
          title: "Success",
          description: "Supplier updated successfully",
        })

        return data.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to update supplier",
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const deleteSupplier = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/inventory/suppliers/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Error deleting supplier: ${response.status}`)
        }

        toast({
          title: "Success",
          description: "Supplier deleted successfully",
        })

        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to delete supplier",
          variant: "destructive",
        })
        return false
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const getSupplierItems = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/inventory/suppliers/${id}/items`)

        if (!response.ok) {
          throw new Error(`Error fetching supplier items: ${response.status}`)
        }

        const data = await response.json()
        return data.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to fetch supplier items",
          variant: "destructive",
        })
        return []
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const toggleSupplierStatus = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/inventory/suppliers/${id}/toggle-status`, {
          method: "PATCH",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Error toggling supplier status: ${response.status}`)
        }

        const data = await response.json()

        toast({
          title: "Success",
          description: data.message || "Supplier status updated successfully",
        })

        return data.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to toggle supplier status",
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const addSupplierDocument = useCallback(
    async (id: string, documentData: { name: string; url: string; type: string }) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/inventory/suppliers/${id}/documents`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(documentData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Error adding document: ${response.status}`)
        }

        const data = await response.json()

        toast({
          title: "Success",
          description: "Document added successfully",
        })

        return data.data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to add document",
          variant: "destructive",
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const removeSupplierDocument = useCallback(
    async (id: string, documentId: string) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/inventory/suppliers/${id}/documents/${documentId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Error removing document: ${response.status}`)
        }

        toast({
          title: "Success",
          description: "Document removed successfully",
        })

        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to remove document",
          variant: "destructive",
        })
        return false
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  return {
    suppliers,
    loading,
    error,
    pagination,
    totalSuppliers,
    fetchSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierItems,
    toggleSupplierStatus,
    addSupplierDocument,
    removeSupplierDocument,
  }
}
