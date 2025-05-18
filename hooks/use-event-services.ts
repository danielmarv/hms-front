"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { EventService } from "./use-events"

export function useEventServices(hotelId?: string) {
  const [services, setServices] = useState<EventService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const url = hotelId ? `/api/events/services?hotel=${hotelId}` : "/api/events/services"
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Error fetching services: ${response.statusText}`)
        }

        const data = await response.json()
        setServices(data.services)
      } catch (err) {
        console.error("Failed to fetch services:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch services")
        toast.error("Failed to load services")
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [hotelId])

  // Function to create a new service
  const createService = async (serviceData: Partial<EventService>) => {
    try {
      setLoading(true)
      const response = await fetch("/api/events/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      })

      if (!response.ok) {
        throw new Error(`Error creating service: ${response.statusText}`)
      }

      const data = await response.json()

      // Add the new service to the state
      setServices((prevServices) => [...prevServices, data.service])

      toast.success("Service created successfully")
      return data.service
    } catch (err) {
      console.error("Failed to create service:", err)
      setError(err instanceof Error ? err.message : "Failed to create service")
      toast.error("Failed to create service")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to update a service
  const updateService = async (id: string, serviceData: Partial<EventService>) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      })

      if (!response.ok) {
        throw new Error(`Error updating service: ${response.statusText}`)
      }

      const data = await response.json()

      // Update the service in the state
      setServices((prevServices) =>
        prevServices.map((service) => (service._id === id ? { ...service, ...data.service } : service)),
      )

      toast.success("Service updated successfully")
      return data.service
    } catch (err) {
      console.error("Failed to update service:", err)
      setError(err instanceof Error ? err.message : "Failed to update service")
      toast.error("Failed to update service")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to delete a service
  const deleteService = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/services/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error deleting service: ${response.statusText}`)
      }

      // Remove the service from the state
      setServices((prevServices) => prevServices.filter((service) => service._id !== id))

      toast.success("Service deleted successfully")
    } catch (err) {
      console.error("Failed to delete service:", err)
      setError(err instanceof Error ? err.message : "Failed to delete service")
      toast.error("Failed to delete service")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to get services by category
  const getServicesByCategory = async (category: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/services/category/${category}`)

      if (!response.ok) {
        throw new Error(`Error fetching services by category: ${response.statusText}`)
      }

      const data = await response.json()
      return data.services
    } catch (err) {
      console.error(`Failed to fetch services for category ${category}:`, err)
      setError(err instanceof Error ? err.message : `Failed to fetch services for category ${category}`)
      toast.error("Failed to load services by category")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
    getServicesByCategory,
  }
}
