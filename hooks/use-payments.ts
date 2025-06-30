"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"

export type Payment = {
  _id: string
  receiptNumber: string
  paymentNumber: string  
  guest: {
    _id: string
    full_name: string
    email: string
    phone: string
  }
  invoice?: {
    _id: string
    invoiceNumber: string
    total: number
    status: string
  }
  booking?: {
    _id: string
    confirmation_number: string
    check_in: string
    check_out: string
  }
  order?: {
    _id: string
    orderNumber: string
    totalAmount: number
  }
  amountPaid: number
  method: string
  status: "Pending" | "Completed" | "Failed" | "Refunded" | "Partially Refunded"
  currency: string
  exchangeRate?: number
  transactionReference?: string
  cardDetails?: {
    cardType: string
    last4: string
    expiryMonth: string
    expiryYear: string
    cardholderName: string
  }
  bankDetails?: {
    bankName: string
    accountNumber: string
    routingNumber: string
    accountName: string
  }
  mobileMoneyDetails?: {
    provider: string
    phoneNumber: string
    transactionId: string
  }
  onlinePaymentDetails?: {
    provider: string
    paymentId: string
    payerEmail: string
  }
  notes?: string
  paidAt: string
  isDeposit: boolean
  receiptIssued: boolean
  receiptUrl?: string
  isRefund: boolean
  refundDetails?: {
    amount: number
    reason?: string
    refundedAt: string
    refundedBy: string
    refundReference?: string
  }
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

export type PaymentFilters = {
  guest?: string
  invoice?: string
  booking?: string
  method?: string
  status?: string
  minAmount?: number
  maxAmount?: number
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sort?: string
}

export type PaymentStats = {
  byMethod: Array<{
    _id: string
    count: number
    total: number
  }>
  byStatus: Array<{
    _id: string
    count: number
    total: number
  }>
  daily: Array<{
    _id: string
    count: number
    total: number
  }>
  totals: {
    totalPayments: number
    totalAmount: number
    avgPaymentValue: number
  }
}

export type CreatePaymentData = {
  guest: string
  invoice?: string
  booking?: string
  order?: string
  amountPaid: number
  method: string
  currency: string
  exchangeRate?: number
  transactionReference?: string
  cardDetails?: {
    cardType: string
    last4: string
    expiryMonth: string
    expiryYear: string
    cardholderName: string
  }
  bankDetails?: {
    bankName: string
    accountNumber: string
    routingNumber: string
    accountName: string
  }
  mobileMoneyDetails?: {
    provider: string
    phoneNumber: string
    transactionId: string
  }
  onlinePaymentDetails?: {
    provider: string
    paymentId: string
    payerEmail: string
  }
  notes?: string
  paidAt?: string
  isDeposit?: boolean
  receiptIssued?: boolean
}

export type UpdatePaymentData = {
  method?: string
  transactionReference?: string
  cardDetails?: {
    cardType: string
    last4: string
    expiryMonth: string
    expiryYear: string
    cardholderName: string
  }
  bankDetails?: {
    bankName: string
    accountNumber: string
    routingNumber: string
    accountName: string
  }
  mobileMoneyDetails?: {
    provider: string
    phoneNumber: string
    transactionId: string
  }
  onlinePaymentDetails?: {
    provider: string
    paymentId: string
    payerEmail: string
  }
  notes?: string
  paidAt?: string
  status?: string
}

export type RefundData = {
  amount: number
  reason?: string
  refundReference?: string
}

export type SendReceiptEmailData = {
  email?: string
  message?: string
}

export const usePayments = () => {
  const { request, isLoading } = useApi()
  const [payments, setPayments] = useState<Payment[]>([])
  const [payment, setPayment] = useState<Payment | null>(null)
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    total: 0,
  })

  const getPayments = async (filters: PaymentFilters = {}) => {
    try {
      // Build query string
      const queryParams = new URLSearchParams()
      if (filters.guest) queryParams.append("guest", filters.guest)
      if (filters.invoice) queryParams.append("invoice", filters.invoice)
      if (filters.booking) queryParams.append("booking", filters.booking)
      if (filters.method) queryParams.append("method", filters.method)
      if (filters.status) queryParams.append("status", filters.status)
      if (filters.minAmount) queryParams.append("minAmount", filters.minAmount.toString())
      if (filters.maxAmount) queryParams.append("maxAmount", filters.maxAmount.toString())
      if (filters.startDate) queryParams.append("startDate", filters.startDate)
      if (filters.endDate) queryParams.append("endDate", filters.endDate)
      if (filters.page) queryParams.append("page", filters.page.toString())
      if (filters.limit) queryParams.append("limit", filters.limit.toString())
      if (filters.sort) queryParams.append("sort", filters.sort)

      const response = await request(`/payments?${queryParams.toString()}`)

      if (response) {
        setPayments(response.data || [])
        setPagination({
          page: response.data?.pagination?.page || 1,
          limit: response.data?.pagination?.limit || 20,
          totalPages: response.data?.pagination?.totalPages || 1,
          total: response.data?.pagination?.total || 0,
        })
      }

      return response
    } catch (error) {
      console.error("Error fetching payments:", error)
      return { success: false, message: "Failed to fetch payments" }
    }
  }

  const getPaymentById = async (id: string) => {
    try {
      const response = await request(`/payments/${id}`)

      if (response) {
        setPayment(response.data || null)
      }

      return response
    } catch (error) {
      console.error(`Error fetching payment ${id}:`, error)
      return { success: false, message: "Failed to fetch payment" }
    }
  }

  const createPayment = async (data: CreatePaymentData) => {
    try {
      const response = await request("/payments", "POST", data)

      if (response) {
        toast.success("Payment created successfully")
      }

      return response
    } catch (error) {
      console.error("Error creating payment:", error)
      return { success: false, message: "Failed to create payment" }
    }
  }

  const updatePayment = async (id: string, data: UpdatePaymentData) => {
    try {
      const response = await request(`/payments/${id}`, "PUT", data)

      if (response) {
        toast.success("Payment updated successfully")
        if (payment && payment._id === id) {
          setPayment(response.data || null)
        }
      }

      return response
    } catch (error) {
      console.error(`Error updating payment ${id}:`, error)
      return { success: false, message: "Failed to update payment" }
    }
  }

  const deletePayment = async (id: string) => {
    try {
      const response = await request(`/payments/${id}`, "DELETE")

      if (response) {
        toast.success("Payment deleted successfully")
        // Update local state
        setPayments(payments.filter((payment) => payment._id !== id))
      }

      return response
    } catch (error) {
      console.error(`Error deleting payment ${id}:`, error)
      return { success: false, message: "Failed to delete payment" }
    }
  }

  const processRefund = async (id: string, data: RefundData) => {
    try {
      const response = await request(`/payments/${id}/refund`, "PATCH", data)

      if (response) {
        toast.success("Refund processed successfully")
        // Update local state
        if (payment && payment._id === id) {
          setPayment(response.data || null)
        }
        setPayments(payments.map((p) => (p._id === id ? response.data || p : p)))
      }

      return response
    } catch (error) {
      console.error(`Error processing refund for payment ${id}:`, error)
      return { success: false, message: "Failed to process refund" }
    }
  }

  const issueReceipt = async (id: string) => {
    try {
      const response = await request(`/payments/${id}/receipt`, "PATCH")

      if (response) {
        toast.success("Receipt issued successfully")
        // Update local state if needed
        getPaymentById(id)
      }

      return response
    } catch (error) {
      console.error(`Error issuing receipt for payment ${id}:`, error)
      return { success: false, message: "Failed to issue receipt" }
    }
  }

  const sendReceiptByEmail = async (id: string, data: SendReceiptEmailData) => {
    try {
      const response = await request(`/payments/${id}/email`, "POST", data)

      if (response) {
        toast.success("Receipt sent by email successfully")
      }

      return response
    } catch (error) {
      console.error(`Error sending receipt for payment ${id} by email:`, error)
      return { success: false, message: "Failed to send receipt by email" }
    }
  }

  const getPaymentStats = async (startDate?: string, endDate?: string) => {
    try {
      // Build query string
      const queryParams = new URLSearchParams()
      if (startDate) queryParams.append("startDate", startDate)
      if (endDate) queryParams.append("endDate", endDate)

      const response = await request(`/payments/stats?${queryParams.toString()}`)

      if (response) {
        setStats(response.data || null)
      }

      return response
    } catch (error) {
      console.error("Error fetching payment stats:", error)
      return { success: false, message: "Failed to fetch payment statistics" }
    }
  }

  return {
    payments,
    payment,
    stats,
    pagination,
    isLoading,
    getPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    processRefund,
    issueReceipt,
    sendReceiptByEmail,
    getPaymentStats,
  }
}
