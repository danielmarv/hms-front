"use client"

import { useState } from "react"
import { toast } from "sonner"

export function useEventReports() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to get revenue report
  const getRevenueReport = async (hotelId: string, startDate?: Date, endDate?: Date, groupBy = "month") => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      params.append("hotel_id", hotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())
      params.append("group_by", groupBy)

      const response = await fetch(`/api/events/reports/revenue?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Error fetching revenue report: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform dates from strings to Date objects if they exist
      if (data.data.date_range) {
        data.data.date_range.start = new Date(data.data.date_range.start)
        data.data.date_range.end = new Date(data.data.date_range.end)
      }

      return data.data
    } catch (err) {
      console.error("Failed to fetch revenue report:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch revenue report")
      toast.error("Failed to load revenue report")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to get event type report
  const getEventTypeReport = async (hotelId: string, startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      params.append("hotel_id", hotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())

      const response = await fetch(`/api/events/reports/event-types?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Error fetching event type report: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform dates from strings to Date objects if they exist
      if (data.data.date_range) {
        data.data.date_range.start = new Date(data.data.date_range.start)
        data.data.date_range.end = new Date(data.data.date_range.end)
      }

      return data.data
    } catch (err) {
      console.error("Failed to fetch event type report:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch event type report")
      toast.error("Failed to load event type report")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to get venue utilization report
  const getVenueUtilizationReport = async (hotelId: string, startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      params.append("hotel_id", hotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())

      const response = await fetch(`/api/events/reports/venues?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Error fetching venue utilization report: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform dates from strings to Date objects if they exist
      if (data.data.date_range) {
        data.data.date_range.start = new Date(data.data.date_range.start)
        data.data.date_range.end = new Date(data.data.date_range.end)
      }

      return data.data
    } catch (err) {
      console.error("Failed to fetch venue utilization report:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch venue utilization report")
      toast.error("Failed to load venue utilization report")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to get service popularity report
  const getServicePopularityReport = async (hotelId: string, startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      params.append("hotel_id", hotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())

      const response = await fetch(`/api/events/reports/services?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Error fetching service popularity report: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform dates from strings to Date objects if they exist
      if (data.data.date_range) {
        data.data.date_range.start = new Date(data.data.date_range.start)
        data.data.date_range.end = new Date(data.data.date_range.end)
      }

      return data.data
    } catch (err) {
      console.error("Failed to fetch service popularity report:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch service popularity report")
      toast.error("Failed to load service popularity report")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to get feedback report
  const getFeedbackReport = async (hotelId: string, startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      params.append("hotel_id", hotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())

      const response = await fetch(`/api/events/reports/feedback?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Error fetching feedback report: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform dates from strings to Date objects if they exist
      if (data.data.date_range) {
        data.data.date_range.start = new Date(data.data.date_range.start)
        data.data.date_range.end = new Date(data.data.date_range.end)
      }

      return data.data
    } catch (err) {
      console.error("Failed to fetch feedback report:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch feedback report")
      toast.error("Failed to load feedback report")
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Function to generate custom report
  const generateCustomReport = async (
    hotelId: string,
    startDate?: Date,
    endDate?: Date,
    metrics: string[] = [],
    dimensions: string[] = [],
    filters: Record<string, string> = {},
    sortBy?: string,
    limit?: number,
  ) => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      params.append("hotel_id", hotelId)
      if (startDate) params.append("start_date", startDate.toISOString())
      if (endDate) params.append("end_date", endDate.toISOString())

      metrics.forEach((metric) => params.append("metrics[]", metric))
      dimensions.forEach((dimension) => params.append("dimensions[]", dimension))

      Object.entries(filters).forEach(([key, value]) => {
        params.append(`filters[${key}]`, value)
      })

      if (sortBy) params.append("sort_by", sortBy)
      if (limit) params.append("limit", limit.toString())

      const response = await fetch(`/api/events/reports/custom?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Error generating custom report: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform dates from strings to Date objects if they exist
      if (data.data.date_range) {
        data.data.date_range.start = new Date(data.data.date_range.start)
        data.data.date_range.end = new Date(data.data.date_range.end)
      }

      return data.data
    } catch (err) {
      console.error("Failed to generate custom report:", err)
      setError(err instanceof Error ? err.message : "Failed to generate custom report")
      toast.error("Failed to generate custom report")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getRevenueReport,
    getEventTypeReport,
    getVenueUtilizationReport,
    getServicePopularityReport,
    getFeedbackReport,
    generateCustomReport,
  }
}
