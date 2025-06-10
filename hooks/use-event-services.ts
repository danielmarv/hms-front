"use client"

import { useState, useEffect, useCallback } from "react"
import { useApi } from "./use-api"

export interface EventService {
  _id: string
  name: string
  description: string
  category: string
  price: number
  unit: string
  hotel_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export function useEventServices(hotelId?: string) {
  const { request, isLoading } = useApi()
  const [services, setServices] = useState<EventService[]>([])
  const [error, setError] = useState<string | null>(null)

  // Function to fetch all services
  const fetchServices = useCallback(async () => {
    const url = hotelId ? `/events/services?hotel=${hotelId}` : "/events/services"
    const response = await request<EventService[]>(url, "GET")

    if (response.error) {
      setError(response.error)
      return
    }

    if (response.data) {
      setServices(response.data)
    }
  }, [request, hotelId])

  // Load services on component mount
  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  // Function to create a new service
  const createService = useCallback(
    async (serviceData: Partial<EventService>) => {
      const response = await request<EventService>("/events/services", "POST", serviceData)

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Add the new service to the state
        setServices((prevServices) => [...prevServices, response.data])
        return response.data
      }

      return null
    },
    [request],
  )

  // Function to update a service
  const updateService = useCallback(
    async (id: string, serviceData: Partial<EventService>) => {
      const response = await request<EventService>(`/events/services/${id}`, "PUT", serviceData)

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Update the service in the state
        setServices((prevServices) =>
          prevServices.map((service) => (service._id === id ? { ...service, ...response.data } : service)),
        )
        return response.data
      }

      return null
    },
    [request],
  )

  // Function to delete a service
  const deleteService = useCallback(
    async (id: string) => {
      const response = await request<{ success: boolean }>(`/events/services/${id}`, "DELETE")

      if (response.error) {
        setError(response.error)
        return false
      }

      if (response.data?.success) {
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
      const response = await request<EventService[]>(`/events/services/category/${category}`, "GET")

      if (response.error) {
        setError(response.error)
        return []
      }

      return response.data || []
    },
    [request],
  )

  // Function to get a single service by ID
  const getServiceById = useCallback(
    async (id: string) => {
      const response = await request<EventService>(`/events/services/${id}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data
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
