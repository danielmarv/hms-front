"use client"

import { useState, useEffect, useCallback } from "react"
import { useApi } from "./use-api"

export interface EventTemplate {
  _id: string
  name: string
  description: string
  eventType: string
  hotel: string
  defaultDuration: number
  defaultCapacity: {
    min: number
    max: number
  }
  defaultVenue?: string
  defaultSetup: {
    setupTime: number
    cleanupTime: number
    requirements: string[]
  }
  pricing: {
    basePrice: number
    pricePerPerson?: number
    additionalFees: Array<{
      name: string
      amount: number
      type: 'fixed' | 'percentage'
    }>
  }
  inclusions: string[]
  exclusions: string[]
  terms: string[]
  isActive: boolean
  created_at: string
  updated_at: string
}

export function useEventTemplates(hotelId?: string) {
  const { request, isLoading } = useApi()
  const [templates, setTemplates] = useState<EventTemplate[]>([])
  const [error, setError] = useState<string | null>(null)

  // Function to fetch all templates
  const fetchTemplates = useCallback(async () => {
    const url = hotelId ? `/event-templates?hotel=${hotelId}` : "/event-templates"
    const response = await request(url, "GET")

    if (response.error) {
      setError(response.error)
      return
    }

    if (response.data) {
      setTemplates(Array.isArray(response.data) ? response.data : [])
    }
  }, [request, hotelId])

  // Load templates on component mount
  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Function to create a new template
  const createTemplate = useCallback(
    async (templateData: Partial<EventTemplate>) => {
      const response = await request("/event-templates", "POST", templateData)

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Add the new template to the state
        setTemplates((prevTemplates) => [...prevTemplates, response.data])
        return response.data
      }

      return null
    },
    [request],
  )

  // Function to update a template
  const updateTemplate = useCallback(
    async (id: string, templateData: Partial<EventTemplate>) => {
      const response = await request(`/event-templates/${id}`, "PUT", templateData)

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Update the template in the state
        setTemplates((prevTemplates) =>
          prevTemplates.map((template) => (template._id === id ? { ...template, ...response.data } : template)),
        )
        return response.data
      }

      return null
    },
    [request],
  )

  // Function to delete a template
  const deleteTemplate = useCallback(
    async (id: string) => {
      const response = await request(`/event-templates/${id}`, "DELETE")

      if (response.error) {
        setError(response.error)
        return false
      }

      if (response.data?.success || response.data) {
        // Remove the template from the state
        setTemplates((prevTemplates) => prevTemplates.filter((template) => template._id !== id))
        return true
      }

      return false
    },
    [request],
  )

  // Function to get a single template by ID
  const getTemplateById = useCallback(
    async (id: string) => {
      const response = await request(`/event-templates/${id}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data
    },
    [request],
  )

  // Function to duplicate a template
  const duplicateTemplate = useCallback(
    async (id: string, newName: string) => {
      const response = await request(`/event-templates/${id}/duplicate`, "POST", { name: newName })

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Add the duplicated template to the state
        setTemplates((prevTemplates) => [...prevTemplates, response.data])
        return response.data
      }

      return null
    },
    [request],
  )

  return {
    templates,
    loading: isLoading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    duplicateTemplate,
  }
}