"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"

export interface SystemSettings {
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  companyWebsite: string
  taxRate: number
  serviceChargeRate: number
  defaultCurrency: string
  dateFormat: string
  timeFormat: string
  timezone: string
  logoUrl?: string
}

export interface DocumentTemplate {
  id: string
  type: "invoice" | "receipt" | "quotation"
  name: string
  header: string
  footer: string
  terms: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export function useSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const { get, post, put, isLoading } = useApi()

  // Get system settings from server
  const getSettings = async () => {
    try {
      const response = await get("/settings")
      if (response) {
        setSettings(response)
        return response
      }
    } catch (error) {
      toast.error("Failed to fetch system settings")
      return null
    }
  }

  // Update system settings
  const updateSettings = async (updates: Partial<SystemSettings>) => {
    try {
      const response = await put("/settings", updates)
      if (response) {
        setSettings(response)
        toast.success("Settings updated successfully")
        return response
      }
    } catch (error) {
      toast.error("Failed to update settings")
      throw error
    }
  }

  // Get document templates from server
  const getTemplates = async () => {
    try {
      const response = await get("/settings/templates")
      if (response && Array.isArray(response)) {
        setTemplates(response)
        return response
      }
    } catch (error) {
      toast.error("Failed to fetch document templates")
      return []
    }
  }

  // Create document template
  const createTemplate = async (template: Omit<DocumentTemplate, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await post("/settings/templates", template)
      if (response) {
        await getTemplates() // Refresh templates
        toast.success("Template created successfully")
        return response
      }
    } catch (error) {
      toast.error("Failed to create template")
      throw error
    }
  }

  // Update document template
  const updateTemplate = async (id: string, updates: Partial<DocumentTemplate>) => {
    try {
      const response = await put(`/settings/templates/${id}`, updates)
      if (response) {
        await getTemplates() // Refresh templates
        toast.success("Template updated successfully")
        return response
      }
    } catch (error) {
      toast.error("Failed to update template")
      throw error
    }
  }

  // Upload company logo
  const uploadLogo = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("logo", file)

      const response = await post("/settings/logo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response && response.logoUrl) {
        await getSettings() // Refresh settings to get new logo URL
        toast.success("Logo uploaded successfully")
        return response.logoUrl
      }
    } catch (error) {
      toast.error("Failed to upload logo")
      throw error
    }
  }

  return {
    settings,
    templates,
    isLoading,
    getSettings,
    updateSettings,
    getTemplates,
    createTemplate,
    updateTemplate,
    uploadLogo,
  }
}
