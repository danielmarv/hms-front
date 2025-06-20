"use client"

import { useState, useEffect, useCallback } from "react"
import { useApi } from "./use-api"

export interface EventServiceImage {
  url: string
  caption: string
  isDefault: boolean
}

export interface EventServiceOption {
  name: string
  description: string
  additionalPrice: number
}

export interface EventServiceInventory {
  isLimited: boolean
  totalQuantity?: number
  availableQuantity?: number
  lowStockThreshold?: number
}

export interface EventServiceExternalProvider {
  name: string
  contactPerson: string
  phone: string
  email: string
  contractDetails: string
  commissionRate?: number
}

export interface EventServiceRestrictions {
  venueTypes: string[]
  eventTypes: string[]
  minCapacity?: number
  maxCapacity?: number
  availableDays: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
}

export interface EventServiceSeasonalAvailability {
  isAvailable: boolean
  startDate?: string
  endDate?: string
  description: string
}

export interface EventServiceReview {
  _id: string
  rating: number
  comment: string
  reviewer: string
  date: string
}

export interface EventService {
  _id: string
  name: string
  description: string
  hotel: string
  category: string
  subcategory?: string
  price: number
  priceType: string
  customPriceDetails?: string
  minimumQuantity: number
  maximumQuantity?: number
  leadTime: number
  duration?: number
  setupTime: number
  cleanupTime: number
  images: EventServiceImage[]
  options: EventServiceOption[]
  inventory?: EventServiceInventory
  externalProvider?: EventServiceExternalProvider
  isExternalService: boolean
  restrictions: EventServiceRestrictions
  status: string
  seasonalAvailability: EventServiceSeasonalAvailability
  reviews: EventServiceReview[]
  averageRating: number
  defaultImage?: string
  isDeleted: boolean
  createdBy: string
  updatedBy: string
  created_at: string
  updated_at: string
}

export interface EventServiceFilters {
  category?: string
  subcategory?: string
  available?: boolean
  status?: string
  priceType?: string
  isExternalService?: boolean
  minPrice?: number
  maxPrice?: number
  hotel?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
}

export interface ServiceStatistics {
  _id: string
  totalUsage: number
  totalQuantity: number
  totalRevenue: number
}

export interface ServiceAvailabilityCheck {
  isAvailable: boolean
  reason?: string
}

export interface BulkUpdateData {
  serviceIds: string[]
  updateData: Partial<EventService>
}

