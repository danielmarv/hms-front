"use client"

import { useState, useEffect, useCallback } from "react"
import { useApi } from "./use-api"

export interface EventTemplate {
  _id: string
  name: string
  description?: string
  eventType: {
    _id: string
    name: string
    color?: string
  }
  venue: {
    _id: string
    name: string
    capacity?: number
    location?: string
  }
  duration: number // in minutes
  capacity?: number
  basePrice: number
  services: Array<{
    _id: string
    name: string
    price: number
    description?: string
    category?: string
  }>
  staffing: Array<{
    role: string
    count: number
    hourlyRate?: number
  }>
  setupTime: number // in minutes
  teardownTime: number // in minutes
  includedItems: string[]
  terms?: string
  isActive: boolean
  hotelId: string
  createdBy?: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
  usageCount?: number
  estimatedCosts?: {
    basePrice: number
    servicesCost: number
    staffingCost: number
    totalEstimatedCost: number
  }
  sharedWith?: Array<{
    userId: string
    permissions: string[]
    sharedAt: string
    sharedBy: string
  }>
}

export interface CreateTemplateData {
  name: string
  description?: string
  eventType: string
  venue: string
  duration: number
  capacity?: number
  basePrice: number
  services?: string[]
  staffing?: Array<{
    role: string
    count: number
    hourlyRate?: number
  }>
  setupTime?: number
  teardownTime?: number
  includedItems?: string[]
  terms?: string
  isActive?: boolean
  hotelId: string
}

export interface CreateEventFromTemplateData {
  startDate: string
  endDate: string
  customName?: string
  customPrice?: number
  guestId?: string
  notes?: string
  customizations?: Record<string, any>
}

export interface TemplatePreview extends EventTemplate {
  estimatedCosts: {
    basePrice: number
    servicesCost: number
    staffingCost: number
    totalEstimatedCost: number
  }
}

export interface ShareTemplateData {
  shareWith: string
  permissions?: string[]
}

export interface DuplicateTemplateData {
  newName?: string
  modifications?: Record<string, any>
}

