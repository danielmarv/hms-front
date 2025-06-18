"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface Report {
  _id: string
  title: string
  name?: string // For backward compatibility
  description?: string
  type: "analytics" | "financial" | "operational" | "system" | "audit" | "custom"
  status: "pending" | "processing" | "completed" | "failed"
  format: "json" | "pdf" | "excel" | "csv"
  parameters: {
    startDate?: string
    endDate?: string
    modules?: string[]
    filters?: Record<string, any>
    groupBy?: string
  }
  data?: any
  filePath?: string
  fileName?: string
  fileSize?: number
  generatedBy: string
  scheduledFor?: string
  isScheduled: boolean
  frequency?: "once" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  nextRun?: string
  recipients?: Array<{
    email: string
    name: string
  }>
  emailNotification?: {
    enabled: boolean
    recipients: string[]
    subject?: string
    includeAttachment?: boolean
  }
  schedule?: {
    frequency: "hourly" | "daily" | "weekly" | "monthly"
    time: string
    dayOfWeek?: number
    dayOfMonth?: number
    isActive: boolean
    nextExecution?: string
  }
  parentReportId?: string
  metadata: {
    startTime?: string
    endTime?: string
    executionTime?: number
    recordCount?: number
    error?: string
    errorMessage?: string
  }
  createdAt: string
  updatedAt: string
}

export interface ReportAnalytics {
  _id: string
  statuses: Array<{
    status: string
    count: number
    avgExecutionTime: number
  }>
  totalReports: number
}

export const useReports = () => {
  const { request, isLoading } = useApi()
  const [reports, setReports] = useState<Report[]>([])
  const [analytics, setAnalytics] = useState<ReportAnalytics[]>([])

  const fetchReports = async (params?: {
    page?: number
    limit?: number
    type?: string
    status?: string
  }) => {
    try {
      const queryParams = new URLSearchParams(params as any).toString()
      const response = await request<{
        reports: Report[]
        pagination: { current: number; pages: number; total: number }
      }>(`/reports${queryParams ? `?${queryParams}` : ""}`, "GET", undefined, false)

      if (response?.data) {
        setReports(response.data.reports)
        return response.data
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast.error("Failed to fetch reports")
    }
  }

  const createReport = async (reportData: Partial<Report>) => {
    try {
      const response = await request<Report>("/reports", "POST", reportData)
      if (response?.data) {
        setReports((prev) => [response.data, ...prev])
        toast.success("Report generation started")
        return response.data
      }
    } catch (error) {
      console.error("Error creating report:", error)
      toast.error("Failed to create report")
      throw error
    }
  }

  const scheduleReport = async (reportData: Partial<Report>) => {
    try {
      const response = await request<Report>("/reports/schedule", "POST", reportData)
      if (response?.data) {
        setReports((prev) => [response.data, ...prev])
        toast.success("Report scheduled successfully")
        return response.data
      }
    } catch (error) {
      console.error("Error scheduling report:", error)
      toast.error("Failed to schedule report")
      throw error
    }
  }

  const triggerDailyReport = async () => {
    try {
      const response = await request<{
        message: string
        data: Report
      }>("/reports/trigger-daily", "POST")

      if (response?.data) {
        toast.success("Daily report triggered successfully")
        // Refresh reports list to show the new daily report
        await fetchReports()
        return response.data
      }
    } catch (error) {
      console.error("Error triggering daily report:", error)
      toast.error("Failed to trigger daily report")
      throw error
    }
  }

  const downloadReport = async (id: string, format: "json" | "excel" | "pdf" | "csv" = "json") => {
    try {
      const response = await fetch(`${API_URL}/reports/${id}/download?format=${format}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Download failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `report-${id}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Report downloaded successfully")
    } catch (error) {
      console.error("Error downloading report:", error)
      toast.error("Failed to download report")
      throw error
    }
  }

  const deleteReport = async (id: string) => {
    try {
      await request(`/reports/${id}`, "DELETE")
      setReports((prev) => prev.filter((report) => report._id !== id))
      toast.success("Report deleted successfully")
    } catch (error) {
      console.error("Error deleting report:", error)
      toast.error("Failed to delete report")
      throw error
    }
  }

  const fetchReportAnalytics = async (params?: {
    startDate?: string
    endDate?: string
  }) => {
    try {
      const queryParams = new URLSearchParams(params as any).toString()
      const response = await request<ReportAnalytics[]>(
        `/reports/analytics${queryParams ? `?${queryParams}` : ""}`,
        "GET",
        undefined,
        false,
      )

      if (response?.data) {
        setAnalytics(response.data)
        return response.data
      }
    } catch (error) {
      console.error("Error fetching report analytics:", error)
      toast.error("Failed to fetch report analytics")
    }
  }

  const getReport = async (id: string) => {
    try {
      const response = await request<Report>(`/reports/${id}`, "GET", undefined, false)
      if (response?.data) {
        return response.data
      }
    } catch (error) {
      console.error("Error fetching report:", error)
      toast.error("Failed to fetch report details")
      throw error
    }
  }

  return {
    reports,
    analytics,
    isLoading,
    fetchReports,
    createReport,
    scheduleReport,
    triggerDailyReport,
    downloadReport,
    deleteReport,
    fetchReportAnalytics,
    getReport,
  }
}
