"use client"

import { useState, useCallback } from "react"
import { useApi, type ApiResponse } from "./use-api"

export type Supplier = {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  taxId?: string
  paymentTerms?: string
  notes?: string
  category?: string
  rating?: number
  isActive: boolean
  documents?: SupplierDocument[]
  createdAt: string
  updatedAt: string
}

export type SupplierDocument = {
  id: string
  name: string
  type: string
  url: string
  uploadedAt: string
}

export type PaginationData = {
  currentPage: number
  totalPages: number
  limit: number
}

export function useSuppliers() {
  const { request, isLoading } = useApi()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  })
  const [totalSuppliers, setTotalSuppliers] = useState(0)

  const fetchSuppliers = useCallback(
    async (page = 1, limit = 10, search = "", category = "", isActive = "") => {
      let queryParams = `?page=${page}&limit=${limit}`
      if (search) queryParams += `&search=${encodeURIComponent(search)}`
      if (category) queryParams += `&category=${encodeURIComponent(category)}`
      if (isActive) queryParams += `&isActive=${encodeURIComponent(isActive)}`

      const response = await request<{
        suppliers: Supplier[]
        pagination: PaginationData
        totalSuppliers: number
      }>(`/suppliers${queryParams}`)

      if (response.data) {
        setSuppliers(response.data.suppliers)
        setPagination(response.data.pagination)
        setTotalSuppliers(response.data.totalSuppliers)
      } else {
        setError(response.error)
      }

      return response
    },
    [request],
  )

  // Add the missing getSupplierById method
  const getSupplierById = useCallback(
    async (id: string): Promise<ApiResponse<Supplier>> => {
      return await request<Supplier>(`/suppliers/${id}`)
    },
    [request],
  )

  const createSupplier = useCallback(
    async (supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt" | "documents">) => {
      const response = await request<Supplier>("/suppliers", "POST", supplierData)
      if (response.data) {
        // Refresh the suppliers list after creating a new supplier
        fetchSuppliers(pagination.currentPage, pagination.limit)
      }
      return response
    },
    [request, fetchSuppliers, pagination],
  )

  const updateSupplier = useCallback(
    async (id: string, supplierData: Partial<Supplier>) => {
      const response = await request<Supplier>(`/suppliers/${id}`, "PUT", supplierData)
      if (response.data) {
        // Update the local state with the updated supplier
        setSuppliers((prevSuppliers) =>
          prevSuppliers.map((supplier) => (supplier.id === id ? { ...supplier, ...response.data } : supplier)),
        )
      }
      return response
    },
    [request],
  )

  const deleteSupplier = useCallback(
    async (id: string) => {
      const response = await request<{ success: boolean }>(`/suppliers/${id}`, "DELETE")
      if (response.data?.success) {
        // Remove the deleted supplier from the local state
        setSuppliers((prevSuppliers) => prevSuppliers.filter((supplier) => supplier.id !== id))
        setTotalSuppliers((prev) => prev - 1)
      }
      return response
    },
    [request],
  )

  const uploadSupplierDocument = useCallback(async (id: string, file: File, documentType: string) => {
    // Create a FormData object to send the file
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", documentType)

    // Custom fetch for file upload since our useApi doesn't handle FormData
    const token = localStorage.getItem("accessToken") || ""
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

    try {
      const response = await fetch(`${API_URL}/suppliers/${id}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload document")
      }

      return { data: data, error: null, isLoading: false }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to upload document"
      return { data: null, error: errorMessage, isLoading: false }
    }
  }, [])

  const removeSupplierDocument = useCallback(
    async (id: string, documentId: string) => {
      return await request<{ success: boolean }>(`/suppliers/${id}/documents/${documentId}`, "DELETE")
    },
    [request],
  )

  const getSupplierCategories = useCallback(async () => {
    return await request<string[]>("/suppliers/categories")
  }, [request])

  return {
    suppliers,
    loading: isLoading,
    error,
    pagination,
    totalSuppliers,
    fetchSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    uploadSupplierDocument,
    removeSupplierDocument,
    getSupplierCategories,
  }
}
