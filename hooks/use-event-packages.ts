"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"

// Types and Interfaces
export interface EventPackage {
  _id: string
  name: string
  description?: string
  hotel: string
  eventTypes: string[]
  venueTypes: string[]
  duration: number
  minCapacity: number
  maxCapacity: number
  basePrice: number
  pricePerPerson: number
  includedServices: PackageService[]
  includedAmenities: PackageAmenity[]
  additionalOptions: PackageOption[]
  images: PackageImage[]
  terms?: string
  cancellationPolicy: "flexible" | "moderate" | "strict"
  isActive: boolean
  isPromoted: boolean
  promotionDetails?: PromotionDetails
  createdBy?: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
  defaultImage?: string
}

export interface PackageService {
  service: string
  quantity: number
  details?: string
}

export interface PackageAmenity {
  name: string
  description?: string
}

export interface PackageOption {
  _id?: string
  name: string
  description?: string
  price: number
}

export interface PackageImage {
  url: string
  caption?: string
  isDefault: boolean
}

export interface PromotionDetails {
  startDate?: string
  endDate?: string
  discountPercentage?: number
  discountAmount?: number
  promotionCode?: string
  description?: string
}

export interface PackagePricing {
  basePrice: number
  perGuestPrice: number
  minGuests: number
  maxGuests: number
  services: ServicePricing[]
}