export function useEventServices(hotelId?: string) {
  const { request, isLoading } = useApi()
  const [services, setServices] = useState<EventService[]>([])
  const [statistics, setStatistics] = useState<ServiceStatistics[]>([])
  const [error, setError] = useState<string | null>(null)

  // Function to fetch all services
  const fetchServices = useCallback(
    async (filters?: EventServiceFilters) => {
      try {
        setError(null)
        const queryParams = new URLSearchParams()

        if (hotelId) queryParams.append("hotel", hotelId)
        if (filters?.category) queryParams.append("category", filters.category)
        if (filters?.subcategory) queryParams.append("subcategory", filters.subcategory)
        if (filters?.available !== undefined) queryParams.append("available", filters.available.toString())
        if (filters?.status) queryParams.append("status", filters.status)
        if (filters?.priceType) queryParams.append("priceType", filters.priceType)
        if (filters?.isExternalService !== undefined)
          queryParams.append("isExternalService", filters.isExternalService.toString())
        if (filters?.minPrice !== undefined) queryParams.append("minPrice", filters.minPrice.toString())
        if (filters?.maxPrice !== undefined) queryParams.append("maxPrice", filters.maxPrice.toString())
        if (filters?.search) queryParams.append("search", filters.search)
        if (filters?.page) queryParams.append("page", filters.page.toString())
        if (filters?.limit) queryParams.append("limit", filters.limit.toString())
        if (filters?.sortBy) queryParams.append("sortBy", filters.sortBy)

        const url = `/event-service${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
        const response = await request(url, "GET")

        if (response.error) {
          setError(response.error)
          return { services: [], pagination: null }
        }

        // Handle ApiResponse format from server
        if (response.data?.services) {
          setServices(response.data.services)
          return {
            services: response.data.services,
            pagination: response.data.pagination,
          }
        } else if (Array.isArray(response.data)) {
          setServices(response.data)
          return { services: response.data, pagination: null }
        } else {
          setServices([])
          return { services: [], pagination: null }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch services"
        setError(errorMessage)
        return { services: [], pagination: null }
      }
    },
    [request, hotelId],
  )

  // Function to get service by ID
  const getServiceById = useCallback(
    async (id: string) => {
      try {
        setError(null)
        const response = await request(`/event-service/${id}`, "GET")

        if (response.error) {
          setError(response.error)
          return null
        }

        // Handle ApiResponse format from server
        return response.data?.service || response.data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch service"
        setError(errorMessage)
        return null
      }
    },
    [request],
  )

  // Function to create a new service
  const createService = useCallback(
    async (serviceData: Partial<EventService>) => {
      try {
        setError(null)
        const response = await request("/event-service", "POST", serviceData)

        if (response.error) {
          setError(response.error)
          return null
        }

        // Handle ApiResponse format from server
        const newService = response.data?.service || response.data
        if (newService) {
          // Add the new service to the state
          setServices((prevServices) => [...prevServices, newService])
          return newService
        }

        return null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create service"
        setError(errorMessage)
        return null
      }
    },
    [request],
  )

  // Function to update a service
  const updateService = useCallback(
    async (id: string, serviceData: Partial<EventService>) => {
      try {
        setError(null)
        const response = await request(`/event-service/${id}`, "PUT", serviceData)

        if (response.error) {
          setError(response.error)
          return null
        }

        // Handle ApiResponse format from server
        const updatedService = response.data?.service || response.data
        if (updatedService) {
          // Update the service in the state
          setServices((prevServices) =>
            prevServices.map((service) => (service._id === id ? { ...service, ...updatedService } : service)),
          )
          return updatedService
        }

        return null
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update service"
        setError(errorMessage)
        return null
      }
    },
    [request],
  )

  // Function to delete a service
  const deleteService = useCallback(
    async (id: string) => {
      try {
        setError(null)
        const response = await request(`/event-service/${id}`, "DELETE")

        if (response.error) {
          setError(response.error)
          return false
        }

        if (response.data?.success !== false) {
          // Remove the service from the state
          setServices((prevServices) => prevServices.filter((service) => service._id !== id))
          return true
        }

        return false
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete service"
        setError(errorMessage)
        return false
      }
    },
    [request],
  )

  // Function to get services by category
  const getServicesByCategory = useCallback(
    async (category: string) => {
      try {
        setError(null)
        const response = await request(`/event-service/category/${category}`, "GET")

        if (response.error) {
          setError(response.error)
          return []
        }

        // Handle ApiResponse format from server
        if (response.data?.services) {
          return response.data.services
        } else if (Array.isArray(response.data)) {
          return response.data
        }

        return []
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch services by category"
        setError(errorMessage)
        return []
      }
    },
    [request],
  )

  // Function to get service statistics
  const getServiceStatistics = useCallback(
    async (filters?: { hotel?: string; start_date?: string; end_date?: string }) => {
      try {
        setError(null)
        const queryParams = new URLSearchParams()

        if (filters?.hotel) queryParams.append("hotel", filters.hotel)
        if (filters?.start_date) queryParams.append("start_date", filters.start_date)
        if (filters?.end_date) queryParams.append("end_date", filters.end_date)

        const url = `/event-service/statistics${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
        const response = await request(url, "GET")

        if (response.error) {
          setError(response.error)
          return []
        }

        // Handle ApiResponse format from server
        const stats = response.data?.statistics || response.data || []
        setStatistics(stats)
        return stats
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch service statistics"
        setError(errorMessage)
        return []
      }
    },
    [request],
  )

  // Function to bulk update services
  const bulkUpdateServices = useCallback(
    async (bulkData: BulkUpdateData) => {
      try {
        setError(null)
        const response = await request("/event-service/bulk-update", "PATCH", bulkData)

        if (response.error) {
          setError(response.error)
          return null
        }

        // Refresh services after bulk update
        await fetchServices()

        return response.data?.modifiedCount || 0
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to bulk update services"
        setError(errorMessage)
        return null
      }
    },
    [request, fetchServices],
  )

  // Function to add service to event
  const addServiceToEvent = useCallback(
    async (eventId: string, serviceId: string, quantity: number, notes?: string) => {
      try {
        setError(null)
        const response = await request(`/event-service/events/${eventId}/add`, "POST", {
          serviceId,
          quantity,
          notes,
        })

        if (response.error) {
          setError(response.error)
          return null
        }

        // Handle ApiResponse format from server
        return response.data?.event || response.data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to add service to event"
        setError(errorMessage)
        return null
      }
    },
    [request],
  )

  // Function to remove service from event
  const removeServiceFromEvent = useCallback(
    async (eventId: string, serviceId: string) => {
      try {
        setError(null)
        const response = await request(`/event-service/events/${eventId}/remove/${serviceId}`, "DELETE")

        if (response.error) {
          setError(response.error)
          return null
        }

        // Handle ApiResponse format from server
        return response.data?.event || response.data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to remove service from event"
        setError(errorMessage)
        return null
      }
    },
    [request],
  )

  // Function to check service availability
  const checkServiceAvailability = useCallback(
    async (serviceId: string, date: string, quantity = 1): Promise<ServiceAvailabilityCheck> => {
      try {
        setError(null)
        const service = await getServiceById(serviceId)

        if (!service) {
          return {
            isAvailable: false,
            reason: "Service not found",
          }
        }

        // Check if service is active
        if (service.status !== "active") {
          return {
            isAvailable: false,
            reason: `Service is currently ${service.status}`,
          }
        }

        // Check seasonal availability
        if (service.seasonalAvailability && !service.seasonalAvailability.isAvailable) {
          if (service.seasonalAvailability.startDate && service.seasonalAvailability.endDate) {
            const requestDate = new Date(date)
            const startDate = new Date(service.seasonalAvailability.startDate)
            const endDate = new Date(service.seasonalAvailability.endDate)

            if (requestDate < startDate || requestDate > endDate) {
              return {
                isAvailable: false,
                reason: `Service is only available from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
              }
            }
          } else {
            return {
              isAvailable: false,
              reason: "Service is not available during this season",
            }
          }
        }

        // Check day of week availability
        const requestDate = new Date(date)
        const dayOfWeek = requestDate.toLocaleDateString("en-US", {
          weekday: "long",
        }).toLowerCase() as keyof typeof service.restrictions.availableDays
        if (service.restrictions.availableDays && !service.restrictions.availableDays[dayOfWeek]) {
          return {
            isAvailable: false,
            reason: `Service is not available on ${String(dayOfWeek)}s`,
          }
        }

        // Check inventory if applicable
        if (service.inventory && service.inventory.isLimited) {
          if ((service.inventory.availableQuantity || 0) < quantity) {
            return {
              isAvailable: false,
              reason: `Only ${service.inventory.availableQuantity} units available, but ${quantity} requested`,
            }
          }
        }

        return {
          isAvailable: true,
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to check service availability"
        setError(errorMessage)
        return {
          isAvailable: false,
          reason: errorMessage,
        }
      }
    },
    [getServiceById],
  )

  // Load services on component mount
  useEffect(() => {
    if (hotelId) {
      fetchServices()
    }
  }, [hotelId, fetchServices])

  return {
    services,
    statistics,
    loading: isLoading,
    error,
    fetchServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getServicesByCategory,
    getServiceStatistics,
    bulkUpdateServices,
    addServiceToEvent,
    removeServiceFromEvent,
    checkServiceAvailability,
  }
}
