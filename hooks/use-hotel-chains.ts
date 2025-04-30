"use client"

import { useCallback } from "react"
import { useApi } from "./use-api"

export interface HotelChain {
  _id: string
  chainCode: string
  name: string
  code: string
  description: string
  type: string
  starRating: number
  active: boolean
  hotelCount?: number
  headquarters?: {
    _id: string
    name: string
    code: string
    location: string
  }
  hotels?: Hotel[]
  sharedConfiguration?: SharedConfiguration
  hierarchy?: ChainHierarchy
  stats?: {
    totalHotels: number
    activeHotels: number
    totalRooms: number
    totalUsers: number
  }
}

export interface Hotel {
  _id: string
  name: string
  code: string
  description?: string
  type: string
  starRating?: number
  parentHotel?: string
  isHeadquarters: boolean
  chainCode?: string
  parentCompany?: string
  active: boolean
  createdAt?: string
  updatedAt?: string
  branches?: Hotel[]
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
    logo?: string
  }
  documentPrefixes: {
    invoice: DocumentPrefix
    receipt: DocumentPrefix
    booking: DocumentPrefix
    guest: DocumentPrefix
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

export interface DocumentPrefix {
  prefix: string
  startingNumber: number
  format: string
}

export interface ChainHierarchy {
  id: string
  name: string
  code: string
  type: string
  isHeadquarters: boolean
  children: ChainHierarchyNode[]
}

export interface ChainHierarchyNode {
  id: string
  name: string
  code: string
  type: string
  children: ChainHierarchyNode[]
}

export interface SyncLog {
  _id: string
  chainCode: string
  syncType: string
  sourceHotel: {
    _id: string
    name: string
    code: string
  }
  targetHotels: {
    _id: string
    name: string
    code: string
  }[]
  status: string
  startTime: string
  endTime?: string
  initiatedBy: {
    _id: string
    full_name: string
    email: string
  }
  details: {
    success: number
    failed: number
    skipped: number
  }
  errors?: {
    hotelId: {
      _id: string
      name: string
      code: string
    }
    error: string
  }[]
}

export interface ChainUser {
  user: {
    id: string
    full_name: string
    email: string
    status: string
  }
  hotelAccess: {
    hotel: {
      _id: string
      name: string
      code: string
    }
    accessLevel: string
    accessAllBranches: boolean
  }[]
}

export function useHotelChains() {
  const { request, isLoading } = useApi()

  // Get all hotel chains
  const getAllChains = useCallback(async () => {
    return await request<HotelChain[]>("/chains")
  }, [request])

  // Get hotel chain details
  const getChainDetails = useCallback(
    async (chainCode: string) => {
      return await request<HotelChain>(`/chains/${chainCode}`)
    },
    [request],
  )

  // Create a new hotel chain
  const createChain = useCallback(
    async (chainData: {
      name: string
      code: string
      description?: string
      chainCode: string
      type?: string
      starRating?: number
    }) => {
      return await request<{ headquarters: Hotel; sharedConfiguration: SharedConfiguration }>(
        "/chains",
        "POST",
        chainData,
      )
    },
    [request],
  )

  // Update shared configuration
  const updateSharedConfiguration = useCallback(
    async (
      chainCode: string,
      configData: {
        branding?: Partial<SharedConfiguration["branding"]>
        documentPrefixes?: Partial<SharedConfiguration["documentPrefixes"]>
        systemSettings?: Partial<SharedConfiguration["systemSettings"]>
        overrideSettings?: Partial<SharedConfiguration["overrideSettings"]>
      },
    ) => {
      return await request<SharedConfiguration>(`/chains/${chainCode}/configuration`, "PUT", configData)
    },
    [request],
  )

  // Add a hotel to a chain
  const addHotelToChain = useCallback(
    async (
      chainCode: string,
      hotelData: {
        name: string
        code: string
        description?: string
        type?: string
        starRating?: number
        parentHotel?: string
      },
    ) => {
      return await request<Hotel>(`/chains/${chainCode}/hotels`, "POST", hotelData)
    },
    [request],
  )

  // Remove a hotel from a chain
  const removeHotelFromChain = useCallback(
    async (chainCode: string, hotelId: string) => {
      return await request<Hotel>(`/chains/${chainCode}/hotels/${hotelId}`, "DELETE")
    },
    [request],
  )

  // Get chain statistics
  const getChainStatistics = useCallback(
    async (chainCode: string) => {
      return await request<{
        totalHotels: number
        activeHotels: number
        totalRooms: number
        activeBookings: number
        totalGuests: number
        hotels: { id: string; name: string; code: string; active: boolean }[]
      }>(`/chains/${chainCode}/statistics`)
    },
    [request],
  )

  // Get cross-hotel users
  const getCrossHotelUsers = useCallback(
    async (chainCode: string) => {
      return await request<ChainUser[]>(`/cross-hotel/chains/${chainCode}/users`)
    },
    [request],
  )

  // Grant chain access to a user
  const grantChainAccess = useCallback(
    async (chainCode: string, userData: { userId: string; accessLevel: string }) => {
      return await request<{ userId: string; chainCode: string; accessLevel: string; hotelCount: number }>(
        `/cross-hotel/chains/${chainCode}/users`,
        "POST",
        userData,
      )
    },
    [request],
  )

  // Revoke chain access from a user
  const revokeChainAccess = useCallback(
    async (chainCode: string, userId: string) => {
      return await request<{ userId: string; chainCode: string; hotelsAffected: number }>(
        `/cross-hotel/chains/${chainCode}/users/${userId}`,
        "DELETE",
      )
    },
    [request],
  )

  // Sync configuration across hotels in a chain
  const syncChainConfiguration = useCallback(
    async (
      chainCode: string,
      syncData: {
        syncAll?: boolean
        targetHotels?: string[]
        configSections?: string[]
      },
    ) => {
      return await request<{ syncLog: SyncLog; syncId: string }>(
        `/data-sync/chains/${chainCode}/configuration`,
        "POST",
        syncData,
      )
    },
    [request],
  )

  // Get sync logs for a chain
  const getSyncLogs = useCallback(
    async (chainCode: string, page = 1, limit = 20) => {
      return await request<{
        count: number
        total: number
        pagination: { page: number; limit: number; totalPages: number }
        data: SyncLog[]
      }>(`/data-sync/chains/${chainCode}/logs?page=${page}&limit=${limit}`)
    },
    [request],
  )

  // Get sync log details
  const getSyncLogDetails = useCallback(
    async (syncId: string) => {
      return await request<SyncLog>(`/data-sync/logs/${syncId}`)
    },
    [request],
  )

  return {
    isLoading,
    getAllChains,
    getChainDetails,
    createChain,
    updateSharedConfiguration,
    addHotelToChain,
    removeHotelFromChain,
    getChainStatistics,
    getCrossHotelUsers,
    grantChainAccess,
    revokeChainAccess,
    syncChainConfiguration,
    getSyncLogs,
    getSyncLogDetails,
  }
}
