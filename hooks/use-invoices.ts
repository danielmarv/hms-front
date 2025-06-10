"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"

export type Invoice = {
  _id: string
  invoiceNumber: string
  guest: {
    _id: string
    full_name: string
    email: string
    phone: string
    address?: string
  }
  booking?: {
    _id: string
    confirmation_number: string
    check_in: string
    check_out: string
    room?: string
  }
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
    taxable: boolean
  }>
  taxes: Array<{
    name: string
    rate: number
    amount: number
  }>
  discounts: Array<{
    name: string
    type: "percentage" | "fixed"
    value: number
    amount: number
  }>
  subtotal: number
  taxTotal: number
  discountTotal: number
  total: number
  amountPaid: number
  balance: number
  currency: string
  status: "Draft" | "Issued" | "Partially Paid" | "Paid" | "Cancelled" | "Overdue"
  issuedDate?: string
  dueDate: string
  notes?: string
  paymentTerms?: string
  paymentInstructions?: string
  billingAddress?: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  isBillingAddressSameAsGuest: boolean
  isCompanyBilling: boolean
  companyDetails?: {
    name: string
    taxId: string
    contactPerson: string
    email: string
    phone: string
  }
  emailSent: boolean
  emailSentDate?: string
  createdBy: {
    _id: string
    full_name: string
  }
  updatedBy: {
    _id: string
    full_name: string
  }
  createdAt: string
  updatedAt: string
}

export type InvoiceFilters = {
  guest?: string
  booking?: string
  status?: string
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sort?: string
}

export type InvoiceStats = {
  byStatus: Array<{
    _id: string
    count: number
    total: number
    paid: number
    outstanding: number
  }>
  daily: Array<{
    _id: string
    count: number
    total: number
    paid: number
    outstanding: number
  }>
  totals: {
    totalInvoices: number
    totalAmount: number
    totalPaid: number
    totalOutstanding: number
    avgInvoiceValue: number
  }
}

export type CreateInvoiceData = {
  guest: string
  booking?: string
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
    taxable: boolean
  }>
  taxes: Array<{
    name: string
    rate: number
    amount: number
  }>
  discounts: Array<{
    name: string
    type: "percentage" | "fixed"
    value: number
    amount: number
  }>
  subtotal: number
  taxTotal: number
  discountTotal: number
  total: number
  currency: string
  status: "Draft" | "Issued"
  dueDate: string
  notes?: string
  paymentTerms?: string
  paymentInstructions?: string
  billingAddress?: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  isBillingAddressSameAsGuest: boolean
  isCompanyBilling: boolean
  companyDetails?: {
    name: string
    taxId: string
    contactPerson: string
    email: string
    phone: string
  }
}

export type UpdateInvoiceData = Partial<CreateInvoiceData> & {
  amountPaid?: number
}

export type RecordPaymentData = {
  amountPaid: number
  paymentMethod: string
  paymentDate?: string
  reference?: string
}

export type SendInvoiceEmailData = {
  email?: string
  message?: string
}

