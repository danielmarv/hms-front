"use client"

import { useCallback } from "react"
import { useApi } from "./use-api"

export interface HotelSettings {
  _id: string
  hotel: string
  name: string
  legal_name: string
  tax_id: string
  contact: {
    address: {
      street: string
      city: string
      state: string
      postal_code: string
      country: string
    }
    phone: {
      primary: string
      secondary?: string
    }
    email: {
      primary: string
      secondary?: string
      support?: string
    }
    website?: string
  }
  branding: {
    primary_color: string
    secondary_color: string
    accent_color: string
    logo_url?: string
    favicon_url?: string
  }
  financial: {
    currency: {
      code: string
      symbol: string
      position: "before" | "after"
    }
    document_prefixes: {
      invoice: string
      receipt: string
      quotation: string
      folio: string
    }
  }
  operational: {
    check_in_time: string
    check_out_time: string
    time_zone: string
    date_format: string
    time_format: string
    cancellation_policy: string
  }
  features: {
    online_booking: boolean
    mobile_checkin: boolean
    keyless_entry: boolean
    loyalty_program: boolean
    multi_language: boolean
    payment_gateway: boolean
  }
  notifications: {
    email_notifications: boolean
    sms_notifications: boolean
    push_notifications: boolean
    booking_confirmations: boolean
    payment_reminders: boolean
    marketing_emails: boolean
  }
  banking: {
    primary_account: {
      bank_name: string
      account_name: string
      account_number: string
      routing_number: string
    }
    payment_methods: {
      accepted_cards: string[]
      online_payments: boolean
      cash_payments: boolean
      bank_transfers: boolean
    }
  }
  chainInheritance?: {
    branding: boolean
    financial: boolean
    operational: boolean
    features: boolean
    notifications: boolean
    document_templates: boolean
  }
}

export interface SetupStatus {
  setupInitiated: boolean
  setupCompleted: boolean
  currentStep: number
  steps?: Array<{
    step: number
    name: string
    completed: boolean
  }>
}

export interface SetupInitialization {
  hotel: any
  configuration: HotelSettings
  setupWizard: any
  sharedConfigurationApplied: boolean
  sharedConfiguration?: any
}

export function useHotelSettings() {
  const { request, isLoading } = useApi()

  // Get hotel configuration - matches GET /configuration/:hotelId
  const getHotelConfiguration = useCallback(
    async (hotelId: string) => {
      return await request<{
        configuration: HotelSettings
        effectiveConfiguration: HotelSettings
      }>(`/configuration/${hotelId}`)
    },
    [request],
  )

  // Create hotel configuration - matches POST /configuration/
  const createConfiguration = useCallback(
    async (configData: Partial<HotelSettings>) => {
      return await request<HotelSettings>(`/configuration`, "POST", configData)
    },
    [request],
  )

  // Update hotel configuration - matches PUT /configuration/:hotelId
  const updateHotelConfiguration = useCallback(
    async (hotelId: string, configData: Partial<HotelSettings>) => {
      return await request<HotelSettings>(`/configuration/${hotelId}`, "PUT", configData)
    },
    [request],
  )

  // Get effective configuration - matches GET /hotels/:id/effective-config
  const getEffectiveConfiguration = useCallback(
    async (hotelId: string) => {
      return await request<{
        effectiveConfiguration: HotelSettings
        hotelConfiguration: HotelSettings
        chainConfiguration: any
        inheritanceSettings: any
      }>(`/hotels/${hotelId}/effective-config`)
    },
    [request],
  )

  // Update branding - matches PUT /configuration/:hotelId/branding
  const updateBranding = useCallback(
    async (hotelId: string, branding: Partial<HotelSettings["branding"]>) => {
      return await request<{ branding: HotelSettings["branding"] }>(
        `/configuration/${hotelId}/branding`,
        "PUT",
        branding,
      )
    },
    [request],
  )

  // Update banking - matches PUT /configuration/:hotelId/banking
  const updateBanking = useCallback(
    async (hotelId: string, banking: Partial<HotelSettings["banking"]>) => {
      return await request<{ banking: HotelSettings["banking"] }>(`/configuration/${hotelId}/banking`, "PUT", banking)
    },
    [request],
  )

  // Update inheritance settings - matches PUT /configuration/:hotelId/inheritance
  const updateInheritanceSettings = useCallback(
    async (hotelId: string, inheritanceSettings: any) => {
      return await request<HotelSettings>(`/configuration/${hotelId}/inheritance`, "PUT", {
        chainInheritance: inheritanceSettings,
      })
    },
    [request],
  )

  // Sync from chain - matches POST /hotels/:id/sync-from-chain
  const syncFromChain = useCallback(
    async (hotelId: string, sections?: string[]) => {
      return await request<{
        configuration: HotelSettings
        syncResults: any
        chainConfiguration: any
      }>(`/hotels/${hotelId}/sync-from-chain`, "POST", { sections })
    },
    [request],
  )

  // Generate document number - matches POST /configuration/:hotelId/generate-number/:documentType
  const generateDocumentNumber = useCallback(
    async (hotelId: string, documentType: string) => {
      return await request<{
        documentNumber: string
        documentType: string
      }>(`/configuration/${hotelId}/generate-number/${documentType}`, "POST")
    },
    [request],
  )

  // Get document data - matches GET /configuration/:hotelId/document-data
  const getDocumentData = useCallback(
    async (hotelId: string) => {
      return await request(`/configuration/${hotelId}/document-data`)
    },
    [request],
  )

  // Get hotel document settings - matches GET /hotels/:id/document-settings
  const getHotelDocumentSettings = useCallback(
    async (hotelId: string) => {
      return await request(`/hotels/${hotelId}/document-settings`)
    },
    [request],
  )

  // Update hotel chain settings - matches PUT /hotels/:id/chain-settings
  const updateChainSettings = useCallback(
    async (hotelId: string, settings: any) => {
      return await request(`/hotels/${hotelId}/chain-settings`, "PUT", settings)
    },
    [request],
  )

  // Initialize hotel setup - matches POST /hotels/:id/setup/initialize
  const initializeHotelSetup = useCallback(
    async (hotelId: string) => {
      return await request<SetupInitialization>(`/hotels/${hotelId}/setup/initialize`, "POST")
    },
    [request],
  )

  // Get hotel setup status - matches GET /hotels/:id/setup/status
  const getHotelSetupStatus = useCallback(
    async (hotelId: string) => {
      return await request<SetupStatus>(`/hotels/${hotelId}/setup/status`)
    },
    [request],
  )

  return {
    isLoading,
    // Configuration management
    getHotelConfiguration,
    createConfiguration,
    updateHotelConfiguration,
    getEffectiveConfiguration,

    // Specific updates
    updateBranding,
    updateBanking,
    updateInheritanceSettings,

    // Chain management
    syncFromChain,
    updateChainSettings,

    // Document management
    generateDocumentNumber,
    getDocumentData,
    getHotelDocumentSettings,

    // Setup management
    initializeHotelSetup,
    getHotelSetupStatus,
  }
}
