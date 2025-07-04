"use client"

import { useState, useCallback } from "react"
import { useApi } from "./use-api"

export type ActivityLog = {
  _id: string
  user: {
    _id: string
    full_name: string
    email: string
  }
  action: string
  entity: string
  entityId: string
  details: {
    before?: any
    after?: any
    metadata?: any
  }
  ipAddress?: string
  userAgent?: string
  timestamp: string
  createdAt: string
}

export type ActivityLogFilters = {
  user?: string
  action?: string
  entity?: string
  entityId?: string
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
  sort?: string
}

export function useActivityLog() {
  const { request, isLoading } = useApi()
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])

  const getActivityLogs = useCallback(
    async (filters: ActivityLogFilters = {}) => {
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString())
        }
      })

      const url = `/activity-logs${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
      const { data, error } = await request(url)

      if (error) {
        console.error("API error:", error)
        setActivityLogs([])
        return { data: [], total: 0 }
      }

      let logsData: ActivityLog[] = []
      let total = 0
      let pagination = null

      if (data) {
        if (Array.isArray(data)) {
          logsData = data
          total = data.length
        } else if (data.data && Array.isArray(data.data)) {
          logsData = data.data
          total = data.total || data.data.length
          pagination = data.pagination
        }
      }

      setActivityLogs(logsData)
      return { data: { data: logsData, total, pagination } }
    },
    [request],
  )

  const logActivity = useCallback(
    async (activityData: {
      action: string
      entity: string
      entityId: string
      details?: any
    }) => {
      const { data, error } = await request("/activity-logs", "POST", activityData)

      if (!error && data?.success && data.data) {
        setActivityLogs((prev) => [data.data, ...prev])
      }

      return {
        data: error || !data?.success ? null : data?.data,
        error: error || (data?.success === false ? data?.message : null),
      }
    },
    [request],
  )

  const getRecentActivity = useCallback(
    async (limit = 10) => {
      const response = await getActivityLogs({
        limit,
        sort: "-createdAt",
      })
      return response.data?.data || []
    },
    [getActivityLogs],
  )

  const getUserActivity = useCallback(
    async (userId: string, limit = 20) => {
      const response = await getActivityLogs({
        user: userId,
        limit,
        sort: "-createdAt",
      })
      return response.data?.data || []
    },
    [getActivityLogs],
  )

  const getEntityActivity = useCallback(
    async (entity: string, entityId: string, limit = 20) => {
      const response = await getActivityLogs({
        entity,
        entityId,
        limit,
        sort: "-createdAt",
      })
      return response.data?.data || []
    },
    [getActivityLogs],
  )

  return {
    activityLogs,
    isLoading,
    getActivityLogs,
    logActivity,
    getRecentActivity,
    getUserActivity,
    getEntityActivity,
  }
}
