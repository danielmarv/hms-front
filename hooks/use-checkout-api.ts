"use client"
import { useApi } from "./use-api"
import { toast } from "sonner"

export interface CheckOutData {
  additional_charges?: Array<{
    description: string
    amount: number
    category: string
  }>
  discounts?: Array<{
    description: string
    amount: number
    type: "fixed" | "percentage"
  }>
  payment_method?: string
  payment_amount?: number
  notes?: string
}

export function useCheckOutApi() {
  const { request, isLoading } = useApi()

  // Check-out a guest
  const checkOutGuest = async (checkInId: string, checkOutData: CheckOutData) => {
    try {
      const response = await request(`/check-ins/${checkInId}/checkout`, "PATCH", checkOutData)

      if (response.data) {
        toast.success("Guest checked out successfully!")
        return response.data
      }
      throw new Error("Failed to check out guest")
    } catch (error) {
      console.error("Check-out error:", error)
      toast.error("Failed to check out guest")
      throw error
    }
  }

  // Add charges to check-in
  const addCharges = async (
    checkInId: string,
    charges: Array<{
      description: string
      amount: number
      category: string
    }>,
  ) => {
    try {
      const response = await request(`/check-ins/${checkInId}/charges`, "POST", { charges })
      if (response.data) {
        toast.success("Charges added successfully!")
        return response.data
      }
      throw new Error("Failed to add charges")
    } catch (error) {
      toast.error("Failed to add charges")
      throw error
    }
  }

  // Add discount to check-in
  const addDiscount = async (
    checkInId: string,
    discount: {
      description: string
      amount: number
      type: "fixed" | "percentage"
    },
  ) => {
    try {
      const response = await request(`/check-ins/${checkInId}/discount`, "POST", discount)
      if (response.data) {
        toast.success("Discount added successfully!")
        return response.data
      }
      throw new Error("Failed to add discount")
    } catch (error) {
      toast.error("Failed to add discount")
      throw error
    }
  }

  // Get guest folio
  const getGuestFolio = async (checkInId: string) => {
    try {
      const response = await request(`/check-ins/${checkInId}/folio`, "GET")
      return response.data
    } catch (error) {
      toast.error("Failed to fetch guest folio")
      throw error
    }
  }

  return {
    checkOutGuest,
    addCharges,
    addDiscount,
    getGuestFolio,
    isLoading,
  }
}
