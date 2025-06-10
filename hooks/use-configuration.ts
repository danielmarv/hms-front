"use client"

import { useCallback } from "react"
import { useApi } from "./use-api"

export interface HotelConfiguration {
  _id: string
  hotelId: string
  hotelName: string
  legalName: string
  taxId: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  contact: {
    phone: string
    email: string
    website: string
  }
  branding: {
    primaryColor: string
    secondaryColor: string
    logo: string
  }
  documentPrefixes: {
    invoice: string
    receipt: string
    booking: string
    guest: string
  }
  systemSettings: {
    defaultLanguage: string
    dateFormat: string
    timeFormat: string
    currency: string
    timezone: string
  }
  setupCompleted: boolean
  setupStep: number
}

export interface SetupWizard {
  _id: string
  hotelId: string
  steps: {
    step: number
    name: string
    completed: boolean
    completedAt?: string
    data?: any
  }[]
  currentStep: number
  isCompleted: boolean
  completedAt?: string
}

export function useConfiguration() {
  const { request, isLoading } = useApi()

  // Get configuration for a specific hotel
  const getConfiguration = useCallback(
    async (hotelId: string) => {
      return await request<HotelConfiguration>(`/configuration/${hotelId}`)
    },
    [request],
  )

  // Create initial configuration for a hotel
  const createConfiguration = useCallback(
    async (hotelId: string, configData: Partial<HotelConfiguration>) => {
      return await request<HotelConfiguration>(`/configuration/${hotelId}`, "POST", configData)
    },
    [request],
  )

  // Update configuration
  const updateConfiguration = useCallback(
    async (hotelId: string, configData: Partial<HotelConfiguration>) => {
      return await request<HotelConfiguration>(`/configuration/${hotelId}`, "PUT", configData)
    },
    [request],
  )

  // Update setup progress
  const updateSetupProgress = useCallback(
    async (hotelId: string, step: number, data?: any) => {
      return await request<SetupWizard>(`/configuration/${hotelId}/setup/${step}`, "PUT", { data })
    },
    [request],
  )

  // Get setup wizard status
  const getSetupWizardStatus = useCallback(
    async (hotelId: string) => {
      return await request<SetupWizard>(`/configuration/${hotelId}/setup`)
    },
    [request],
  )

  // Generate document number
  const generateDocumentNumber = useCallback(
    async (hotelId: string, documentType: "invoice" | "receipt" | "booking" | "guest") => {
      return await request<{ documentNumber: string }>(`/configuration/${hotelId}/document/${documentType}`, "POST")
    },
    [request],
  )

  return {
    isLoading,
    getConfiguration,
    createConfiguration,
    updateConfiguration,
    updateSetupProgress,
    getSetupWizardStatus,
    generateDocumentNumber,
  }
}
