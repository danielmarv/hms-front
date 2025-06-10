"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"

export interface QuotationItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Quotation {
  id: string
  quotationNumber: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAddress: string
  items: QuotationItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  currency: string
  validUntil: string
  status: "draft" | "sent" | "accepted" | "rejected" | "expired"
  notes?: string
  terms?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export function useQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const { get, post, put, remove, isLoading } = useApi()

  // Get all quotations from server
  const getQuotations = async (filters?: {
    status?: string
    clientName?: string
    dateFrom?: string
    dateTo?: string
  }) => {
    try {
      const queryParams = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value)
        })
      }

      const url = `/quotations${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
      const response = await get(url)

      if (response && Array.isArray(response)) {
        setQuotations(response)
        return response
      }
      return []
    } catch (error) {
      toast.error("Failed to fetch quotations")
      return []
    }
  }

  // Get single quotation by ID
  const getQuotation = async (id: string) => {
    try {
      const response = await get(`/quotations/${id}`)
      return response
    } catch (error) {
      toast.error("Failed to fetch quotation")
      return null
    }
  }

  // Create new quotation
  const createQuotation = async (quotation: Omit<Quotation, "id" | "quotationNumber" | "createdAt" | "updatedAt">) => {
    try {
      const response = await post("/quotations", quotation)
      if (response) {
        await getQuotations() // Refresh list
        toast.success("Quotation created successfully")
        return response
      }
    } catch (error) {
      toast.error("Failed to create quotation")
      throw error
    }
  }

  // Update quotation
  const updateQuotation = async (id: string, updates: Partial<Quotation>) => {
    try {
      const response = await put(`/quotations/${id}`, updates)
      if (response) {
        await getQuotations() // Refresh list
        toast.success("Quotation updated successfully")
        return response
      }
    } catch (error) {
      toast.error("Failed to update quotation")
      throw error
    }
  }

  // Delete quotation
  const deleteQuotation = async (id: string) => {
    try {
      await remove(`/quotations/${id}`)
      await getQuotations() // Refresh list
      toast.success("Quotation deleted successfully")
    } catch (error) {
      toast.error("Failed to delete quotation")
      throw error
    }
  }

  // Update quotation status
  const updateQuotationStatus = async (id: string, status: Quotation["status"]) => {
    try {
      const response = await put(`/quotations/${id}/status`, { status })
      if (response) {
        await getQuotations() // Refresh list
        toast.success(`Quotation ${status} successfully`)
        return response
      }
    } catch (error) {
      toast.error("Failed to update quotation status")
      throw error
    }
  }

  // Generate PDF for quotation
  const generateQuotationPDF = async (id: string) => {
    try {
      const response = await get(`/quotations/${id}/pdf`, {
        responseType: "blob",
      })

      if (response) {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `quotation-${id}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        toast.success("PDF generated successfully")
      }
    } catch (error) {
      toast.error("Failed to generate PDF")
      throw error
    }
  }

  // Send quotation via email
  const sendQuotation = async (
    id: string,
    emailData: {
      to: string
      subject: string
      message: string
    },
  ) => {
    try {
      const response = await post(`/quotations/${id}/send`, emailData)
      if (response) {
        await updateQuotationStatus(id, "sent")
        toast.success("Quotation sent successfully")
        return response
      }
    } catch (error) {
      toast.error("Failed to send quotation")
      throw error
    }
  }

  // Calculate quotation totals
  const calculateTotals = (items: QuotationItem[], taxRate = 0, discountRate = 0) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const discountAmount = subtotal * (discountRate / 100)
    const taxableAmount = subtotal - discountAmount
    const taxAmount = taxableAmount * (taxRate / 100)
    const totalAmount = taxableAmount + taxAmount

    return {
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
    }
  }

  return {
    quotations,
    isLoading,
    getQuotations,
    getQuotation,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    updateQuotationStatus,
    generateQuotationPDF,
    sendQuotation,
    calculateTotals,
  }
}