export const useInvoices = () => {
  const { request, isLoading } = useApi()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [stats, setStats] = useState<InvoiceStats | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    total: 0,
  })

  const getInvoices = async (filters: InvoiceFilters = {}) => {
    try {
      // Build query string
      const queryParams = new URLSearchParams()
      if (filters.guest) queryParams.append("guest", filters.guest)
      if (filters.booking) queryParams.append("booking", filters.booking)
      if (filters.status) queryParams.append("status", filters.status)
      if (filters.minAmount) queryParams.append("minAmount", filters.minAmount.toString())
      if (filters.maxAmount) queryParams.append("maxAmount", filters.maxAmount.toString())
      if (filters.startDate) queryParams.append("startDate", filters.startDate)
      if (filters.endDate) queryParams.append("endDate", filters.endDate)
      if (filters.page) queryParams.append("page", filters.page.toString())
      if (filters.limit) queryParams.append("limit", filters.limit.toString())
      if (filters.sort) queryParams.append("sort", filters.sort)

      const response = await request<Invoice[]>(`/invoices?${queryParams.toString()}`)

      if (response.success) {
        setInvoices(response.data || [])
        setPagination({
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 20,
          totalPages: response.pagination?.totalPages || 1,
          total: response.total || 0,
        })
      }

      return response
    } catch (error) {
      console.error("Error fetching invoices:", error)
      return { success: false, message: "Failed to fetch invoices" }
    }
  }

  const getInvoiceById = async (id: string) => {
    try {
      const response = await request<Invoice>(`/invoices/${id}`)

      if (response.success) {
        setInvoice(response.data || null)
      }

      return response
    } catch (error) {
      console.error(`Error fetching invoice ${id}:`, error)
      return { success: false, message: "Failed to fetch invoice" }
    }
  }

  const createInvoice = async (data: CreateInvoiceData) => {
    try {
      const response = await request<Invoice>("/invoices", "POST", data)

      if (response.success) {
        toast.success("Invoice created successfully")
      }

      return response
    } catch (error) {
      console.error("Error creating invoice:", error)
      return { success: false, message: "Failed to create invoice" }
    }
  }

  const updateInvoice = async (id: string, data: UpdateInvoiceData) => {
    try {
      const response = await request<Invoice>(`/invoices/${id}`, "PUT", data)

      if (response.success) {
        toast.success("Invoice updated successfully")
        if (invoice && invoice._id === id) {
          setInvoice(response.data || null)
        }
      }

      return response
    } catch (error) {
      console.error(`Error updating invoice ${id}:`, error)
      return { success: false, message: "Failed to update invoice" }
    }
  }

  const deleteInvoice = async (id: string) => {
    try {
      const response = await request<{ message: string }>(`/invoices/${id}`, "DELETE")

      if (response.success) {
        toast.success("Invoice deleted successfully")
        // Update local state
        setInvoices(invoices.filter((invoice) => invoice._id !== id))
      }

      return response
    } catch (error) {
      console.error(`Error deleting invoice ${id}:`, error)
      return { success: false, message: "Failed to delete invoice" }
    }
  }

  const issueInvoice = async (id: string) => {
    try {
      const response = await request<Invoice>(`/invoices/${id}/issue`, "PATCH")

      if (response.success) {
        toast.success("Invoice issued successfully")
        // Update local state
        if (invoice && invoice._id === id) {
          setInvoice(response.data || null)
        }
        setInvoices(invoices.map((inv) => (inv._id === id ? response.data || inv : inv)))
      }

      return response
    } catch (error) {
      console.error(`Error issuing invoice ${id}:`, error)
      return { success: false, message: "Failed to issue invoice" }
    }
  }

  const cancelInvoice = async (id: string, reason?: string) => {
    try {
      const response = await request<Invoice>(`/invoices/${id}/cancel`, "PATCH", { reason })

      if (response.success) {
        toast.success("Invoice cancelled successfully")
        // Update local state
        if (invoice && invoice._id === id) {
          setInvoice(response.data || null)
        }
        setInvoices(invoices.map((inv) => (inv._id === id ? response.data || inv : inv)))
      }

      return response
    } catch (error) {
      console.error(`Error cancelling invoice ${id}:`, error)
      return { success: false, message: "Failed to cancel invoice" }
    }
  }

  const recordPayment = async (id: string, data: RecordPaymentData) => {
    try {
      const response = await request<Invoice>(`/invoices/${id}/payment`, "PATCH", data)

      if (response.success) {
        toast.success("Payment recorded successfully")
        // Update local state
        if (invoice && invoice._id === id) {
          setInvoice(response.data || null)
        }
        setInvoices(invoices.map((inv) => (inv._id === id ? response.data || inv : inv)))
      }

      return response
    } catch (error) {
      console.error(`Error recording payment for invoice ${id}:`, error)
      return { success: false, message: "Failed to record payment" }
    }
  }

  const sendInvoiceByEmail = async (id: string, data: SendInvoiceEmailData) => {
    try {
      const response = await request<{ message: string }>(`/invoices/${id}/email`, "POST", data)

      if (response.success) {
        toast.success("Invoice sent by email successfully")
      }

      return response
    } catch (error) {
      console.error(`Error sending invoice ${id} by email:`, error)
      return { success: false, message: "Failed to send invoice by email" }
    }
  }

  const getInvoiceStats = async (startDate?: string, endDate?: string) => {
    try {
      // Build query string
      const queryParams = new URLSearchParams()
      if (startDate) queryParams.append("startDate", startDate)
      if (endDate) queryParams.append("endDate", endDate)

      const response = await request<InvoiceStats>(`/invoices/stats?${queryParams.toString()}`)

      if (response.success) {
        setStats(response.data || null)
      }

      return response
    } catch (error) {
      console.error("Error fetching invoice stats:", error)
      return { success: false, message: "Failed to fetch invoice statistics" }
    }
  }

  return {
    invoices,
    invoice,
    stats,
    pagination,
    isLoading,
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    issueInvoice,
    cancelInvoice,
    recordPayment,
    sendInvoiceByEmail,
    getInvoiceStats,
  }
}
