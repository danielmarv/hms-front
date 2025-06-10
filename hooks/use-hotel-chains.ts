"use client"

import { useCallback } from "react"
import { useApi } from "./use-api"

export interface HotelChain {
  _id: string
  name: string
  chainCode: string
  code: string
  description: string
  type: string
  starRating: number
  active: boolean
  createdAt: string
  updatedAt: string
  hotels?: Hotel[]
  headquarters?: Hotel
  hotelCount?: number
  sharedConfiguration?: SharedConfiguration
  hierarchy?: any
}

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
}

export interface ChainUser {
  user: {
    id: string
    full_name: string
    email: string
  }
  hotelAccess: {
    accessLevel: string
  }[]
}

export interface SharedConfiguration {
  chainCode: string
  name: string
  branding: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    font: {
      primary: string
      secondary: string
    }
  }
  documentPrefixes: {
    invoice: {
      prefix: string
      startingNumber: number
      format: string
    }
    receipt: {
      prefix: string
      startingNumber: number
      format: string
    }
    booking: {
      prefix: string
      startingNumber: number
      format: string
    }
    guest: {
      prefix: string
      startingNumber: number
      format: string
    }
  }
  systemSettings: {
    dateFormat: string
    timeFormat: string
    currency: {
      code: string
      symbol: string
      position: string
    }
    timezone: string
    language: string
    measurementSystem: string
  }
  overrideSettings: {
    branding: boolean
    documentPrefixes: boolean
    systemSettings: boolean
  }
}

export interface SyncLog {
  _id: string
  chainCode: string
  syncType: string
  status: string
  startTime: string
  endTime: string
  initiatedBy: {
    _id: string
    full_name: string
  }
  sourceHotel: {
    _id: string
    name: string
    code: string
  }
  details: {
    success: number
    failed: number
    skipped: number
  }
  targetHotels?: {
    _id: string
    name: string
    code: string
    status: string
  }[]
  configSections?: string[]
}

export function useHotelChains() {
  const { request, isLoading } = useApi()

  // Get all hotel chains
  const getAllChains = useCallback(
    async (page = 1, limit = 10) => {
      return await request<{ data: HotelChain[]; pagination: any; total: number }>(
        `/chains?page=${page}&limit=${limit}`,
      )
    },
    [request],
  )

  // Get specific chain details
  const getChainDetails = useCallback(
    async (chainCode: string) => {
      return await request<HotelChain>(`/chains/${chainCode}`)
    },
    [request],
  )

  // Create a new hotel chain
  const createChain = useCallback(
    async (chainData: Partial<HotelChain>) => {
      return await request<HotelChain>("/chains", "POST", chainData)
    },
    [request],
  )

  // Update a hotel chain
  const updateChain = useCallback(
    async (chainCode: string, chainData: Partial<HotelChain>) => {
      return await request<HotelChain>(`/chains/${chainCode}`, "PUT", chainData)
    },
    [request],
  )

  // Delete a hotel chain
  const deleteChain = useCallback(
    async (chainCode: string) => {
      return await request<{ success: boolean; message: string }>(`/chains/${chainCode}`, "DELETE")
    },
    [request],
  )

  // Get chain statistics
  const getChainStatistics = useCallback(
    async (chainCode: string) => {
      return await request<any>(`/chains/${chainCode}/statistics`)
    },
    [request],
  )

  // Add hotel to chain
  const addHotelToChain = useCallback(
    async (chainCode: string, hotelData: Partial<Hotel>) => {
      return await request<Hotel>(`/chains/${chainCode}/hotels`, "POST", hotelData)
    },
    [request],
  )

  // Remove hotel from chain
  const removeHotelFromChain = useCallback(
    async (chainCode: string, hotelId: string) => {
      return await request<{ success: boolean; message: string }>(
        `/chains/${chainCode}/hotels/${hotelId}`,
        "DELETE",
      )
    },
    [request],
  )

  // Get users with access across multiple hotels in the chain
  const getCrossHotelUsers = useCallback(
    async (chainCode: string) => {
      return await request<ChainUser[]>(`/chains/${chainCode}/users`)
    },
    [request],
  )

  // Grant access to a user across all hotels in the chain
  const grantChainAccess = useCallback(
    async (chainCode: string, accessData: { userId: string; accessLevel: string }) => {
      return await request<{ hotelCount: number }>(`/chains/${chainCode}/users`, "POST", accessData)
    },
    [request],
  )

  // Revoke a user's access across all hotels in the chain
  const revokeChainAccess = useCallback(
    async (chainCode: string, userId: string) => {
      return await request<{ hotelsAffected: number }>(`/chains/${chainCode}/users/${userId}`, "DELETE")
    },
    [request],
  )

  // Get synchronization logs for a chain
  const getSyncLogs = useCallback(
    async (chainCode: string, page = 1, limit = 10) => {
      return await request<{ data: SyncLog[]; pagination: any; total: number }>(
        `/hotel-chains/${chainCode}/sync-logs?page=${page}&limit=${limit}`,
      )
    },
    [request],
  )

  // Get details of a specific sync log
  const getSyncLogDetails = useCallback(
    async (logId: string) => {
      return await request<SyncLog>(`/sync-logs/${logId}`)
    },
    [request],
  )

  // Update shared configuration for a chain
  const updateSharedConfiguration = useCallback(
    async (chainCode: string, configData: Partial<SharedConfiguration>) => {
      return await request<SharedConfiguration>(`/chains/${chainCode}/configuration`, "PUT", configData)
    },
    [request],
  )

  // Get shared configuration for a chain
  const getSharedConfiguration = useCallback(
    async (chainCode: string) => {
      return await request<SharedConfiguration>(`/chains/${chainCode}/configuration`)
    },
    [request],
  )

  // Synchronize configuration across hotels in a chain
  const syncChainConfiguration = useCallback(
    async (
      chainCode: string,
      syncData: {
        syncAll: boolean
        targetHotels: string[]
        configSections: string[]
      },
    ) => {
      return await request<{ syncLog: SyncLog }>(`/hotel-chains/${chainCode}/sync`, "POST", syncData)
    },
    [request],
  )

  return {
    isLoading,
    getAllChains,
    getChainDetails,
    createChain,
    updateChain,
    deleteChain,
    getChainStatistics,
    addHotelToChain,
    removeHotelFromChain,
    getCrossHotelUsers,
    grantChainAccess,
    revokeChainAccess,
    getSyncLogs,
    getSyncLogDetails,
    getSharedConfiguration,
    updateSharedConfiguration,
    syncChainConfiguration,
  }
}
