"use client"

import { useCallback } from "react"
import { useApi } from "./use-api"

export interface HotelConfiguration {
  _id: string
  hotel: string
  name: string
  legal_name: string
  tax_id: string
  contact: any
  branding: any
  financial: any
  operational: any
  features: any
  notifications: any
  banking: any
  chainInheritance?: any
}

export function useConfiguration() {
  const { request, isLoading } = useApi()

  // Get hotel configuration
  const getConfiguration = useCallback(
    async (hotelId: string) => {
      return await request<HotelConfiguration>(`/configuration/${hotelId}`)
    },
    [request],
  )

  // Create hotel configuration
  const createConfiguration = useCallback(
    async (configData: Partial<HotelConfiguration>) => {
      return await request<HotelConfiguration>("/configuration", "POST", configData)
    },
    [request],
  )

  // Update hotel configuration
  const updateConfiguration = useCallback(
    async (hotelId: string, configData: Partial<HotelConfiguration>) => {
      return await request<HotelConfiguration>(`/configuration/${hotelId}`, "PUT", configData)
    },
    [request],
  )

  return {
    isLoading,
    getConfiguration,
    createConfiguration,
    updateConfiguration,
  }
}