export interface ServicePricing {
  service: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface PriceCalculation {
  packageName: string
  basePrice: number
  guestCount: number
  includedServices: ServicePricing[]
  additionalServices: ServicePricing[]
  totalPrice: number
}

export interface PackageStatistics {
  overview: {
    totalEvents: number
    totalRevenue: number
    avgGuestCount: number
    totalGuests: number
  }
  statusBreakdown: Array<{
    _id: string
    count: number
  }>
  monthlyTrend: Array<{
    _id: {
      year: number
      month: number
    }
    events: number
    revenue: number
  }>
}

export interface PackageFilters {
  hotel?: string
  eventType?: string
  isActive?: boolean
  limit?: number
  page?: number
}

export interface CreatePackageData {
  name: string
  description?: string
  hotel: string
  eventTypes?: string[]
  venueTypes?: string[]
  duration: number
  minCapacity: number
  maxCapacity: number
  basePrice: number
  pricePerPerson?: number
  includedServices?: PackageService[]
  includedAmenities?: PackageAmenity[]
  additionalOptions?: PackageOption[]
  images?: PackageImage[]
  terms?: string
  cancellationPolicy?: "flexible" | "moderate" | "strict"
  isActive?: boolean
  isPromoted?: boolean
  promotionDetails?: PromotionDetails
}

export interface UpdatePackageData extends Partial<CreatePackageData> {}

export interface ApplyPackageData {
  guestCount: number
}

export interface CalculatePriceData {
  packageId: string
  guestCount: number
  additionalServices?: Array<{
    service: string
    quantity: number
  }>
}

export interface AddServiceData {
  serviceId: string
  quantity?: number
}

export const useEventPackages = () => {
  const { request } = useApi()

  // State management
  const [packages, setPackages] = useState<EventPackage[]>([])
  const [currentPackage, setCurrentPackage] = useState<EventPackage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper function to handle API responses
  const handleApiResponse = useCallback((response: any) => {
    if (response.error) {
      throw new Error(response.error)
    }
    return response.data
  }, [])

  // Fetch all packages
  const fetchPackages = useCallback(
    async (filters: PackageFilters = {}) => {
      setIsLoading(true)
      setError(null)

      try {
        const queryParams = new URLSearchParams()

        if (filters.hotel) queryParams.append("hotel", filters.hotel)
        if (filters.eventType) queryParams.append("eventType", filters.eventType)
        if (filters.isActive !== undefined) queryParams.append("isActive", filters.isActive.toString())
        if (filters.limit) queryParams.append("limit", filters.limit.toString())
        if (filters.page) queryParams.append("page", filters.page.toString())

        const response = await request(`/event-packages?${queryParams.toString()}`, "GET")
        const data = handleApiResponse(response)

        setPackages(data.packages || [])
        return {
          packages: data.packages || [],
          pagination: data.pagination,
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch packages"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [request, handleApiResponse],
  )

  // Get package by ID
  const getPackageById = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await request(`/event-packages/${id}`, "GET")
        const data = handleApiResponse(response)

        setCurrentPackage(data.package)
        return data.package
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch package"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [request, handleApiResponse],
  )

  // Create package
  const createPackage = useCallback(
    async (packageData: CreatePackageData) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await request("/event-packages", "POST", packageData)
        const data = handleApiResponse(response)

        // Update local state
        setPackages((prev) => [...prev, data.package])

        return data.package
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create package"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [request, handleApiResponse],
  )

  // Update package
  const updatePackage = useCallback(
    async (id: string, packageData: UpdatePackageData) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await request(`/event-packages/${id}`, "PUT", packageData)
        const data = handleApiResponse(response)

        // Update local state
        setPackages((prev) => prev.map((pkg) => (pkg._id === id ? data.package : pkg)))
        if (currentPackage?._id === id) {
          setCurrentPackage(data.package)
        }

        return data.package
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update package"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [request, handleApiResponse, currentPackage],
  )

  // Delete package
  const deletePackage = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await request(`/event-packages/${id}`, "DELETE")
        handleApiResponse(response)

        // Update local state
        setPackages((prev) => prev.filter((pkg) => pkg._id !== id))
        if (currentPackage?._id === id) {
          setCurrentPackage(null)
        }

        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete package"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [request, handleApiResponse, currentPackage],
  )

  // Get package pricing
  const getPackagePricing = useCallback(
    async (id: string): Promise<PackagePricing> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await request(`/event-packages/${id}/pricing`, "GET")
        const data = handleApiResponse(response)

        return data.pricing
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch package pricing"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [request, handleApiResponse],
  )

  // Calculate package price
  const calculatePackagePrice = useCallback(
    async (calculationData: CalculatePriceData): Promise<PriceCalculation> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await request(`/event-packages/${calculationData.packageId}/pricing/calculate`, "POST", {
          packageId: calculationData.packageId,
          guestCount: calculationData.guestCount,
          additionalServices: calculationData.additionalServices,
        })
        const data = handleApiResponse(response)

        return data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to calculate package price"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [request, handleApiResponse],
  )

  // Get package services
  const getPackageServices = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await request(`/event-packages/${id}/services`, "GET")
        const data = handleApiResponse(response)

        return data.services
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch package services"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [request, handleApiResponse],
  )

  // Add service to package
  const addServiceToPackage = useCallback(
    async (id: string, serviceData: AddServiceData) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await request(`/event-packages/${id}/services`, "POST", serviceData)
        const data = handleApiResponse(response)

        // Update local state
        setPackages((prev) => prev.map((pkg) => (pkg._id === id ? data.package : pkg)))
        if (currentPackage?._id === id) {
          setCurrentPackage(data.package)
        }

        return data.package
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to add service to package"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [request, handleApiResponse, currentPackage],
  )

  // Remove service from package
  const removeServiceFromPackage = useCallback(
    async (id: string, serviceId: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await request(`/event-packages/${id}/services/${serviceId}`, "DELETE")
        const data = handleApiResponse(response)

        // Update local state
        setPackages((prev) => prev.map((pkg) => (pkg._id === id ? data.package : pkg)))
        if (currentPackage?._id === id) {
          setCurrentPackage(data.package)
        }

        return data.package
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to remove service from package"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [request, handleApiResponse, currentPackage],
  )

  // Apply package to event
  const applyPackageToEvent = useCallback(
    async (packageId: string, eventId: string, applyData: ApplyPackageData) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await request(`/event-packages/${packageId}/apply-to-event/${eventId}`, "POST", applyData)
        const data = handleApiResponse(response)

        return {
          message: data.message,
          event: data.event,
          totalPrice: data.totalPrice,
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to apply package to event"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [request, handleApiResponse],
  )

  // Get package events
  const getPackageEvents = useCallback(
    async (id: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await request(`/event-packages/${id}/events`, "GET")
        const data = handleApiResponse(response)

        return data.events
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch package events"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [request, handleApiResponse],
  )

  // Get package statistics
  const getPackageStatistics = useCallback(
    async (id: string): Promise<PackageStatistics> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await request(`/event-packages/${id}/statistics`, "GET")
        const data = handleApiResponse(response)

        return data.statistics
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch package statistics"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [request, handleApiResponse],
  )

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Clear current package
  const clearCurrentPackage = useCallback(() => {
    setCurrentPackage(null)
  }, [])

  return {
    // State
    packages,
    currentPackage,
    isLoading,
    error,

    // Actions
    fetchPackages,
    getPackageById,
    createPackage,
    updatePackage,
    deletePackage,
    getPackagePricing,
    calculatePackagePrice,
    getPackageServices,
    addServiceToPackage,
    removeServiceFromPackage,
    applyPackageToEvent,
    getPackageEvents,
    getPackageStatistics,
    clearError,
    clearCurrentPackage,

    // Utilities
    setPackages,
    setCurrentPackage,
  }
}

export default useEventPackages
