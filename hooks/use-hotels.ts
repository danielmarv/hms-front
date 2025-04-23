"use client"

import { useCallback } from "react"
import { useApi } from "./use-api"

export interface Hotel {
  _id: string
  name: string
  code: string
  description: string
  type: string
  starRating: number
  parentHotel?: string
  isHeadquarters: boolean
  chainCode?: string
  parentCompany?: string
  active: boolean
  createdAt: string
  updatedAt: string
  branches?: Hotel[]
}

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

export interface DashboardStats {
  totalHotels: number
  activeHotels: number
  pendingSetup: number
  totalUsers: number
}

export function useHotels() {
  const { request, isLoading } = useApi()

  const getAllHotels = useCallback(
    async (params?: {
      type?: string
      active?: boolean
      parentHotel?: string
      isHeadquarters?: boolean
      chainCode?: string
      parentCompany?: string
      showBranches?: boolean
      page?: number
      limit?: number
    }) => {
      // Build query string
      const queryParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(key, String(value))
          }
        })
      }

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
      return await request<{ data: Hotel[]; count: number; total: number; pagination: any }>(`/hotels${queryString}`)
    },
    [request],
  )

  const getHotelById = useCallback(
    async (id: string, includeBranches = false, includeHierarchy = false) => {
      const queryParams = new URLSearchParams()
      if (includeBranches) {
        queryParams.append("includeBranches", "true")
      }
      if (includeHierarchy) {
        queryParams.append("includeHierarchy", "true")
      }

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
      return await request<{ data: Hotel; hierarchy?: any }>(`/hotels/${id}${queryString}`)
    },
    [request],
  )

  const createHotel = useCallback(
    async (hotelData: Partial<Hotel>) => {
      return await request<Hotel>("/hotels", "POST", hotelData)
    },
    [request],
  )

  const updateHotel = useCallback(
    async (id: string, hotelData: Partial<Hotel>) => {
      return await request<Hotel>(`/hotels/${id}`, "PUT", hotelData)
    },
    [request],
  )

  const deleteHotel = useCallback(
    async (id: string) => {
      return await request<{}>(`/hotels/${id}`, "DELETE")
    },
    [request],
  )

  const getConfiguration = useCallback(
    async (hotelId: string) => {
      return await request<HotelConfiguration>(`/configuration/${hotelId}`)
    },
    [request],
  )

  const updateConfiguration = useCallback(
    async (hotelId: string, configData: Partial<HotelConfiguration>) => {
      return await request<HotelConfiguration>(`/configuration/${hotelId}`, "PUT", configData)
    },
    [request],
  )

  const initializeHotelSetup = useCallback(
    async (hotelId: string) => {
      return await request<{ hotel: Hotel; configuration: HotelConfiguration; setupWizard: SetupWizard }>(
        `/hotels/${hotelId}/setup/initialize`,
        "POST",
      )
    },
    [request],
  )

  const getHotelSetupStatus = useCallback(
    async (hotelId: string) => {
      return await request<{
        setupInitiated: boolean
        setupCompleted: boolean
        currentStep: number
        steps: SetupWizard["steps"]
      }>(`/hotels/${hotelId}/setup/status`)
    },
    [request],
  )

  const updateSetupProgress = useCallback(
    async (hotelId: string, step: number, data?: any) => {
      return await request<SetupWizard>(`/configuration/${hotelId}/setup/${step}`, "PUT", { data })
    },
    [request],
  )

  const getDashboardStats = useCallback(async () => {
    return await request<DashboardStats>("/dashboard/stats")
  }, [request])

  return {
    isLoading,
    getAllHotels,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel,
    getConfiguration,
    updateConfiguration,
    initializeHotelSetup,
    getHotelSetupStatus,
    updateSetupProgress,
    getDashboardStats,
  }
}
