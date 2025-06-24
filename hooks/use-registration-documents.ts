"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"

export interface RegistrationDocument {
  id: string
  bookingId: string
  guestId: string
  hotelId: string
  documentNumber: string
  guestSignature: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  agreements: {
    termsAndConditions: boolean
    privacyPolicy: boolean
    damagePolicy: boolean
    noSmokingPolicy: boolean
  }
  additionalRequests?: string
  checkInDate: string
  staffId: string
  createdAt: string
  updatedAt: string
}

export function useRegistrationDocuments() {
  const [documents, setDocuments] = useState<RegistrationDocument[]>([])
  const { request, isLoading } = useApi()

  // Create a new registration document
  const createRegistrationDocument = async (data: Partial<RegistrationDocument>) => {
    try {
      const response = await request("/registration-documents", "POST", data)
      if (response.data) {
        setDocuments((prev) => [response.data, ...prev])
        toast.success("Registration document created successfully")
        return response.data
      }
      throw new Error("Failed to create registration document")
    } catch (error) {
      toast.error("Failed to create registration document")
      throw error
    }
  }

  // Get registration documents for a hotel
  const getRegistrationDocuments = async (hotelId: string, filters?: any) => {
    try {
      const queryParams = new URLSearchParams()
      if (filters?.startDate) queryParams.append("startDate", filters.startDate)
      if (filters?.endDate) queryParams.append("endDate", filters.endDate)
      if (filters?.guestName) queryParams.append("guestName", filters.guestName)

      const endpoint = `/registration-documents/hotel/${hotelId}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
      const response = await request(endpoint, "GET")

      if (response.data) {
        setDocuments(response.data)
        return response.data
      }
      return []
    } catch (error) {
      toast.error("Failed to fetch registration documents")
      return []
    }
  }

  // Get a specific registration document
  const getRegistrationDocument = async (documentId: string) => {
    try {
      const response = await request(`/registration-documents/${documentId}`, "GET")
      return response.data
    } catch (error) {
      toast.error("Failed to fetch registration document")
      throw error
    }
  }

  // Get registration document by booking ID
  const getRegistrationDocumentByBooking = async (bookingId: string) => {
    try {
      const response = await request(`/registration-documents/booking/${bookingId}`, "GET")
      return response.data
    } catch (error) {
      console.error("Failed to fetch registration document for booking:", error)
      return null
    }
  }

  // Update registration document
  const updateRegistrationDocument = async (documentId: string, updates: Partial<RegistrationDocument>) => {
    try {
      const response = await request(`/registration-documents/${documentId}`, "PUT", updates)
      if (response.data) {
        setDocuments((prev) => prev.map((doc) => (doc.id === documentId ? response.data : doc)))
        toast.success("Registration document updated successfully")
        return response.data
      }
      throw new Error("Failed to update registration document")
    } catch (error) {
      toast.error("Failed to update registration document")
      throw error
    }
  }

  // Generate registration document PDF
  const generateRegistrationDocumentPDF = async (documentId: string) => {
    try {
      const response = await fetch(`/api/registration-documents/${documentId}/pdf`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `registration-document-${documentId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success("PDF downloaded successfully")
    } catch (error) {
      toast.error("Failed to generate PDF")
      throw error
    }
  }

  // Search registration documents
  const searchRegistrationDocuments = async (query: string, hotelId: string) => {
    try {
      const response = await request(
        `/registration-documents/search?q=${encodeURIComponent(query)}&hotelId=${hotelId}`,
        "GET",
      )
      return response.data || []
    } catch (error) {
      toast.error("Failed to search registration documents")
      return []
    }
  }

  return {
    documents,
    isLoading,
    createRegistrationDocument,
    getRegistrationDocuments,
    getRegistrationDocument,
    getRegistrationDocumentByBooking,
    updateRegistrationDocument,
    generateRegistrationDocumentPDF,
    searchRegistrationDocuments,
  }
}
