"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import { toast } from "sonner"

export interface Report {
  _id: string
  title: string
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
  metadata: {
    startTime?: string
    endTime?: string
    executionTime?: number
    recordCount?: number
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
      }>(`/api/reports${queryParams ? `?${queryParams}` : ""}`, "GET", undefined, false)

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
      const response = await request<Report>("/api/reports", "POST", reportData)
      if (response?.data) {
        setReports((prev) => [response.data, ...prev])
        toast.success("Report generation started")
        return response.data
      }
    } catch (error) {
      console.error("Error creating report:", error)
      throw error
    }
  }

  const scheduleReport = async (reportData: Partial<Report>) => {
    try {
      const response = await request<Report>("/api/reports/schedule", "POST", reportData)
      if (response?.data) {
        setReports((prev) => [response.data, ...prev])
        toast.success("Report scheduled successfully")
        return response.data
      }
    } catch (error) {
      console.error("Error scheduling report:", error)
      throw error
    }
  }

  const downloadReport = async (id: string, format: "json" | "excel" | "pdf" | "csv" = "json") => {
    try {
      const response = await fetch(`/api/reports/${id}/download?format=${format}`, {
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
      await request(`/api/reports/${id}`, "DELETE")
      setReports((prev) => prev.filter((report) => report._id !== id))
      toast.success("Report deleted successfully")
    } catch (error) {
      console.error("Error deleting report:", error)
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
        `/api/reports/analytics${queryParams ? `?${queryParams}` : ""}`,
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

  return {
    reports,
    analytics,
    isLoading,
    fetchReports,
    createReport,
    scheduleReport,
    downloadReport,
    deleteReport,
    fetchReportAnalytics,
  }
}
