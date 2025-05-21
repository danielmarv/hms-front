"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"

export type SupplierDocument = {
  _id: string
  name: string
  url: string
  type: string
  uploaded_at: string
}

export type Supplier = {
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
  documents?: SupplierDocument[]
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  __v?: number
}

export type SupplierFilters = {
  search?: string
  category?: string
  isActive?: boolean
  page?: number
  limit?: number
  sort?: string
}

export type PaginationData = {
  page: number
  limit: number
  totalPages: number
}

export function useSuppliers() {
  const { request, isLoading } = useApi()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [supplierItems, setSupplierItems] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    totalPages: 1,
  })
  const [totalSuppliers, setTotalSuppliers] = useState(0)

  // Get all suppliers with filtering, pagination, and sorting
  // Updated getSuppliers function to match the actual API response format
  const getSuppliers = useCallback(
    async (filters: SupplierFilters = {}) => {
      const { search, category, isActive, page = 1, limit = 20, sort = "name" } = filters

      let queryParams = `?page=${page}&limit=${limit}&sort=${sort}`
      if (search) queryParams += `&search=${encodeURIComponent(search)}`
      if (category) queryParams += `&category=${encodeURIComponent(category)}`
      if (isActive !== undefined) queryParams += `&isActive=${isActive}`

      const response = await request<{
        success: boolean
        count: number
        total: number
        pagination: PaginationData
        data: []
      }>(`/suppliers${queryParams}`)

      console.log("Suppliers response:", response)
      if (response.data) {
        setSuppliers(response.data)
        setPagination(response.data.pagination)
        setTotalSuppliers(response.data.total)
        setError(null)
      } else {
        setError(response.error || "Failed to fetch suppliers")
      }

      return response
    },
    [request],
  )

  // Get supplier by ID
  const getSupplierById = useCallback(
    async (id: string) => {
      const response = await request<{ data: Supplier }>(`/suppliers/${id}`)

      if (response.data) {
        setSupplier(response.data.data)
        setError(null)
      } else {
        setError(response.error || "Failed to fetch supplier")
      }

      return response
    },
    [request],
  )

  // Get supplier items
  const getSupplierItems = useCallback(
    async (id: string) => {
      const response = await request<{ data: any[] }>(`/suppliers/${id}/items`)

      if (response.data) {
        setSupplierItems(response.data.data)
        setError(null)
      } else {
        setError(response.error || "Failed to fetch supplier items")
      }

      return response
    },
    [request],
  )

  // Create new supplier
  const createSupplier = useCallback(
    async (supplierData: Partial<Supplier>) => {
      const response = await request<{ data: Supplier }>("/suppliers", "POST", supplierData)

      if (response.data) {
        toast.success("Supplier created successfully")
        setError(null)
      } else {
        setError(response.error || "Failed to create supplier")
      }

      return response
    },
    [request],
  )

  // Update supplier
  const updateSupplier = useCallback(
    async (id: string, supplierData: Partial<Supplier>) => {
      const response = await request<{ data: Supplier }>(`/suppliers/${id}`, "PUT", supplierData)

      if (response.data) {
        setSupplier(response.data.data)
        toast.success("Supplier updated successfully")
        setError(null)
      } else {
        setError(response.error || "Failed to update supplier")
      }

      return response
    },
    [request],
  )

  // Delete supplier
  const deleteSupplier = useCallback(
    async (id: string) => {
      const response = await request<{ success: boolean; message: string }>(`/suppliers/${id}`, "DELETE")

      if (response.data?.success) {
        toast.success(response.data.message || "Supplier deleted successfully")
        setError(null)
        return true
      } else {
        setError(response.error || "Failed to delete supplier")
        return false
      }
    },
    [request],
  )

  // Toggle supplier active status
  const toggleSupplierStatus = useCallback(
    async (id: string) => {
      const response = await request<{ success: boolean; message: string; data: { is_active: boolean } }>(
        `/suppliers/${id}/toggle-status`,
        "PATCH",
      )

      if (response.data?.success) {
        toast.success(response.data.message)

        // Update local state
        setSuppliers((prevSuppliers) =>
          prevSuppliers.map((s) => (s._id === id ? { ...s, is_active: response.data!.data.is_active } : s)),
        )

        if (supplier && supplier._id === id) {
          setSupplier({ ...supplier, is_active: response.data.data.is_active })
        }

        setError(null)
        return true
      } else {
        setError(response.error || "Failed to toggle supplier status")
        return false
      }
    },
    [request, supplier],
  )

  // Add document to supplier
  const addSupplierDocument = useCallback(
    async (id: string, document: { name: string; url: string; type: string }) => {
      const response = await request<{ success: boolean; message: string; data: SupplierDocument }>(
        `/suppliers/${id}/documents`,
        "POST",
        document,
      )

      if (response.data?.success) {
        toast.success(response.data.message || "Document added successfully")

        // Update local state if we have the supplier loaded
        if (supplier && supplier._id === id) {
          const updatedDocuments = [...(supplier.documents || []), response.data.data]
          setSupplier({ ...supplier, documents: updatedDocuments })
        }

        setError(null)
        return true
      } else {
        setError(response.error || "Failed to add document")
        return false
      }
    },
    [request, supplier],
  )

  // Remove document from supplier
  const removeSupplierDocument = useCallback(
    async (id: string, documentId: string) => {
      const response = await request<{ success: boolean; message: string }>(
        `/suppliers/${id}/documents/${documentId}`,
        "DELETE",
      )

      if (response.data?.success) {
        toast.success(response.data.message || "Document removed successfully")

        // Update local state if we have the supplier loaded
        if (supplier && supplier._id === id && supplier.documents) {
          const updatedDocuments = supplier.documents.filter((doc) => doc._id !== documentId)
          setSupplier({ ...supplier, documents: updatedDocuments })
        }

        setError(null)
        return true
      } else {
        setError(response.error || "Failed to remove document")
        return false
      }
    },
    [request, supplier],
  )

  // Clear current supplier
  const clearSupplier = useCallback(() => {
    setSupplier(null)
  }, [])

  return {
    suppliers,
    supplier,
    supplierItems,
    pagination,
    totalSuppliers,
    loading: isLoading,
    error,
    getSuppliers,
    getSupplierById,
    getSupplierItems,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    toggleSupplierStatus,
    addSupplierDocument,
    removeSupplierDocument,
    clearSupplier,
  }
}
