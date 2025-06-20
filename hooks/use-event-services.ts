"use client"

import { useState, useEffect, useCallback } from "react"
import { useApi } from "./use-api"

export interface EventService {
  _id: string
  name: string
  description: string
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
  status: string
  isExternalService: boolean
  hotel: string
  externalProvider?: {
    name: string
    contactPerson: string
    phone: string
    email: string
    contractDetails: string
    commissionRate?: number
  }
  inventory?: {
    isLimited: boolean
    totalQuantity?: number
    availableQuantity?: number
    lowStockThreshold?: number
  }
  restrictions: {
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
  seasonalAvailability: {
    isAvailable: boolean
    startDate?: string
    endDate?: string
    description: string
  }
  options: Array<{
    name: string
    description: string
    additionalPrice: number
  }>
  images: Array<{
    url: string
    caption: string
    isDefault: boolean
  }>
  created_at: string
  updated_at: string
}

export function useEventServices(hotelId: string) {
  const { request, isLoading } = useApi()
  const [services, setServices] = useState<EventService[]>([])
  const [error, setError] = useState<string | null>(null)

  // Function to fetch all services
  const fetchServices = useCallback(async () => {
    if (!hotelId) {
      setServices([])
      return
    }

    const url = `/event-service?hotelId=${hotelId}`
    const response = await request(url, "GET")

    if (response.error) {
      setError(response.error)
      return
    }

    // Handle ApiResponse format from server
    if (response.data?.services) {
      setServices(response.data.services)
    } else if (Array.isArray(response.data)) {
      setServices(response.data)
    } else {
      setServices([])
    }
  }, [request, hotelId])

  // Load services on component mount
  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  // Function to create a new service
  const createService = useCallback(
    async (serviceData: Partial<EventService>) => {
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
    },
    [request],
  )

  // Function to update a service
  const updateService = useCallback(
    async (id: string, serviceData: Partial<EventService>) => {
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
    },
    [request],
  )

  // Function to delete a service
  const deleteService = useCallback(
    async (id: string) => {
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
    },
    [request],
  )

  // Function to get services by category
  const getServicesByCategory = useCallback(
    async (category: string) => {
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
    },
    [request],
  )

  // Function to get a single service by ID
  const getServiceById = useCallback(
    async (id: string) => {
      const response = await request(`/event-service/${id}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      // Handle ApiResponse format from server
      return response.data?.service || response.data
    },
    [request],
  )

  return {
    services,
    loading: isLoading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    getServicesByCategory,
    getServiceById,
  }
}
