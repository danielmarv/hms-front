"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"

export interface ReportDateRange {
  start: Date
  end: Date
}

export interface EventsSummaryReport {
  hotel_id: string
  date_range: ReportDateRange
  summary: {
    total_events: number
    confirmed_events: number
    cancelled_events: number
    cancellation_rate: string
    total_revenue: number
  }
}

export interface RevenueAnalysisReport {
  hotel_id: string
  date_range: ReportDateRange
  group_by: string
  total_events: number
  total_revenue: number
  data: Array<{
    period?: string
    id?: string
    name?: string
    type?: string
    color?: string
    count: number
    revenue: number
  }>
}

export interface VenueUtilizationReport {
  hotel_id: string
  date_range: ReportDateRange
  summary: {
    total_venues: number
    total_available_hours: number
    total_booked_hours: number
    overall_utilization_rate: string
    total_revenue: number
    total_events: number
    revenue_per_hour: number
  }
  venues: Array<{
    id: string
    name: string
    type: string
    capacity: number
    total_available_hours: number
    booked_hours: number
    utilization_rate: string
    revenue: number
    events: number
    avg_duration: number
    total_duration: number
  }>
}

export interface StaffPerformanceReport {
  hotel_id: string
  date_range: ReportDateRange
  staff_performance: Array<{
    _id: string
    staff_name: string
    role: string
    events_assigned: number
    total_hours: number
    total_cost: number
  }>
}

export interface ServicePopularityReport {
  hotel_id: string
  date_range: ReportDateRange
  summary: {
    total_bookings: number
    total_services_used: number
    total_service_revenue: number
    total_service_quantity: number
    avg_services_per_booking: string
  }
  services: Array<{
    service_id: string
    service_name: string
    booking_count: number
    booking_percentage: string
    total_quantity: number
    total_revenue: number
    avg_quantity_per_booking: string
    avg_revenue_per_booking: string
  }>
}

export interface CustomerSatisfactionReport {
  hotel_id: string
  date_range: ReportDateRange
  summary: {
    total_feedback: number
    overall_rating: string
    category_ratings: Record<string, string>
    rating_distribution: {
      ratings: number[]
      counts: number[]
      percentages: string[]
    }
  }
  venue_ratings: Array<{
    id: string
    name: string
    count: number
    rating: string
  }>
  event_type_ratings: Array<{
    id: string
    name: string
    count: number
    rating: string
  }>
  monthly_ratings: Array<{
    month: string
    count: number
    rating: string
  }>
}

export interface CustomReportResult {
  hotel_id: string
  date_range: ReportDateRange
  dimensions: string[]
  metrics: string[]
  filters: Record<string, any>
  sort_by: string
  limit: number
  results: Array<Record<string, any>>
}

export interface DashboardData {
  hotel_id: string
  period: string
  dashboard_data: {
    total_events: number
    confirmed_events: number
    total_revenue: number
    avg_attendees: number
  }
}

export interface KPIData {
  hotel_id: string
  kpis: Array<{
    _id: {
      month: number
      year: number
    }
    total_events: number
    confirmed_events: number
    total_revenue: number
    total_attendees: number
  }>
}

export interface ScheduledReport {
  id: string
  hotel_id: string
  report_type: string
  schedule: string
  recipients: string[]
  created_at: Date
  next_run: Date
  status: string
}

