"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"

export interface Backup {
  _id: string
  name: string
  description: string
  type: "full" | "database" | "files" | "incremental" | "differential"
  status: "pending" | "in_progress" | "completed" | "failed"
  location?: string
  size?: number
  checksum?: string
  includes: {
    database?: boolean
    files?: string[]
    userUploads?: boolean
    configuration?: boolean
  }
  compression: {
    enabled: boolean
    level: number
  }
  encryption: {
    enabled: boolean
    algorithm?: string
  }
  retention: {
    enabled: boolean
    maxCount?: number
    maxAge?: number
  }
  schedule?: {
    isScheduled: boolean
    frequency: "hourly" | "daily" | "weekly" | "monthly"
    time: string
    dayOfWeek?: number
    dayOfMonth?: number
    timezone?: string
  }
  metadata: {
    startTime?: string
    endTime?: string
    duration?: number
    error?: string
    recordCount?: number
  }
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface BackupAnalytics {
  summary: Array<{
    _id: string
    count: number
    totalSize: number
    avgDuration: number
  }>
  trends: Array<{
    _id: string
    count: number
    totalSize: number
    successRate: number
  }>
  storage: Array<{
    _id: string
    count: number
    totalSize: number
    avgSize: number
  }>
}

export const useBackups = () => {
  const { request, isLoading } = useApi()
  const [backups, setBackups] = useState<Backup[]>([])
  const [analytics, setAnalytics] = useState<BackupAnalytics | null>(null)

  const fetchBackups = async (params?: {
    page?: number
    limit?: number
    type?: string
    status?: string
  }) => {
    try {
      const response = await request<{
        backups: Backup[]
        pagination: { current: number; pages: number; total: number }
      }>("/api/backups", "GET", undefined, false)

      if (response?.data) {
        setBackups(response.data.backups)
        return response.data
      }
    } catch (error) {
      console.error("Error fetching backups:", error)
      toast.error("Failed to fetch backups")
    }
  }

  const createBackup = async (backupData: Partial<Backup>) => {
    try {
      const response = await request<Backup>("/api/backups", "POST", backupData)
      if (response?.data) {
        setBackups((prev) => [response.data, ...prev])
        toast.success("Backup started successfully")
        return response.data
      }
    } catch (error) {
      console.error("Error creating backup:", error)
      throw error
    }
  }

  const scheduleBackup = async (backupData: Partial<Backup>) => {
    try {
      const response = await request<Backup>("/api/backups/schedule", "POST", backupData)
      if (response?.data) {
        setBackups((prev) => [response.data, ...prev])
        toast.success("Backup scheduled successfully")
        return response.data
      }
    } catch (error) {
      console.error("Error scheduling backup:", error)
      throw error
    }
  }

  const restoreBackup = async (
    id: string,
    restoreData: {
      targetLocation?: string
      options?: {
        dropExisting?: boolean
        overwriteFiles?: boolean
      }
    },
  ) => {
    try {
      const response = await request<{ jobId: string }>(`/api/backups/${id}/restore`, "POST", restoreData)
      if (response?.data) {
        toast.success("Restore process started")
        return response.data
      }
    } catch (error) {
      console.error("Error restoring backup:", error)
      throw error
    }
  }

  const validateBackup = async (id: string) => {
    try {
      const response = await request<{
        isValid: boolean
        checksum: string
        details: any
      }>(`/api/backups/${id}/validate`, "POST")

      if (response?.data) {
        if (response.data.isValid) {
          toast.success("Backup validation successful")
        } else {
          toast.error("Backup validation failed")
        }
        return response.data
      }
    } catch (error) {
      console.error("Error validating backup:", error)
      throw error
    }
  }

  const deleteBackup = async (id: string) => {
    try {
      await request(`/api/backups/${id}`, "DELETE")
      setBackups((prev) => prev.filter((backup) => backup._id !== id))
      toast.success("Backup deleted successfully")
    } catch (error) {
      console.error("Error deleting backup:", error)
      throw error
    }
  }

  const fetchBackupAnalytics = async (params?: {
    startDate?: string
    endDate?: string
  }) => {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const response = await request<BackupAnalytics>(
        `/api/backups/analytics${queryParams ? `?${queryParams}` : ""}`,
        "GET",
        undefined,
        false,
      )

      if (response?.data) {
        setAnalytics(response.data)
        return response.data
      }
    } catch (error) {
      console.error("Error fetching backup analytics:", error)
      toast.error("Failed to fetch backup analytics")
    }
  }

  return {
    backups,
    analytics,
    isLoading,
    fetchBackups,
    createBackup,
    scheduleBackup,
    restoreBackup,
    validateBackup,
    deleteBackup,
    fetchBackupAnalytics,
  }
}