export function useEventTemplates(hotelId?: string) {
  const { request, isLoading } = useApi()
  const [templates, setTemplates] = useState<EventTemplate[]>([])
  const [error, setError] = useState<string | null>(null)

  // Function to fetch all templates
  const fetchTemplates = useCallback(
    async (filters?: { hotelId?: string }) => {
      const params = new URLSearchParams()
      if (filters?.hotelId || hotelId) {
        params.append("hotelId", filters?.hotelId || hotelId!)
      }

      const url = `/event-templates${params.toString() ? `?${params.toString()}` : ""}`
      const response = await request(url, "GET")

      if (response.error) {
        setError(response.error)
        return
      }

      if (response.data) {
        setTemplates(Array.isArray(response.data) ? response.data : [])
      }
    },
    [request, hotelId],
  )

  // Load templates on component mount
  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Function to get template by ID
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

  // Function to create a new template
  const createTemplate = useCallback(
    async (templateData: CreateTemplateData) => {
      const response = await request("/event-templates", "POST", templateData)

      if (response.error) {
        setError(response.error)
        return { success: false, message: response.error, data: null }
      }

      if (response.data) {
        // Add the new template to the state
        setTemplates((prevTemplates) => [...prevTemplates, response.data])
        return { success: true, message: "Template created successfully", data: response.data }
      }

      return { success: false, message: "Unknown error occurred", data: null }
    },
    [request],
  )

  // Function to update a template
  const updateTemplate = useCallback(
    async (id: string, templateData: Partial<CreateTemplateData>) => {
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

      if (response.data) {
        // Remove the template from the state
        setTemplates((prevTemplates) => prevTemplates.filter((template) => template._id !== id))
        return true
      }

      return false
    },
    [request],
  )

  // Function to create event from template
  const createEventFromTemplate = useCallback(
    async (templateId: string, eventData: CreateEventFromTemplateData) => {
      const response = await request(`/event-templates/${templateId}/create-event`, "POST", eventData)

      if (response.error) {
        setError(response.error)
        return { success: false, message: response.error, data: null }
      }

      if (response.data) {
        return { success: true, message: "Event created from template successfully", data: response.data }
      }

      return { success: false, message: "Unknown error occurred", data: null }
    },
    [request],
  )

  // Function to preview template with cost calculations
  const previewTemplate = useCallback(
    async (id: string): Promise<TemplatePreview | null> => {
      const response = await request(`/event-templates/${id}/preview`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data
    },
    [request],
  )

  // Function to get templates by category
  const getTemplatesByCategory = useCallback(
    async (category: string, filters?: { hotelId?: string }) => {
      const params = new URLSearchParams()
      if (filters?.hotelId || hotelId) {
        params.append("hotelId", filters?.hotelId || hotelId!)
      }

      const url = `/event-templates/category/${category}${params.toString() ? `?${params.toString()}` : ""}`
      const response = await request(url, "GET")

      if (response.error) {
        setError(response.error)
        return []
      }

      return Array.isArray(response.data) ? response.data : []
    },
    [request, hotelId],
  )

  // Function to get popular templates
  const getPopularTemplates = useCallback(
    async (filters?: { hotelId?: string; limit?: number }) => {
      const params = new URLSearchParams()
      if (filters?.hotelId || hotelId) {
        params.append("hotelId", filters?.hotelId || hotelId!)
      }
      if (filters?.limit) {
        params.append("limit", filters.limit.toString())
      }

      const url = `/event-templates/popular${params.toString() ? `?${params.toString()}` : ""}`
      const response = await request(url, "GET")

      if (response.error) {
        setError(response.error)
        return []
      }

      return Array.isArray(response.data) ? response.data : []
    },
    [request, hotelId],
  )

  // Function to share template
  const shareTemplate = useCallback(
    async (id: string, shareData: ShareTemplateData) => {
      const response = await request(`/event-templates/${id}/share`, "POST", shareData)

      if (response.error) {
        setError(response.error)
        return { success: false, message: response.error, data: null }
      }

      if (response.data) {
        // Update the template in the state
        setTemplates((prevTemplates) =>
          prevTemplates.map((template) => (template._id === id ? { ...template, ...response.data } : template)),
        )
        return { success: true, message: "Template shared successfully", data: response.data }
      }

      return { success: false, message: "Unknown error occurred", data: null }
    },
    [request],
  )

  // Function to duplicate template
  const duplicateTemplate = useCallback(
    async (id: string, duplicateData: DuplicateTemplateData) => {
      const response = await request(`/event-templates/${id}/duplicate`, "POST", duplicateData)

      if (response.error) {
        setError(response.error)
        return { success: false, message: response.error, data: null }
      }

      if (response.data) {
        // Add the duplicated template to the state
        setTemplates((prevTemplates) => [...prevTemplates, response.data])
        return { success: true, message: "Template duplicated successfully", data: response.data }
      }

      return { success: false, message: "Unknown error occurred", data: null }
    },
    [request],
  )

  // Function to apply template (legacy support)
  const applyTemplate = useCallback(
    async (templateId: string, eventData: CreateEventFromTemplateData) => {
      return createEventFromTemplate(templateId, eventData)
    },
    [createEventFromTemplate],
  )

  // Function to get template usage statistics
  const getTemplateUsageStats = useCallback(
    async (id: string) => {
      const response = await request(`/event-templates/${id}/usage-stats`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data
    },
    [request],
  )

  // Function to search templates
  const searchTemplates = useCallback(
    async (query: string, filters?: { hotelId?: string; category?: string; isActive?: boolean }) => {
      const params = new URLSearchParams()
      params.append("search", query)

      if (filters?.hotelId || hotelId) {
        params.append("hotelId", filters?.hotelId || hotelId!)
      }
      if (filters?.category) {
        params.append("category", filters.category)
      }
      if (filters?.isActive !== undefined) {
        params.append("isActive", filters.isActive.toString())
      }

      const url = `/event-templates/search?${params.toString()}`
      const response = await request(url, "GET")

      if (response.error) {
        setError(response.error)
        return []
      }

      return Array.isArray(response.data) ? response.data : []
    },
    [request, hotelId],
  )

  // Function to toggle template active status
  const toggleTemplateStatus = useCallback(
    async (id: string, isActive: boolean) => {
      const response = await request(`/event-templates/${id}`, "PUT", { isActive })

      if (response.error) {
        setError(response.error)
        return false
      }

      if (response.data) {
        // Update the template in the state
        setTemplates((prevTemplates) =>
          prevTemplates.map((template) => (template._id === id ? { ...template, isActive } : template)),
        )
        return true
      }

      return false
    },
    [request],
  )

  // Function to get template categories
  const getTemplateCategories = useCallback(async () => {
    const response = await request("/event-templates/categories", "GET")

    if (response.error) {
      setError(response.error)
      return []
    }

    return Array.isArray(response.data) ? response.data : []
  }, [request])

  return {
    templates,
    loading: isLoading,
    error,
    fetchTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createEventFromTemplate,
    previewTemplate,
    getTemplatesByCategory,
    getPopularTemplates,
    shareTemplate,
    duplicateTemplate,
    applyTemplate, // Legacy support
    getTemplateUsageStats,
    searchTemplates,
    toggleTemplateStatus,
    getTemplateCategories,
  }
}