export function useEventReports(hotelId?: string) {
  const { request, isLoading } = useApi()
  const [error, setError] = useState<string | null>(null)

  // Clear error helper
  const clearError = useCallback(() => setError(null), [])

  // Get events summary report
  const getEventsSummaryReport = useCallback(
    async (reportHotelId: string = hotelId || "", startDate?: Date, endDate?: Date) => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      clearError()
      const params = new URLSearchParams()
      params.append("hotel_id", reportHotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())

      const response = await request(`/event-report/events-summary?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        return {
          ...response.data,
          date_range: {
            start: new Date(response.data.date_range.start),
            end: new Date(response.data.date_range.end),
          },
        }
      }

      return null
    },
    [request, hotelId, clearError],
  )

  // Get revenue analysis report
  const getRevenueAnalysisReport = useCallback(
    async (reportHotelId: string = hotelId || "", startDate?: Date, endDate?: Date, groupBy = "month") => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      clearError()
      const params = new URLSearchParams()
      params.append("hotel_id", reportHotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())
      params.append("group_by", groupBy)

      const response = await request(
        `/event-report/revenue-analysis?${params.toString()}`,
        "GET",
      )

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        return {
          ...response.data,
          date_range: {
            start: new Date(response.data.date_range.start),
            end: new Date(response.data.date_range.end),
          },
        }
      }

      return null
    },
    [request, hotelId, clearError],
  )

  // Get venue utilization report
  const getVenueUtilizationReport = useCallback(
    async (reportHotelId: string = hotelId || "", startDate?: Date, endDate?: Date) => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      clearError()
      const params = new URLSearchParams()
      params.append("hotel_id", reportHotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())

      const response = await request(
        `/event-report/venue-utilization?${params.toString()}`,
        "GET",
      )

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        return {
          ...response.data,
          date_range: {
            start: new Date(response.data.date_range.start),
            end: new Date(response.data.date_range.end),
          },
        }
      }

      return null
    },
    [request, hotelId, clearError],
  )

  // Get staff performance report
  const getStaffPerformanceReport = useCallback(
    async (reportHotelId: string = hotelId || "", startDate?: Date, endDate?: Date) => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      clearError()
      const params = new URLSearchParams()
      params.append("hotel_id", reportHotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())

      const response = await request(
        `/event-report/staff-performance?${params.toString()}`,
        "GET",
      )

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        return {
          ...response.data,
          date_range: {
            start: new Date(response.data.date_range.start),
            end: new Date(response.data.date_range.end),
          },
        }
      }

      return null
    },
    [request, hotelId, clearError],
  )

  // Get service popularity report
  const getServicePopularityReport = useCallback(
    async (reportHotelId: string = hotelId || "", startDate?: Date, endDate?: Date) => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      clearError()
      const params = new URLSearchParams()
      params.append("hotel_id", reportHotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())

      const response = await request(`/event-report/services?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        return {
          ...response.data,
          date_range: {
            start: new Date(response.data.date_range.start),
            end: new Date(response.data.date_range.end),
          },
        }
      }

      return null
    },
    [request, hotelId, clearError],
  )

  // Get customer satisfaction report
  const getCustomerSatisfactionReport = useCallback(
    async (reportHotelId: string = hotelId || "", startDate?: Date, endDate?: Date) => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      clearError()
      const params = new URLSearchParams()
      params.append("hotel_id", reportHotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())

      const response = await request(
        `/event-report/customer-satisfaction?${params.toString()}`,
        "GET",
      )

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        return {
          ...response.data,
          date_range: {
            start: new Date(response.data.date_range.start),
            end: new Date(response.data.date_range.end),
          },
        }
      }

      return null
    },
    [request, hotelId, clearError],
  )

  // Generate custom report
  const generateCustomReport = useCallback(
    async (
      reportHotelId: string = hotelId || "",
      startDate?: Date,
      endDate?: Date,
      metrics: string[] = [],
      dimensions: string[] = [],
      filters: Record<string, any> = {},
      sortBy?: string,
      limit?: number,
    ) => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      clearError()
      const params = new URLSearchParams()
      params.append("hotel_id", reportHotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())
      if (metrics.length > 0) params.append("metrics", metrics.join(","))
      if (dimensions.length > 0) params.append("dimensions", dimensions.join(","))
      if (sortBy) params.append("sort_by", sortBy)
      if (limit) params.append("limit", limit.toString())

      // Add filters as separate parameters
      Object.entries(filters).forEach(([key, value]) => {
        params.append(`filters[${key}]`, value.toString())
      })

      const response = await request(`/event-report/custom?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        return {
          ...response.data,
          date_range: {
            start: new Date(response.data.date_range.start),
            end: new Date(response.data.date_range.end),
          },
        }
      }

      return null
    },
    [request, hotelId, clearError],
  )

  // Get custom report by ID
  const getCustomReport = useCallback(
    async (reportId: string) => {
      if (!reportId) {
        setError("Report ID is required")
        return null
      }

      clearError()
      const response = await request(`/event-report/custom/${reportId}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data
    },
    [request, clearError],
  )

  // Get dashboard data
  const getDashboardData = useCallback(
    async (reportHotelId: string = hotelId || "") => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      clearError()
      const params = new URLSearchParams()
      params.append("hotel_id", reportHotelId)

      const response = await request(`/event-report/dashboard?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data
    },
    [request, hotelId, clearError],
  )

  // Get KPIs
  const getKPIs = useCallback(
    async (reportHotelId: string = hotelId || "") => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      clearError()
      const params = new URLSearchParams()
      params.append("hotel_id", reportHotelId)

      const response = await request(`/event-report/kpis?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data
    },
    [request, hotelId, clearError],
  )

  // Get scheduled reports
  const getScheduledReports = useCallback(
    async (reportHotelId: string = hotelId || "") => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      clearError()
      const params = new URLSearchParams()
      params.append("hotel_id", reportHotelId)

      const response = await request(
        `/event-report/scheduled?${params.toString()}`,
        "GET",
      )

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data?.scheduled_reports || []
    },
    [request, hotelId, clearError],
  )

  // Schedule a report
  const scheduleReport = useCallback(
    async (reportHotelId: string = hotelId || "", reportType: string, schedule: string, recipients: string[]) => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      clearError()
      const requestBody = {
        hotel_id: reportHotelId,
        report_type: reportType,
        schedule,
        recipients,
      }

      const response = await request(`/event-report/schedule`, "POST", requestBody)

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data
    },
    [request, hotelId, clearError],
  )

  // Delete scheduled report
  const deleteScheduledReport = useCallback(
    async (scheduleId: string) => {
      if (!scheduleId) {
        setError("Schedule ID is required")
        return null
      }

      clearError()
      const response = await request(`/event-report/schedule/${scheduleId}`, "DELETE")

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data
    },
    [request, clearError],
  )

  // Export report to PDF
  const exportReportToPDF = useCallback(
    async (reportId: string) => {
      if (!reportId) {
        setError("Report ID is required")
        return null
      }

      clearError()
      const response = await request(`/event-report/${reportId}/export/pdf`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data
    },
    [request, clearError],
  )

  // Export report to Excel
  const exportReportToExcel = useCallback(
    async (reportId: string) => {
      if (!reportId) {
        setError("Report ID is required")
        return null
      }

      clearError()
      const response = await request(`/event-report/${reportId}/export/excel`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data
    },
    [request, clearError],
  )

  // Export report to CSV
  const exportReportToCSV = useCallback(
    async (reportId: string) => {
      if (!reportId) {
        setError("Report ID is required")
        return null
      }

      clearError()
      const response = await request(`/event-report/${reportId}/export/csv`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      return response.data
    },
    [request, clearError],
  )

  return {
    loading: isLoading,
    error,
    clearError,
    // Standard Reports
    getEventsSummaryReport,
    getRevenueAnalysisReport,
    getVenueUtilizationReport,
    getStaffPerformanceReport,
    getServicePopularityReport,
    getCustomerSatisfactionReport,
    // Custom Reports
    generateCustomReport,
    getCustomReport,
    // Dashboard & Analytics
    getDashboardData,
    getKPIs,
    // Report Management
    getScheduledReports,
    scheduleReport,
    deleteScheduledReport,
    // Export Functions
    exportReportToPDF,
    exportReportToExcel,
    exportReportToCSV,
  }
}
