"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"

export interface ReportDateRange {
  start: Date
  end: Date
}

export interface RevenueReport {
  total_revenue: number
  average_revenue_per_event: number
  revenue_by_period: {
    period: string
    revenue: number
  }[]
  revenue_by_event_type: {
    event_type: string
    revenue: number
    percentage: number
  }[]
  date_range: ReportDateRange
}

export interface EventTypeReport {
  total_events: number
  event_types: {
    name: string
    count: number
    percentage: number
  }[]
  date_range: ReportDateRange
}

export interface VenueUtilizationReport {
  venues: {
    name: string
    total_hours: number
    utilization_rate: number
    revenue: number
    events_count: number
  }[]
  date_range: ReportDateRange
}

export interface ServicePopularityReport {
  services: {
    name: string
    category: string
    count: number
    revenue: number
    popularity_score: number
  }[]
  date_range: ReportDateRange
}

export interface FeedbackReport {
  average_rating: number
  rating_distribution: {
    rating: number
    count: number
    percentage: number
  }[]
  feedback_by_category: {
    category: string
    average_rating: number
    count: number
  }[]
  recent_feedback: {
    event_id: string
    event_name: string
    rating: number
    comment: string
    date: Date
  }[]
  date_range: ReportDateRange
}

export function useEventReports(hotelId?: string) {
  const { request, isLoading } = useApi()
  const [error, setError] = useState<string | null>(null)

  // Function to get revenue report
  const getRevenueReport = useCallback(
    async (reportHotelId: string = hotelId || "", startDate?: Date, endDate?: Date, groupBy = "month") => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      // Build query parameters
      const params = new URLSearchParams()
      params.append("hotel_id", reportHotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())
      params.append("group_by", groupBy)

      const response = await request<RevenueReport>(`/events/reports/revenue?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Transform dates from strings to Date objects
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
    [request, hotelId],
  )

  // Function to get event type report
  const getEventTypeReport = useCallback(
    async (reportHotelId: string = hotelId || "", startDate?: Date, endDate?: Date) => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      // Build query parameters
      const params = new URLSearchParams()
      params.append("hotel_id", reportHotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())

      const response = await request<EventTypeReport>(`/events/reports/event-types?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Transform dates from strings to Date objects
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
    [request, hotelId],
  )

  // Function to get venue utilization report
  const getVenueUtilizationReport = useCallback(
    async (reportHotelId: string = hotelId || "", startDate?: Date, endDate?: Date) => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      // Build query parameters
      const params = new URLSearchParams()
      params.append("hotel_id", reportHotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())

      const response = await request<VenueUtilizationReport>(`/events/reports/venues?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Transform dates from strings to Date objects
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
    [request, hotelId],
  )

  // Function to get service popularity report
  const getServicePopularityReport = useCallback(
    async (reportHotelId: string = hotelId || "", startDate?: Date, endDate?: Date) => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      // Build query parameters
      const params = new URLSearchParams()
      params.append("hotel_id", reportHotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())

      const response = await request<ServicePopularityReport>(`/events/reports/services?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Transform dates from strings to Date objects
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
    [request, hotelId],
  )

  // Function to get feedback report
  const getFeedbackReport = useCallback(
    async (reportHotelId: string = hotelId || "", startDate?: Date, endDate?: Date) => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      // Build query parameters
      const params = new URLSearchParams()
      params.append("hotel_id", reportHotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())

      const response = await request<FeedbackReport>(`/events/reports/feedback?${params.toString()}`, "GET")

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Transform dates from strings to Date objects
        const transformedData = {
          ...response.data,
          date_range: {
            start: new Date(response.data.date_range.start),
            end: new Date(response.data.date_range.end),
          },
          recent_feedback: response.data.recent_feedback.map((feedback) => ({
            ...feedback,
            date: new Date(feedback.date),
          })),
        }

        return transformedData
      }

      return null
    },
    [request, hotelId],
  )

  // Function to generate custom report
  const generateCustomReport = useCallback(
    async (
      reportHotelId: string = hotelId || "",
      startDate?: Date,
      endDate?: Date,
      metrics: string[] = [],
      dimensions: string[] = [],
      filters: Record<string, string> = {},
      sortBy?: string,
      limit?: number,
    ) => {
      if (!reportHotelId) {
        setError("Hotel ID is required")
        return null
      }

      // Build request body
      const requestBody = {
        hotel_id: reportHotelId,
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString(),
        metrics,
        dimensions,
        filters,
        sort_by: sortBy,
        limit,
      }

      const response = await request<any>(`/events/reports/custom`, "POST", requestBody)

      if (response.error) {
        setError(response.error)
        return null
      }

      if (response.data) {
        // Transform dates from strings to Date objects if they exist
        if (response.data.date_range) {
          return {
            ...response.data,
            date_range: {
              start: new Date(response.data.date_range.start),
              end: new Date(response.data.date_range.end),
            },
          }
        }

        return response.data
      }

      return null
    },
    [request, hotelId],
  )

  return {
    loading: isLoading,
    error,
    getRevenueReport,
    getEventTypeReport,
    getVenueUtilizationReport,
    getServicePopularityReport,
    getFeedbackReport,
    generateCustomReport,
  }
}
