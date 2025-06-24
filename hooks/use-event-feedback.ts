"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"

// Types
export interface EventFeedback {
  _id: string
  event: string // Changed from booking to event to match backend
  customer: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  hotel: string
  eventType?: {
    _id: string
    name: string
    category: string
  }
  venue?: {
    _id: string
    name: string
    type: string
  }
  rating: number
  comments?: string
  categories: Array<{
    name: string
    rating: number
  }>
  response?: string
  responseDate?: Date
  respondedBy?: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  isResponded: boolean
  attendeeCount?: number
  wouldRecommend?: boolean
  improvements?: string
  submissionMethod?: "web" | "email" | "mobile" | "phone"
  isPublic?: boolean
  createdBy: string
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface FeedbackFilters {
  hotel?: string
  event?: string
  eventType?: string
  venue?: string
  customer?: string
  rating_min?: number
  rating_max?: number
  isResponded?: boolean
  isPublic?: boolean
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
  sort?: string
}

export interface CreateFeedbackData {
  event: string
  customer: string
  hotel: string
  rating: number
  comments?: string
  categories?: Array<{
    name: string
    rating: number
  }>
  attendeeCount?: number
  wouldRecommend?: boolean
  improvements?: string
  submissionMethod?: "web" | "email" | "mobile" | "phone"
  isPublic?: boolean
}

export interface UpdateFeedbackData {
  rating?: number
  comments?: string
  categories?: Array<{
    name: string
    rating: number
  }>
  attendeeCount?: number
  wouldRecommend?: boolean
  improvements?: string
  isPublic?: boolean
}

export interface FeedbackResponse {
  response: string
}

export interface FeedbackStatistics {
  totalFeedback: number
  averageRating: number
  responseRate: number
  recommendationRate: number
  ratingDistribution: number[]
}

export interface FeedbackAnalytics {
  overall: FeedbackStatistics
  categoryAverages: Array<{
    name: string
    averageRating: number
    count: number
  }>
  eventTypeAnalytics: Array<{
    _id: string
    count: number
    averageRating: number
    recommendationRate: number
  }>
  venueAnalytics: Array<{
    _id: string
    count: number
    averageRating: number
    recommendationRate: number
  }>
}

export interface EventFeedbackSummary {
  event: {
    id: string
    title: string
    start_date: Date
    end_date: Date
  }
  feedback: EventFeedback[]
  statistics: FeedbackStatistics
  pagination: {
    total: number
    page: number
    pages: number
    limit: number
  }
}

export interface FeedbackTrend {
  _id: string
  count: number
  averageRating: number
}

export interface FeedbackStatisticsResponse {
  period: string
  dateRange: {
    start: Date
    end: Date
  }
  statistics: FeedbackStatistics
  trend: FeedbackTrend[]
}

export interface BulkExportFilters {
  hotel?: string
  event?: string
  eventType?: string
  venue?: string
  start_date?: string
  end_date?: string
  rating_min?: number
  rating_max?: number
}

export interface BulkExportData {
  data: Array<{
    id: string
    event: string
    customer: string
    customerEmail: string
    rating: number
    comments: string
    wouldRecommend: string
    attendeeCount: number
    submissionMethod: string
    isResponded: string
    response: string
    responseDate: string
    respondedBy: string
    createdAt: Date
  }>
  count: number
  format: string
  exportedAt: Date
}

export const useEventFeedback = () => {
  const { request } = useApi()
  const [feedback, setFeedback] = useState<EventFeedback[]>([])
  const [currentFeedback, setCurrentFeedback] = useState<EventFeedback | null>(null)
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null)
  const [statistics, setStatistics] = useState<FeedbackStatisticsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all feedback with filters
  const fetchFeedback = useCallback(
    async (filters: FeedbackFilters = {}) => {
      setLoading(true)
      setError(null)
      try {
        const response = await request("/event-feedback", "GET", undefined, filters)
        setFeedback(response.data.feedback || [])
        return response.data
      } catch (err: any) {
        setError(err.message || "Failed to fetch feedback")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Get feedback by ID
  const getFeedbackById = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        const response = await request(`/event-feedback/${id}`, "GET")
        setCurrentFeedback(response.data)
        return response.data
      } catch (err: any) {
        setError(err.message || "Failed to fetch feedback")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Create new feedback
  const createFeedback = useCallback(
    async (data: CreateFeedbackData) => {
      setLoading(true)
      setError(null)
      try {
        const response = await request("/event-feedback", "POST", data)
        const newFeedback = response.data
        setFeedback((prev) => [newFeedback, ...prev])
        return newFeedback
      } catch (err: any) {
        setError(err.message || "Failed to create feedback")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Update feedback
  const updateFeedback = useCallback(
    async (id: string, data: UpdateFeedbackData) => {
      setLoading(true)
      setError(null)
      try {
        const response = await request(`/event-feedback/${id}`, "PUT", data)
        const updatedFeedback = response.data
        setFeedback((prev) => prev.map((item) => (item._id === id ? updatedFeedback : item)))
        if (currentFeedback?._id === id) {
          setCurrentFeedback(updatedFeedback)
        }
        return updatedFeedback
      } catch (err: any) {
        setError(err.message || "Failed to update feedback")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request, currentFeedback],
  )

  // Delete feedback
  const deleteFeedback = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        await request(`/event-feedback/${id}`, "DELETE")
        setFeedback((prev) => prev.filter((item) => item._id !== id))
        if (currentFeedback?._id === id) {
          setCurrentFeedback(null)
        }
        return true
      } catch (err: any) {
        setError(err.message || "Failed to delete feedback")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request, currentFeedback],
  )

  // Get event feedback
  const getEventFeedback = useCallback(
    async (eventId: string, params: { page?: number; limit?: number; sort?: string } = {}) => {
      setLoading(true)
      setError(null)
      try {
        const response = await request(`/event-feedback/event/${eventId}`, "GET", undefined, params)
        return response.data as EventFeedbackSummary
      } catch (err: any) {
        setError(err.message || "Failed to fetch event feedback")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Create event feedback
  const createEventFeedback = useCallback(
    async (eventId: string, data: Omit<CreateFeedbackData, "event" | "hotel">) => {
      setLoading(true)
      setError(null)
      try {
        const response = await request(`/event-feedback/event/${eventId}`, "POST", data)
        const newFeedback = response.data
        setFeedback((prev) => [newFeedback, ...prev])
        return newFeedback
      } catch (err: any) {
        setError(err.message || "Failed to create event feedback")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Get feedback summary
  const getFeedbackSummary = useCallback(
    async (eventId: string) => {
      setLoading(true)
      setError(null)
      try {
        const response = await request(`/event-feedback/event/${eventId}/summary`, "GET")
        return response.data
      } catch (err: any) {
        setError(err.message || "Failed to fetch feedback summary")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Get feedback analytics
  const getFeedbackAnalytics = useCallback(
    async (params: {
      hotel: string
      start_date?: string
      end_date?: string
      eventType?: string
      venue?: string
    }) => {
      setLoading(true)
      setError(null)
      try {
        const response = await request("/event-feedback/analytics", "GET", undefined, params)
        setAnalytics(response.data)
        return response.data as FeedbackAnalytics
      } catch (err: any) {
        setError(err.message || "Failed to fetch feedback analytics")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Respond to feedback
  const respondToFeedback = useCallback(
    async (id: string, data: FeedbackResponse) => {
      setLoading(true)
      setError(null)
      try {
        const response = await request(`/event-feedback/${id}/respond`, "POST", data)
        const updatedFeedback = response.data
        setFeedback((prev) => prev.map((item) => (item._id === id ? updatedFeedback : item)))
        if (currentFeedback?._id === id) {
          setCurrentFeedback(updatedFeedback)
        }
        return updatedFeedback
      } catch (err: any) {
        setError(err.message || "Failed to respond to feedback")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request, currentFeedback],
  )

  // Get feedback responses
  const getFeedbackResponses = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        const response = await request(`/event-feedback/${id}/responses`, "GET")
        return response.data
      } catch (err: any) {
        setError(err.message || "Failed to fetch feedback responses")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Bulk export feedback
  const bulkExportFeedback = useCallback(
    async (filters: BulkExportFilters, format = "csv") => {
      setLoading(true)
      setError(null)
      try {
        const response = await request("/event-feedback/bulk-export", "POST", { filters, format })
        return response.data as BulkExportData
      } catch (err: any) {
        setError(err.message || "Failed to export feedback")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Get feedback statistics
  const getFeedbackStatistics = useCallback(
    async (hotel: string, period: "week" | "month" | "quarter" | "year" = "month") => {
      setLoading(true)
      setError(null)
      try {
        const response = await request("/event-feedback/statistics", "GET", undefined, { hotel, period })
        setStatistics(response.data)
        return response.data as FeedbackStatisticsResponse
      } catch (err: any) {
        setError(err.message || "Failed to fetch feedback statistics")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  // Utility functions
  const calculateAverageRating = useCallback((feedbackList: EventFeedback[]) => {
    if (feedbackList.length === 0) return 0
    const total = feedbackList.reduce((sum, item) => sum + item.rating, 0)
    return Math.round((total / feedbackList.length) * 100) / 100
  }, [])

  const getRatingDistribution = useCallback((feedbackList: EventFeedback[]) => {
    const distribution = [0, 0, 0, 0, 0] // 1-5 stars
    feedbackList.forEach((item) => {
      if (item.rating >= 1 && item.rating <= 5) {
        distribution[item.rating - 1]++
      }
    })
    return distribution
  }, [])

  const getResponseRate = useCallback((feedbackList: EventFeedback[]) => {
    if (feedbackList.length === 0) return 0
    const respondedCount = feedbackList.filter((item) => item.isResponded).length
    return Math.round((respondedCount / feedbackList.length) * 100)
  }, [])

  const getRecommendationRate = useCallback((feedbackList: EventFeedback[]) => {
    const withRecommendation = feedbackList.filter((item) => item.wouldRecommend !== undefined)
    if (withRecommendation.length === 0) return 0
    const recommendedCount = withRecommendation.filter((item) => item.wouldRecommend).length
    return Math.round((recommendedCount / withRecommendation.length) * 100)
  }, [])

  const filterFeedbackByRating = useCallback((feedbackList: EventFeedback[], minRating: number, maxRating = 5) => {
    return feedbackList.filter((item) => item.rating >= minRating && item.rating <= maxRating)
  }, [])

  const searchFeedback = useCallback((feedbackList: EventFeedback[], searchTerm: string) => {
    const term = searchTerm.toLowerCase()
    return feedbackList.filter(
      (item) =>
        item.comments?.toLowerCase().includes(term) ||
        item.customer.firstName.toLowerCase().includes(term) ||
        item.customer.lastName.toLowerCase().includes(term) ||
        item.customer.email.toLowerCase().includes(term) ||
        item.improvements?.toLowerCase().includes(term),
    )
  }, [])

  return {
    // State
    feedback,
    currentFeedback,
    analytics,
    statistics,
    loading,
    error,

    // Actions
    fetchFeedback,
    getFeedbackById,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    getEventFeedback,
    createEventFeedback,
    getFeedbackSummary,
    getFeedbackAnalytics,
    respondToFeedback,
    getFeedbackResponses,
    bulkExportFeedback,
    getFeedbackStatistics,

    // Utilities
    calculateAverageRating,
    getRatingDistribution,
    getResponseRate,
    getRecommendationRate,
    filterFeedbackByRating,
    searchFeedback,

    // Setters for manual state management
    setFeedback,
    setCurrentFeedback,
    setAnalytics,
    setStatistics,
    setError,
  }
}

export default useEventFeedback
