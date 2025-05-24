"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"

export interface Asset {
  _id: string
  assetId: string
  name: string
  category: string
  type: string
  status: "active" | "inactive" | "maintenance" | "disposed"
  condition: "excellent" | "good" | "fair" | "poor"
  location: {
    building: string
    floor: string
    room: string
  }
  assignedTo: {
    user?: string
    hotel?: string
  }
  specifications: {
    model: string
    serialNumber: string
    manufacturer: string
    purchaseDate: string
    warrantyExpiry: string
  }
  financial: {
    purchasePrice: number
    currentValue: number
    depreciationRate: number
    supplier?: string
  }
  maintenance: {
    schedule: {
      frequency: "weekly" | "monthly" | "quarterly" | "annually"
      lastPerformed?: string
      nextDue?: string
    }
    history: Array<{
      date: string
      type: string
      description: string
      cost: number
      performedBy: string
    }>
  }
  customFields: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface AssetAnalytics {
  summary: Array<{
    totalAssets: number
    totalValue: number
    avgValue: number
  }>
  byCategory: Array<{
    _id: string
    count: number
    totalValue: number
  }>
  byStatus: Array<{
    _id: string
    count: number
  }>
  byCondition: Array<{
    _id: string
    count: number
  }>
  maintenanceDue: number
  warrantyExpiring: number
}

export const useAssets = () => {
  const { request, isLoading } = useApi()
  const [assets, setAssets] = useState<Asset[]>([])
  const [analytics, setAnalytics] = useState<AssetAnalytics | null>(null)

  const fetchAssets = async (params?: {
    page?: number
    limit?: number
    category?: string
    type?: string
    status?: string
    search?: string
  }) => {
    try {
      const response = await request<{
        assets: Asset[]
        pagination: { current: number; pages: number; total: number }
      }>("/api/assets", "GET", undefined, false)

      if (response?.data) {
        setAssets(response.data.assets)
        return response.data
      }
    } catch (error) {
      console.error("Error fetching assets:", error)
      toast.error("Failed to fetch assets")
    }
  }

  const createAsset = async (assetData: Partial<Asset>) => {
    try {
      const response = await request<Asset>("/api/assets", "POST", assetData)
      if (response?.data) {
        setAssets((prev) => [response.data, ...prev])
        toast.success("Asset created successfully")
        return response.data
      }
    } catch (error) {
      console.error("Error creating asset:", error)
      throw error
    }
  }

  const updateAsset = async (id: string, assetData: Partial<Asset>) => {
    try {
      const response = await request<Asset>(`/api/assets/${id}`, "PUT", assetData)
      if (response?.data) {
        setAssets((prev) => prev.map((asset) => (asset._id === id ? response.data : asset)))
        toast.success("Asset updated successfully")
        return response.data
      }
    } catch (error) {
      console.error("Error updating asset:", error)
      throw error
    }
  }

  const deleteAsset = async (id: string) => {
    try {
      await request(`/api/assets/${id}`, "DELETE")
      setAssets((prev) => prev.filter((asset) => asset._id !== id))
      toast.success("Asset deleted successfully")
    } catch (error) {
      console.error("Error deleting asset:", error)
      throw error
    }
  }

  const addMaintenanceRecord = async (
    id: string,
    maintenanceData: {
      type: string
      description: string
      cost: number
      performedBy: string
    },
  ) => {
    try {
      const response = await request<Asset>(`/api/assets/${id}/maintenance`, "POST", maintenanceData)
      if (response?.data) {
        setAssets((prev) => prev.map((asset) => (asset._id === id ? response.data : asset)))
        toast.success("Maintenance record added")
        return response.data
      }
    } catch (error) {
      console.error("Error adding maintenance record:", error)
      throw error
    }
  }

  const transferAsset = async (
    id: string,
    transferData: {
      newAssignee?: string
      newLocation?: Partial<Asset["location"]>
      reason: string
    },
  ) => {
    try {
      const response = await request<Asset>(`/api/assets/${id}/transfer`, "POST", transferData)
      if (response?.data) {
        setAssets((prev) => prev.map((asset) => (asset._id === id ? response.data : asset)))
        toast.success("Asset transferred successfully")
        return response.data
      }
    } catch (error) {
      console.error("Error transferring asset:", error)
      throw error
    }
  }

  const fetchAssetAnalytics = async () => {
    try {
      const response = await request<AssetAnalytics>("/api/assets/analytics", "GET", undefined, false)
      if (response?.data) {
        setAnalytics(response.data)
        return response.data
      }
    } catch (error) {
      console.error("Error fetching asset analytics:", error)
      toast.error("Failed to fetch asset analytics")
    }
  }

  const fetchMaintenanceDue = async (days = 7) => {
    try {
      const response = await request<Asset[]>(`/api/assets/maintenance-due?days=${days}`, "GET", undefined, false)
      return response?.data || []
    } catch (error) {
      console.error("Error fetching maintenance due:", error)
      toast.error("Failed to fetch maintenance due")
      return []
    }
  }

  return {
    assets,
    analytics,
    isLoading,
    fetchAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    addMaintenanceRecord,
    transferAsset,
    fetchAssetAnalytics,
    fetchMaintenanceDue,
  }
}
