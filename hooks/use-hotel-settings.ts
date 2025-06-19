"use client"

import { useCallback } from "react"
import { useApi } from "./use-api"

export interface HotelEffectiveConfig {
  effectiveConfiguration: any
  hotelConfiguration: any
  chainConfiguration: any
  inheritanceSettings: any
}

export interface DocumentGenerationData {
  hotelName: string
  hotelLegalName: string
  logo: string
  primaryColor: string
  currency: any
  address: any
  phone: string
  email: string
}

export function useHotelSettings() {
  const { request, isLoading } = useApi()

  // Get effective configuration (resolved with chain inheritance)
  const getEffectiveConfiguration = useCallback(
    async (hotelId: string) => {
      return await request<HotelEffectiveConfig>(`/hotels/${hotelId}/effective-config`)
    },
    [request],
  )

  // Update hotel chain settings
  const updateChainSettings = useCallback(
    async (hotelId: string, settings: any) => {
      return await request(`/hotels/${hotelId}/chain-settings`, "PUT", settings)
    },
    [request],
  )

  // Sync hotel configuration from chain
  const syncFromChain = useCallback(
    async (hotelId: string) => {
      return await request(`/hotels/${hotelId}/sync-from-chain`, "POST")
    },
    [request],
  )

  // Update inheritance settings
  const updateInheritanceSettings = useCallback(
    async (hotelId: string, inheritanceSettings: any) => {
      return await request(`/configuration/${hotelId}/inheritance`, "PUT", { chainInheritance: inheritanceSettings })
    },
    [request],
  )

  // Update branding settings
  const updateBranding = useCallback(
    async (hotelId: string, brandingData: any) => {
      return await request(`/configuration/${hotelId}/branding`, "PUT", brandingData)
    },
    [request],
  )

  // Update banking information
  const updateBanking = useCallback(
    async (hotelId: string, bankingData: any) => {
      return await request(`/configuration/${hotelId}/banking`, "PUT", bankingData)
    },
    [request],
  )

  // Generate document number
  const generateDocumentNumber = useCallback(
    async (hotelId: string, documentType: string) => {
      return await request(`/configuration/${hotelId}/generate-number/${documentType}`, "POST")
    },
    [request],
  )

  // Get document generation data
  const getDocumentData = useCallback(
    async (hotelId: string) => {
      return await request<DocumentGenerationData>(`/configuration/${hotelId}/document-data`)
    },
    [request],
  )

  // Get hotel document settings
  const getDocumentSettings = useCallback(
    async (hotelId: string) => {
      return await request(`/hotels/${hotelId}/document-settings`)
    },
    [request],
  )

  return {
    isLoading,
    getEffectiveConfiguration,
    updateChainSettings,
    syncFromChain,
    updateInheritanceSettings,
    updateBranding,
    updateBanking,
    generateDocumentNumber,
    getDocumentData,
    getDocumentSettings,
  }
}
