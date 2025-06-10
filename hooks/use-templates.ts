"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"

export interface DocumentTemplate {
  id: string
  type: "invoice" | "receipt" | "quotation"
  header: string
  footer: string
  terms?: string
  notes?: string
  validityPeriod?: number
  logoUrl?: string
}

export function useTemplates() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const { get, post, put, isLoading } = useApi()

  // Get all templates
  const getTemplates = async () => {
    try {
      const response = await get("/api/settings/templates")

      if (response && Array.isArray(response)) {
        setTemplates(response)
        return response
      }

      return []
    } catch (error) {
      toast.error("Failed to fetch document templates")
      return []
    }
  }

  // Get a specific template by type
  const getTemplateByType = async (type: string) => {
    try {
      const response = await get(`/api/settings/templates/${type}`)
      return response
    } catch (error) {
      toast.error(`Failed to fetch ${type} template`)
      return null
    }
  }

  // Update a template
  const updateTemplate = async (type: string, updates: Partial<DocumentTemplate>) => {
    try {
      const response = await put(`/api/settings/templates/${type}`, updates)
      await getTemplates() // Refresh the list
      return response
    } catch (error) {
      toast.error(`Failed to update ${type} template`)
      throw error
    }
  }

  // Upload a logo for templates
  const uploadLogo = async (file: File) => {
    try {
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("logo", file)

      // Use fetch directly for file upload
      const response = await fetch("/api/settings/templates/logo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload logo")
      }

      const data = await response.json()
      return data.logoUrl
    } catch (error) {
      toast.error("Failed to upload logo")
      throw error
    }
  }

  // Generate a document from a template
  const generateDocument = async (type: "invoice" | "receipt" | "quotation", data: any) => {
    try {
      const response = await post(`/api/documents/generate/${type}`, data)
      return response
    } catch (error) {
      toast.error(`Failed to generate ${type}`)
      throw error
    }
  }

  return {
    templates,
    isLoading,
    getTemplates,
    getTemplateByType,
    updateTemplate,
    uploadLogo,
    generateDocument,
  }
}
